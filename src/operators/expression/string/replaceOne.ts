import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isNil, isString } from "../../../util";
import { errExpectString } from "../_internal";

const OP = "$replaceOne";

/**
 * Replaces the first instance of a matched string in a given input.
 */
export const $replaceOne: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const foe = options.failOnError;
  const args = computeValue(obj, expr, null, options) as {
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

  return args.input.replace(args.find, args.replacement);
};
