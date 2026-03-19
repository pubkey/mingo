import { ComputeOptions, OpType } from "../../core/_internal";
import { concat, Lazy } from "../../lazy";
import { assert, isNumber, isOperator, isString } from "../../util";
import { $function } from "../expression/custom/function";
import { $dateAdd } from "../expression/date/dateAdd";
import { $addFields } from "./addFields";
import { $group } from "./group";
import { $sort } from "./sort";
const SORT_REQUIRED_OPS = [
  "$denseRank",
  "$documentNumber",
  "$first",
  "$last",
  "$linearFill",
  "$rank",
  "$shift"
];
const WINDOW_UNBOUNDED_OPS = [
  "$denseRank",
  "$expMovingAvg",
  "$linearFill",
  "$locf",
  "$rank",
  "$shift"
];
const isUnbounded = (window) => {
  const boundary = window?.documents || window?.range;
  return !boundary || boundary[0] === "unbounded" && boundary[1] === "unbounded";
};
const OP = "$setWindowFields";
function $setWindowFields(coll, expr, options) {
  options = ComputeOptions.init(options);
  options.context.addExpressionOps({ $function });
  const operators = {};
  const entries = Object.entries(expr.output);
  for (const [field, outputExpr] of entries) {
    const keys = Object.keys(outputExpr);
    const op = keys.find(isOperator);
    const context = options.context;
    assert(
      op && (!!context.getOperator(OpType.WINDOW, op) || !!context.getOperator(OpType.ACCUMULATOR, op)),
      `${OP} '${op}' is not a valid window operator`
    );
    assert(
      keys.length > 0 && keys.length <= 2 && (keys.length == 1 || keys.includes("window")),
      `${OP} 'output' option should have a single window operator.`
    );
    if (outputExpr?.window) {
      const { documents, range } = outputExpr.window;
      assert(
        (+!!documents ^ +!!range) === 1,
        "'window' option supports only one of 'documents' or 'range'."
      );
    }
    operators[field] = op;
  }
  if (expr.sortBy) {
    coll = $sort(coll, expr.sortBy, options);
  }
  coll = $group(
    coll,
    {
      _id: expr.partitionBy,
      items: { $push: "$$CURRENT" }
    },
    options
  );
  return coll.transform((partitions) => {
    const iterators = [];
    const outputConfig = [];
    for (const [field, outputExpr] of entries) {
      const op = operators[field];
      const config = {
        operatorName: op,
        func: {
          left: options.context.getOperator(OpType.ACCUMULATOR, op),
          right: options.context.getOperator(OpType.WINDOW, op)
        },
        args: outputExpr[op],
        field,
        window: outputExpr.window
      };
      const unbounded = isUnbounded(config.window);
      if (unbounded == false || SORT_REQUIRED_OPS.includes(op)) {
        const suffix = unbounded ? `'${op}'` : "bounded window operations";
        assert(expr.sortBy, `${OP} 'sortBy' is required for ${suffix}.`);
      }
      assert(
        unbounded || !WINDOW_UNBOUNDED_OPS.includes(op),
        `${OP} cannot use bounded window for operator '${op}'.`
      );
      outputConfig.push(config);
    }
    partitions.forEach(((group) => {
      const items = group.items;
      let iterator = Lazy(items);
      const windowResultMap = {};
      for (const config of outputConfig) {
        const { func, args, field, window } = config;
        const makeResultFunc = (getItemsFn) => {
          let index = -1;
          return (obj) => {
            ++index;
            if (func.left) {
              return func.left(getItemsFn(obj, index), args, options);
            } else if (func.right) {
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
          const boundary = documents || range;
          if (!isUnbounded(window)) {
            const [begin, end] = boundary;
            const toBeginIndex = (currentIndex) => {
              if (begin == "current") return currentIndex;
              if (begin == "unbounded") return 0;
              return Math.max(begin + currentIndex, 0);
            };
            const toEndIndex = (currentIndex) => {
              if (end == "current") return currentIndex + 1;
              if (end == "unbounded") return items.length;
              return end + currentIndex + 1;
            };
            const getItems = (current, index) => {
              if (!!documents || boundary?.every(isString)) {
                return items.slice(toBeginIndex(index), toEndIndex(index));
              }
              const sortKey = Object.keys(expr.sortBy)[0];
              let lower;
              let upper;
              if (unit) {
                const startDate = new Date(current[sortKey]);
                const getTime = (amount) => {
                  const addExpr = { startDate, unit, amount };
                  const d = $dateAdd(current, addExpr, options);
                  return d.getTime();
                };
                lower = isNumber(begin) ? getTime(begin) : -Infinity;
                upper = isNumber(end) ? getTime(end) : Infinity;
              } else {
                const currentValue = current[sortKey];
                lower = isNumber(begin) ? currentValue + begin : -Infinity;
                upper = isNumber(end) ? currentValue + end : Infinity;
              }
              let i = begin == "current" ? index : 0;
              const sliceEnd = end == "current" ? index + 1 : items.length;
              const array = new Array();
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
        if (!windowResultMap[field]) {
          windowResultMap[field] = makeResultFunc((_) => items);
        }
        iterator = $addFields(
          iterator,
          {
            [field]: {
              $function: {
                body: (obj) => windowResultMap[field](obj),
                args: ["$$CURRENT"]
              }
            }
          },
          options
        );
      }
      iterators.push(iterator);
    }));
    return concat(...iterators);
  });
}
export {
  $setWindowFields
};
