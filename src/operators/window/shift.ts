import { evalExpr } from "../../core/_internal";
import { Any, AnyObject, Options, WindowOperator } from "../../types";
import { WindowOperatorInput } from "./_internal";

/**
 * Returns the value from an expression applied to a document in a specified
 * position relative to the current document in the $setWindowFields stage partition.
 */
export const $shift: WindowOperator = (
  obj: AnyObject,
  collection: AnyObject[],
  expr: WindowOperatorInput,
  options: Options
): Any => {
  const input = expr.inputExpr as {
    output: Any;
    by: number;
    default?: Any;
  };

  const shiftedIndex = expr.documentNumber - 1 + input.by;
  if (shiftedIndex < 0 || shiftedIndex > collection.length - 1) {
    return input.default ? evalExpr(obj, input.default, options) : null;
  }
  return evalExpr(collection[shiftedIndex], input.output, options);
};
