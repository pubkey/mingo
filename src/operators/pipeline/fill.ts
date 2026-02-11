import { Iterator } from "../../lazy";
import { Any, AnyObject, Options } from "../../types";
import { assert, has, isObject } from "../../util";
import { $ifNull } from "../expression/conditional/ifNull";
import type { SetWindowFieldsInput } from "../window/_internal";
import { $linearFill } from "../window/linearFill";
import { $locf } from "../window/locf";
import { $addFields } from "./addFields";
import { $setWindowFields } from "./setWindowFields";

type Output = [{ value: Any }, { method: "linear" | "locf" }];

interface InputExpr {
  partitionBy?: Any;
  partitionByFields?: string[];
  sortBy?: Record<string, 1 | -1>;
  output: Record<string, Output[number]>;
}

const FILL_METHODS: Record<string, string> = {
  locf: "$locf",
  linear: "$linearFill"
};

/**
 * Populates null and missing field values within documents.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/fill/ usage}.
 */
export function $fill(
  collection: Iterator,
  expr: InputExpr,
  options: Options
): Iterator {
  assert(!expr.sortBy || isObject(expr.sortBy), "sortBy must be an object.");
  assert(
    !!expr.sortBy || Object.values(expr.output).every(m => has(m, "value")),
    "sortBy required if any output field specifies a 'method'."
  );
  assert(
    !(expr.partitionBy && expr.partitionByFields),
    "specify either partitionBy or partitionByFields."
  );
  assert(
    !expr.partitionByFields ||
      expr?.partitionByFields?.every(s => s[0] !== "$"),
    "fields in partitionByFields cannot begin with '$'."
  );

  options.context.addExpressionOps({ $ifNull });
  options.context.addWindowOps({ $locf, $linearFill });

  const partitionExpr =
    expr.partitionBy || expr?.partitionByFields?.map(s => "$" + s);

  // collect and remove all output fields using 'value' instead of 'method'.
  // if there are any fields remaining, process collection using $setWindowFields.
  // if the collected output fields is non-empty, use $addFields to add them to their respective partitions.

  const valueExpr: AnyObject = {};
  const methodExpr: AnyObject = {};
  for (const [k, m] of Object.entries(expr.output)) {
    if (has(m, "value")) {
      // translate to expression for $addFields
      const out = m as Output[0];
      valueExpr[k] = { $ifNull: [`$$CURRENT.${k}`, out.value] };
    } else {
      // translate to output expression for $setWindowFields.
      const out = m as Output[1];
      const fillOp = FILL_METHODS[out.method];
      assert(!!fillOp, `invalid fill method '${out.method}'.`);
      methodExpr[k] = { [fillOp]: "$" + k };
    }
  }

  // perform filling with $setWindowFields
  if (Object.keys(methodExpr).length > 0) {
    collection = $setWindowFields(
      collection,
      {
        sortBy: expr.sortBy || {},
        partitionBy: partitionExpr,
        output: methodExpr as SetWindowFieldsInput["output"]
      },
      options
    );
  }

  // fill with values
  if (Object.keys(valueExpr).length > 0) {
    collection = $addFields(collection, valueExpr, options);
  }

  return collection;
}
