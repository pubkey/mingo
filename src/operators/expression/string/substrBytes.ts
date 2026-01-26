import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isNil, isNumber, isString } from "../../../util";
import {
  errExpectNumber,
  errExpectString,
  errInvalidArgs,
  INT_OPTS
} from "../_internal";

const OP = "$substrBytes";

const UTF8_MASK = [0xc0, 0xe0, 0xf0];

// encodes a unicode code point to a utf8 byte sequence
// https://encoding.spec.whatwg.org/#utf-8
function toUtf8(n: number): number[] {
  if (n < 0x80) return [n];
  let count = (n < 0x0800 && 1) || (n < 0x10000 && 2) || 3;
  const offset = UTF8_MASK[count - 1];
  const utf8 = [(n >> (6 * count)) + offset];
  while (count > 0) utf8.push(0x80 | ((n >> (6 * --count)) & 0x3f));
  return utf8;
}

function utf8Encode(s: string): number[][] {
  const buf: number[][] = [];
  for (let i = 0, len = s.length; i < len; i++) {
    buf.push(toUtf8(s.codePointAt(i)));
  }
  return buf;
}

/**
 * Returns a substring of a string, starting at a specified index position and including the specified number of characters.
 * The index is zero-based.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/substrBytes/}.
 */
export const $substrBytes: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  assert(isArray(expr) && expr.length === 3, `${OP} expects array(3)`);
  const [s, index, count] = computeValue(obj, expr, null, options) as [
    string,
    number,
    number
  ];
  const foe = options.failOnError;
  const nil = isNil(s);

  if (!nil && !isString(s)) return errExpectString(foe, `${OP} arg1 <string>`);
  if (!isNumber(index) || index < 0)
    return errExpectNumber(foe, `${OP} arg2 <index>`, INT_OPTS.zeroMin);
  if (!isNumber(count) || count < 0)
    return errExpectNumber(foe, `${OP} arg3 <count>`, INT_OPTS.zeroMin);

  if (nil) return "";

  const buf = utf8Encode(s);
  const codePoints = [];
  let offset = 0;
  for (let i = 0; i < buf.length; i++) {
    codePoints.push(offset);
    offset += buf[i].length;
  }

  const begin = codePoints.indexOf(index);
  const end = codePoints.indexOf(index + count);

  if (begin < 0 || end < 0) {
    return errInvalidArgs(
      foe,
      `${OP} invalid range, start or end index is a UTF-8 continuation byte`
    );
  }

  return s.substring(begin, end);
};
