import { processBitwise } from "./_internal";
const $bitOr = (obj, expr, options) => processBitwise(
  obj,
  expr,
  options,
  "$bitOr",
  (nums) => nums.reduce((a, b) => a | b, 0)
);
export {
  $bitOr
};
