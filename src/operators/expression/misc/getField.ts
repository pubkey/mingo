import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { isNil, isString } from "../../../util";

interface InputExpr {
  readonly field: string;
  readonly input?: AnyObject;
}

/**
 * Adds, updates, or removes a specified field in a document.
 */
export const $getField = (
  obj: AnyObject,
  expr: InputExpr | string,
  options: Options
): Any => {
  const args = evalExpr(obj, expr, options) as InputExpr | string;
  const { field, input } = isString(args)
    ? { field: args, input: obj }
    : { field: args.field, input: args.input ?? obj };

  if (isNil(input)) return null;

  return input[field];
};
