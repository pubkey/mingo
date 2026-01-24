import { assert } from "../../util";

export function errInvalidArgs(failOnError: boolean, message: string): null {
  assert(!failOnError, message);
  return null;
}

export function errExpectString(failOnError: boolean, prefix: string): null {
  const msg = `${prefix} expression must resolve to string`;
  assert(!failOnError, msg);
  return null;
}

export function errExpectNumber(
  failOnError: boolean,
  name: string,
  opts?: { int?: boolean; min?: number; max?: number }
): null {
  const type = opts?.int ? "integer" : "number";
  const min = opts?.min ?? -Infinity;
  const max = opts?.max ?? Infinity;
  let msg: string;
  if (min != -Infinity && max != Infinity) {
    msg = `${name} expression must resolve to ${type} in between [${min}, ${max}]`;
  } else if (min == 0 && max == Infinity) {
    msg = `${name} expression must resolve to non-negative ${type}`;
  } else {
    msg = `${name} expression must resolve to ${type}`;
  }
  assert(!failOnError, msg);
  return null;
}

export function errExpectArray(
  failOnError: boolean,
  prefix: string,
  opts?: { size?: number; type?: string }
): null {
  const size = opts?.size && opts?.size > 0 ? `(${opts.size})` : "";
  const suffix = opts?.type ? `array${size} of ${opts.type}` : `array${size}`;
  const msg = `${prefix} expression must resolve to ${suffix}`;
  assert(!failOnError, msg);
  return null;
}
