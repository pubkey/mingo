import { assert, isArray, isNumber } from "../../util";
import { $push } from "../accumulator/push";
import { withMemo } from "./_internal";
const $minMaxScaler = (_, coll, expr, options) => {
  return withMemo(
    coll,
    expr,
    () => {
      const args = expr.inputExpr;
      const min = args.min || 0;
      const max = args.max || 1;
      const nums = $push(
        coll,
        args.input || expr.inputExpr,
        options
      );
      assert(
        isArray(nums) && nums.length > 0 && nums.every(isNumber),
        "$minMaxScaler: input must be a numeric array"
      );
      let rmin = nums[0];
      let rmax = nums[0];
      for (const n of nums) {
        if (n < rmin) rmin = n;
        else if (n > rmax) rmax = n;
      }
      const scale = max - min;
      const range = rmax - rmin;
      assert(range !== 0, "$minMaxScaler: input range must not be zero");
      return {
        min,
        scale,
        rmin,
        range,
        nums
      };
    },
    (data) => {
      const { min, rmin, scale, range, nums } = data;
      return (nums[expr.documentNumber - 1] - rmin) / range * scale + min;
    }
  );
};
export {
  $minMaxScaler
};
