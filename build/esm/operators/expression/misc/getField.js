import { evalExpr } from "../../../core/_internal";
import { isNil, isString } from "../../../util";
const $getField = (obj, expr, options) => {
  const args = evalExpr(obj, expr, options);
  const { field, input } = isString(args) ? { field: args, input: obj } : { field: args.field, input: args.input ?? obj };
  if (isNil(input)) return null;
  return input[field];
};
export {
  $getField
};
