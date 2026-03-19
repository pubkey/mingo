import { evalExpr } from "../../../core/_internal";
import { isNil, isString } from "../../../util";
import { errExpectString } from "../_internal";
const OP = "$replaceOne";
const $replaceOne = (obj, expr, options) => {
  const foe = options.failOnError;
  const args = evalExpr(obj, expr, options);
  const { input, find, replacement } = args;
  if (isNil(input) || isNil(find) || isNil(replacement)) return null;
  if (!isString(input)) return errExpectString(foe, `${OP} 'input'`);
  if (!isString(find)) return errExpectString(foe, `${OP} 'find'`);
  if (!isString(replacement))
    return errExpectString(foe, `${OP} 'replacement'`);
  return args.input.replace(args.find, args.replacement);
};
export {
  $replaceOne
};
