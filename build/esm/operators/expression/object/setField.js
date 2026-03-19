import { evalExpr } from "../../../core/_internal";
import { assert, has, isNil, isObject, isString } from "../../../util";
import { errExpectObject, errExpectString } from "../_internal";
const OP = "$setField";
const $setField = (obj, expr, options) => {
  assert(
    isObject(expr) && has(expr, "input", "field", "value"),
    "$setField expects object { input, field, value }"
  );
  const { input, field, value } = evalExpr(obj, expr, options);
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
export {
  $setField
};
