import { processBitwise } from "./_internal";
const $bitXor = (obj, expr, options) => processBitwise(
  obj,
  expr,
  options,
  "$bitXor",
  (nums) => nums.reduce((a, b) => a ^ b, 0)
);
export {
  $bitXor
};
