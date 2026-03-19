import { assert, isNumber } from "../../util";
import { $push } from "../accumulator/push";
import { withMemo } from "./_internal";
const $expMovingAvg = (_, coll, expr, options) => {
  const { input, N, alpha } = expr.inputExpr;
  assert(
    !(N && alpha),
    `$expMovingAvg: must provide either 'N' or 'alpha' field.`
  );
  assert(
    !N || isNumber(N) && N > 0,
    `$expMovingAvg: 'N' must be greater than zero. Got ${N}.`
  );
  assert(
    !alpha || isNumber(alpha) && alpha > 0 && alpha < 1,
    `$expMovingAvg: 'alpha' must be between 0 and 1 (exclusive), found alpha: ${alpha}`
  );
  return withMemo(
    coll,
    expr,
    () => {
      const weight = N != void 0 ? 2 / (N + 1) : alpha;
      const values = $push(coll, input, options);
      for (let i = 0; i < values.length; i++) {
        if (i === 0) {
          if (!isNumber(values[i])) values[i] = null;
          continue;
        }
        if (!isNumber(values[i])) {
          values[i] = values[i - 1];
          continue;
        }
        if (!isNumber(values[i - 1])) continue;
        values[i] = values[i] * weight + values[i - 1] * (1 - weight);
      }
      return values;
    },
    (series) => series[expr.documentNumber - 1]
  );
};
export {
  $expMovingAvg
};
