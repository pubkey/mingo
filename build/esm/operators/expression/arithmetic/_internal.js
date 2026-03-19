import { isInteger, isNil, isNumber } from "../../../util";
import { errExpectNumber } from "../_internal";
function truncate(num, precision, opts) {
  const { name, roundOff, failOnError } = opts;
  if (isNil(num)) return null;
  if (Number.isNaN(num) || Math.abs(num) === Infinity) return num;
  if (!isNumber(num)) {
    return errExpectNumber(failOnError, `${name} arg1 <number>`);
  }
  if (!isInteger(precision) || precision < -20 || precision > 100) {
    return errExpectNumber(failOnError, `${name} arg2 <precision>`, {
      min: -20,
      max: 100,
      int: true
    });
  }
  const sign = Math.abs(num) === num ? 1 : -1;
  num = Math.abs(num);
  let result = Math.trunc(num);
  const decimals = parseFloat((num - result).toFixed(Math.abs(precision) + 1));
  if (precision === 0) {
    const firstDigit = Math.trunc(10 * decimals);
    if (roundOff && ((result & 1) === 1 && firstDigit >= 5 || firstDigit > 5)) {
      result++;
    }
  } else if (precision > 0) {
    const offset = Math.pow(10, precision);
    let remainder = Math.trunc(decimals * offset);
    const lastDigit = Math.trunc(decimals * offset * 10) % 10;
    if (roundOff && lastDigit > 5) {
      remainder += 1;
    }
    result = (result * offset + remainder) / offset;
  } else if (precision < 0) {
    const offset = Math.pow(10, -1 * precision);
    let excess = result % offset;
    result = Math.max(0, result - excess);
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
export {
  truncate
};
