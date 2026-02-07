import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isNil, isObject, isString } from "../../../util";
import { errExpectString } from "../_internal";

const OP = "$replaceAll";

/**
 * Replaces all instances of a matched string in a given input.
 */
export const $replaceAll: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  assert(isObject(expr), `${OP} expects an object argument`);
  const foe = options.failOnError;
  const args = evalExpr(obj, expr, options) as {
    input: string;
    find: string;
    replacement: string;
  };

  const { input, find, replacement } = args;
  if (isNil(input) || isNil(find) || isNil(replacement)) return null;
  if (!isString(input)) return errExpectString(foe, `${OP} 'input'`);
  if (!isString(find)) return errExpectString(foe, `${OP} 'find'`);
  if (!isString(replacement))
    return errExpectString(foe, `${OP} 'replacement'`);

  return input.replace(new RegExp(find, "g"), replacement);
};
