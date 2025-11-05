import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { isNil, isNumber } from "../../../util";

const PRECISION = 1e10;
/**
 * Returns the result of the sigmoid function (the integration of the normal distribution with standard deviation 1).
 * @param {*} obj
 * @param {*} expr
 */
export const $sigmoid: ExpressionOperator = (
  obj: AnyObject,
  expr: string | { input: Any; onNull: Any },
  options: Options
): number | null => {
  if (isNil(expr)) return null;
  const args = computeValue(obj, expr, null, options);
  const { input, onNull } = isNumber(args)
    ? { input: args }
    : (args as { input: number; onNull?: number });
  if (isNil(input)) return onNull ?? null;
  assert(
    isNumber(input),
    `$sigmoid: expression must resolve to number: ${input}`
  );
  const result = 1 / (1 + Math.exp(-input));
  return Math.round(result * PRECISION) / PRECISION;
};
