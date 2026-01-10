import { isNil } from "../../../util";
import { errExpectNumberArray2 } from "../_internal";

/**
 * Truncates integer value to number of places. If roundOff is specified round value instead to the number of places.
 * @param {Number} num
 * @param {Number} precision
 * @param {Object} opts
 */
export function truncate(
  num: number,
  precision: number,
  opts: { roundOff: boolean; failOnError: boolean; name: string }
): number {
  const { name, roundOff, failOnError } = opts;

  if (isNil(num)) return null;
  if (Number.isNaN(num) || Math.abs(num) === Infinity) return num;

  precision = precision ?? 0;
  if (typeof num !== "number" || typeof precision !== "number") {
    return errExpectNumberArray2(failOnError, name);
  }

  if (precision < -20 || precision > 100) {
    const msg = `${name} precision must be in range [-20, 100].`;
    assert(!failOnError, msg);
    return null;
  }

  const sign = Math.abs(num) === num ? 1 : -1;
  num = Math.abs(num);

  let result = Math.trunc(num);
  const decimals = parseFloat((num - result).toFixed(Math.abs(precision) + 1));

  if (precision === 0) {
    const firstDigit = Math.trunc(10 * decimals);
    if (
      roundOff &&
      (((result & 1) === 1 && firstDigit >= 5) || firstDigit > 5)
    ) {
      result++;
    }
  } else if (precision > 0) {
    const offset = Math.pow(10, precision);
    let remainder = Math.trunc(decimals * offset);

    // last digit before cut off
    const lastDigit = Math.trunc(decimals * offset * 10) % 10;

    // add one if last digit is greater than 5
    if (roundOff && lastDigit > 5) {
      remainder += 1;
    }

    // compute decimal remainder and add to whole number
    // manually formatting float re
    result = (result * offset + remainder) / offset;
  } else if (precision < 0) {
    // handle negative decimal places
    const offset = Math.pow(10, -1 * precision);
    let excess = result % offset;
    result = Math.max(0, result - excess);

    // for negative values the absolute must increase so we round up the last digit if >= 5
    if (roundOff && sign === -1) {
      while (excess > 10) {
        excess -= excess / 10;
      }
      if (result > 0 && excess >= 5) {
        result += offset;
      }
    }
  }

  return result * sign;
}
