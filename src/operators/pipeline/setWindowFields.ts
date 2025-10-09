import {
  AccumulatorOperator,
  ComputeOptions,
  Options,
  OpType,
  PipelineOperator,
  WindowOperator
} from "../../core";
import { concat, Iterator, Lazy } from "../../lazy";
import { Any, AnyObject, Callback } from "../../types";
import { assert, isNumber, isOperator, isString } from "../../util";
import { $function } from "../expression/custom/function";
import { $dateAdd } from "../expression/date/dateAdd";
import {
  Boundary,
  SetWindowFieldsInput,
  WindowOutputOption
} from "../window/_internal";
import { $addFields } from "./addFields";
import { $group } from "./group";
import { $sort } from "./sort";

// Operators that require 'sortBy' option.
const SORT_REQUIRED_OPS = new Set([
  "$denseRank",
  "$documentNumber",
  "$first",
  "$last",
  "$linearFill",
  "$rank",
  "$shift"
]);

// Operators that require unbounded 'window' option.
const WINDOW_UNBOUNDED_OPS = new Set([
  "$denseRank",
  "$expMovingAvg",
  "$linearFill",
  "$locf",
  "$rank",
  "$shift"
]);

/** Checks whether the specified window is unbounded. */
const isUnbounded = (window: WindowOutputOption): boolean => {
  const boundary = window?.documents || window?.range;
  return (
    !boundary || (boundary[0] === "unbounded" && boundary[1] === "unbounded")
  );
};

/**
 * Groups documents into windows and applies one or more operators to the documents in each window.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/setWindowFields/ usage}.
 *
 * @param collection
 * @param expr
 * @param options
 * @returns
 */
export const $setWindowFields: PipelineOperator = (
  collection: Iterator,
  expr: SetWindowFieldsInput,
  options: Options
): Iterator => {
  options = ComputeOptions.init(options);
  options.context.addExpressionOps({ $function });

  // validate inputs early since this can be an expensive operation.
  for (const outputExpr of Object.values(expr.output)) {
    const keys = Object.keys(outputExpr);
    const op = keys.find(isOperator);
    const context = options.context;
    assert(
      !!context.getOperator(OpType.WINDOW, op) ||
        !!context.getOperator(OpType.ACCUMULATOR, op),
      `'${op}' is not a valid window operator`
    );

    assert(
      keys.length > 0 &&
        keys.length <= 2 &&
        (keys.length == 1 || keys.includes("window")),
      "'output' option should have a single window operator."
    );

    if (outputExpr?.window) {
      const { documents, range } = outputExpr.window;
      assert(
        (+!!documents ^ +!!range) === 1,
        "'window' option supports only one of 'documents' or 'range'."
      );
    }
  }

  // we sort first if required
  if (expr.sortBy) {
    collection = $sort(collection, expr.sortBy, options);
  }

  // then partition collection
  collection = $group(
    collection,
    {
      _id: expr.partitionBy,
      items: { $push: "$$CURRENT" }
    },
    options
  );

  // transform values
  return collection.transform(((partitions: Any[]) => {
    // let iteratorIndex = 0;
    const iterators: Iterator[] = [];
    const outputConfig: Array<{
      operatorName: string;
      func: {
        left: AccumulatorOperator | null;
        right: WindowOperator | null;
      };
      args: Any;
      field: string;
      window: WindowOutputOption;
    }> = [];

    for (const [field, outputExpr] of Object.entries(expr.output)) {
      const op = Object.keys(outputExpr).find(isOperator);
      const config = {
        operatorName: op,
        func: {
          left: options.context.getOperator(
            OpType.ACCUMULATOR,
            op
          ) as AccumulatorOperator,
          right: options.context.getOperator(
            OpType.WINDOW,
            op
          ) as WindowOperator
        },
        args: outputExpr[op],
        field: field,
        window: outputExpr.window
      };
      // sortBy option required for specific operators or bounded window.
      assert(
        !!expr.sortBy || !(SORT_REQUIRED_OPS.has(op) || !config.window),
        `${
          SORT_REQUIRED_OPS.has(op) ? `'${op}'` : "bounded window operation"
        } requires a sortBy.`
      );
      // window must be unbounded for specific operators.
      assert(
        !config.window || !WINDOW_UNBOUNDED_OPS.has(op),
        `${op} does not accept a 'window' field.`
      );
      outputConfig.push(config);
    }

    // each parition maintains its own closure to process the documents in the window.
    partitions.forEach(((group: { items: Any[] }) => {
      // get the items to process
      const items = group.items as AnyObject[];

      // create an iterator per group.
      // we need the index of each document so we track it using a special field.
      let iterator = Lazy(items);

      // results map
      const windowResultMap: Record<string, (_: AnyObject) => Any> = {};

      for (const config of outputConfig) {
        const { func, args, field, window } = config;
        const makeResultFunc = (
          getItemsFn: (_: AnyObject, i: number) => AnyObject[]
        ) => {
          // closure for object index within the partition
          let index = -1;
          return (obj: AnyObject) => {
            ++index;

            // process accumulator function
            if (func.left) {
              return func.left(getItemsFn(obj, index), args, options);
            } else if (func.right) {
              // OR process 'window' function
              return func.right(
                obj,
                getItemsFn(obj, index),
                {
                  parentExpr: expr,
                  inputExpr: args,
                  documentNumber: index + 1,
                  field
                },
                // must use raw options only since it operates over a collection.
                options
              );
            }
          };
        };

        if (window) {
          const { documents, range, unit } = window;
          //  See definition: https://www.mongodb.com/docs/manual/reference/operator/aggregation/setWindowFields/#std-label-setWindowFields-range
          //  - A number to add to the value of the sortBy field for the current document.
          //  - A document is in the window if the sortBy field value is inclusively within the lower and upper boundaries.
          const boundary = documents || range;

          if (!isUnbounded(window)) {
            const [begin, end] = boundary as Boundary[];

            const toBeginIndex = (currentIndex: number): number => {
              if (begin == "current") return currentIndex;
              if (begin == "unbounded") return 0;
              return Math.max(begin + currentIndex, 0);
            };

            const toEndIndex = (currentIndex: number): number => {
              if (end == "current") return currentIndex + 1;
              if (end == "unbounded") return items.length;
              return end + currentIndex + 1;
            };

            const getItems = (
              current: AnyObject,
              index: number
            ): AnyObject[] => {
              // handle string boundaries or documents
              if (!!documents || boundary.every(isString)) {
                return items.slice(toBeginIndex(index), toEndIndex(index));
              }

              // handle range with numeric boundary values
              const sortKey = Object.keys(expr.sortBy)[0];
              let lower: number;
              let upper: number;

              if (unit) {
                // we are dealing with datetimes
                const getTime = (amount: number): number => {
                  return $dateAdd(
                    current,
                    {
                      startDate: new Date(current[sortKey] as Date),
                      unit,
                      amount
                    },
                    options
                  ).getTime();
                };
                lower = isNumber(begin) ? getTime(begin) : -Infinity;
                upper = isNumber(end) ? getTime(end) : Infinity;
              } else {
                const currentValue = current[sortKey] as number;
                lower = isNumber(begin) ? currentValue + begin : -Infinity;
                upper = isNumber(end) ? currentValue + end : Infinity;
              }

              let i = begin == "current" ? index : 0;
              const sliceEnd = end == "current" ? index + 1 : items.length;
              // look within the boundary and filter down
              const array = new Array<AnyObject>();
              while (i < sliceEnd) {
                const o = items[i++];
                const n = +o[sortKey];
                if (n >= lower && n <= upper) array.push(o);
              }
              return array;
            };

            windowResultMap[field] = makeResultFunc(getItems);
          }
        }

        // default action is to utilize the entire set of items
        if (!windowResultMap[field]) {
          windowResultMap[field] = makeResultFunc(_ => items);
        }

        // invoke add fields to get the desired behaviour using a custom function.
        iterator = $addFields(
          iterator,
          {
            [field]: {
              $function: {
                body: (obj: AnyObject) => windowResultMap[field](obj),
                args: ["$$CURRENT"]
              }
            }
          },
          options
        );
      }

      // add to iterator list
      iterators.push(iterator);
    }) as Callback);

    return concat(...iterators);
  }) as Callback<Iterator>);
};
