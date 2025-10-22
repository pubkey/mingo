import { ExpressionOperator, Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { $setField } from "./setField";

interface InputExpr {
  readonly field: string;
  readonly input: AnyObject;
  readonly value: Any;
}

/**
 * Adds, updates, or removes a specified field in a document.
 *
 * @param {*} obj The target object for this expression
 * @param {*} expr The right-hand side of the operator
 * @param {Options} options Options to use for operation
 */
export const $unsetField: ExpressionOperator = (
  obj: AnyObject,
  expr: InputExpr,
  options: Options
): Any => {
  return $setField(
    obj,
    {
      ...expr,
      value: "$$REMOVE"
    },
    options
  );
};
