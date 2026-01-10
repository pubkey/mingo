import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { has, isArray, isNil, isObject } from "../../../util";
import { errExpectArray, errInvalidArgs } from "../_internal";

const err =
  "$arrayToObject expects an array with exclusively [<k>,<v>] or { k:<k>, v:<v> }, key-value pairs";

/**
 * Converts an array of key value pairs to a document.
 */
export const $arrayToObject: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): AnyObject => {
  const foe = options.failOnError;
  const arr = computeValue(obj, expr, null, options) as Any[];
  if (isNil(arr)) return null;
  if (!isArray(arr)) return errExpectArray(foe, "$arrayToObject");

  let tag = 0;
  const newObj = {};

  for (const item of arr) {
    let val = item;
    // flatten
    while (isArray(val) && val.length === 1) val = val[0];

    if (isArray(val) && val.length === 2) {
      if (!tag) tag = 1;
      if (tag !== 1) return errInvalidArgs(foe, err);
      const [k, v] = val as [string, Any];
      newObj[k] = v;
    } else if (isObject(val) && has(val, "k") && has(val, "v")) {
      if (!tag) tag = 2;
      if (tag !== 2) return errInvalidArgs(foe, err);
      const { k, v } = val as { k: string; v: Any };
      newObj[k] = v;
    } else {
      return errInvalidArgs(foe, err);
    }
  }

  return newObj;
};
