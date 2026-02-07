import { ComputeOptions, evalExpr } from "../../core/_internal";
import { AccumulatorOperator, Any, Options } from "../../types";
import { isNil } from "../../util";

/**
 * Returns an array of all values for the selected field among for each document in that group.
 */
export const $push: AccumulatorOperator<Any[]> = (
  collection: Any[],
  expr: Any,
  options: Options
): Any[] => {
  if (isNil(expr)) return collection;
  const copts = ComputeOptions.init(options);
  const result = new Array(collection.length);
  for (let i = 0; i < collection.length; i++) {
    const root = collection[i];
    result[i] = evalExpr(root, expr, copts.update({ root })) ?? null;
  }
  return result;
};
