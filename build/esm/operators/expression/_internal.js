import { assert, isNil } from "../../util";
const INT_OPTS = {
  int: { int: true },
  // (-∞, ∞)
  pos: { min: 1, int: true },
  // [1, ∞]
  index: { min: 0, int: true },
  // [0, ∞]
  nzero: { min: 0, max: 0, int: true }
  // non-zero
};
const ARR_OPTS = {
  int: { type: "integers" },
  obj: { type: "objects" }
};
function errInvalidArgs(failOnError, message) {
  assert(!failOnError, message);
  return null;
}
function errExpectObject(failOnError, prefix) {
  const msg = `${prefix} expression must resolve to object`;
  assert(!failOnError, msg);
  return null;
}
function errExpectString(failOnError, prefix) {
  const msg = `${prefix} expression must resolve to string`;
  assert(!failOnError, msg);
  return null;
}
function errExpectNumber(failOnError, name, opts) {
  const type = opts?.int ? "integer" : "number";
  const min = opts?.min ?? -Infinity;
  const max = opts?.max ?? Infinity;
  let msg;
  if (min === 0 && max === 0) {
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
function errExpectArray(failOnError, prefix, opts) {
  let suffix = "array";
  if (!isNil(opts?.size) && opts?.size >= 0)
    suffix = opts.size === 0 ? "non-zero array" : `array(${opts.size})`;
  if (opts?.type) suffix = `array of ${opts.type}`;
  const msg = `${prefix} expression must resolve to ${suffix}`;
  assert(!failOnError, msg);
  return null;
}
export {
  ARR_OPTS,
  INT_OPTS,
  errExpectArray,
  errExpectNumber,
  errExpectObject,
  errExpectString,
  errInvalidArgs
};
