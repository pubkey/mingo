import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, has, isNil, isObject, isString } from "../../../util";
import { errExpectObject, errExpectString } from "../_internal";

const OP = "$setField";

interface InputExpr {
  readonly field: string;
  readonly input: AnyObject;
  readonly value: Any;
}

/**
 * Adds, updates, or removes a specified field in a document.
 */
export const $setField: ExpressionOperator = (
  obj: AnyObject,
  expr: InputExpr,
  options: Options
): Any => {
  assert(
    isObject(expr) && has(expr, "input", "field", "value"),
    "$setField expects object { input, field, value }"
  );

  const { input, field, value } = computeValue(
    obj,
    expr,
    null,
    options
  ) as InputExpr;

  if (isNil(input)) return null;

  const foe = options.failOnError;
  if (!isObject(input)) return errExpectObject(foe, `${OP} 'input'`);
  if (!isString(field)) return errExpectString(foe, `${OP} 'field'`);

  const newObj = { ...input };
  if (expr.value == "$$REMOVE") {
    delete newObj[field];
  } else {
    newObj[field] = value;
  }

  return newObj;
};
