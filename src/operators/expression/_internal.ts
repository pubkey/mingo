import { assert, isNil } from "../../util";

export const INT_OPTS = {
  int: { int: true }, // (-∞, ∞)
  pos: { min: 1, int: true }, // [1, ∞]
  index: { min: 0, int: true }, // [0, ∞]
  nzero: { min: 0, max: 0, int: true } // non-zero
};

export const ARR_OPTS = {
  int: { type: "integers" },
  obj: { type: "objects" }
};

export function errInvalidArgs(failOnError: boolean, message: string): null {
  assert(!failOnError, message);
  return null;
}

export function errExpectObject(failOnError: boolean, prefix: string): null {
  const msg = `${prefix} expression must resolve to object`;
  assert(!failOnError, msg);
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
  if (min === 0 && max === 0) {
    // special case to indicate non-zero
    msg = `${name} expression must resolve to non-zero ${type}`;
  } else if (min === 0 && max === Infinity) {
    msg = `${name} expression must resolve to non-negative ${type}`;
  } else if (min !== -Infinity && max !== Infinity) {
    msg = `${name} expression must resolve to ${type} in range [${min}, ${max}]`;
  } else if (min > 0) {
    msg = `${name} expression must resolve to positive ${type}`;
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
  let suffix = "array";
  if (!isNil(opts?.size) && opts?.size >= 0)
    suffix = opts.size === 0 ? "non-zero array" : `array(${opts.size})`;
  if (opts?.type) suffix = `array of ${opts.type}`;
  const msg = `${prefix} expression must resolve to ${suffix}`;
  assert(!failOnError, msg);
  return null;
}
