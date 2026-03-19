import { processBitwise } from "./_internal";
const $bitAnd = (obj, expr, options) => processBitwise(
  obj,
  expr,
  options,
  "$bitAnd",
  (nums) => nums.reduce((a, b) => a & b, -1)
);
export {
  $bitAnd
};
