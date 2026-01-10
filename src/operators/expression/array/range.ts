import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNumber } from "../../../util";
import { errInvalidArgs } from "../_internal";

const err = "$range expects array(3) of numbers";
/**
 * Returns an array whose elements are a generated sequence of numbers.
 *
 * @param  {AnyObject} obj
 * @param  {*} expr
 * @return {*}
 */
export const $range: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as Any[];
  assert(isArray(args) && args.length > 1, err);

  if (!args.every(isNumber))
    return errInvalidArgs(
      options.failOnError,
      "$range expressions must resolve to numbers"
    );

  const start = args[0];
  const end = args[1];
  const step = args[2] ?? 1;

  const result = new Array<number>();
  let counter = start;
  while ((counter < end && step > 0) || (counter > end && step < 0)) {
    result.push(counter);
    counter += step;
  }

  return result;
};
