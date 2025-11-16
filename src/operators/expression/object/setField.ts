import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isNil, isObject, isString } from "../../../util";

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
export const $setField: ExpressionOperator = (
  obj: AnyObject,
  expr: InputExpr,
  options: Options
): Any => {
  const { input, field, value } = computeValue(
    obj,
    expr,
    null,
    options
  ) as InputExpr;
  if (isNil(input)) return null;
  assert(
    isObject(input),
    "$setField expression 'input' must evaluate to an object"
  );
  assert(
    isString(field),
    "$setField expression 'field' must evaluate to a string"
  );

  const newObj = { ...input };
  if (expr.value == "$$REMOVE") {
    delete newObj[field];
  } else {
    newObj[field] = value;
  }

  return newObj;
};
