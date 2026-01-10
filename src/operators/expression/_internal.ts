import { assert } from "../../util";

export function errInvalidArgs(failOnError: boolean, message: string): null {
  assert(!failOnError, message);
  return null;
}

export function errExpectNumberArray2(
  failOnError: boolean,
  name: string
): null {
  const msg = `${name} expression must resolve to array(2) of numbers`;
  assert(!failOnError, msg);
  return null;
}

export function errExpectNumber(failOnError: boolean, name: string): null {
  const msg = `${name} expression must resolve to number.`;
  assert(!failOnError, msg);
  return null;
}

export function errExpectArray(
  failOnError: boolean,
  prefix: string,
  size = 0
): null {
  const msg = `${prefix} expression must resolve to array${size > 0 ? "(" + size + ")" : ""}.`;
  assert(!failOnError, msg);
  return null;
}
