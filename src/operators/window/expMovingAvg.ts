import { Options } from "../../core/_internal";
import { Any, AnyObject } from "../../types";
import { assert, isNumber } from "../../util";
import { $push } from "../accumulator/push";
import { WindowOperatorInput, withMemo } from "./_internal";

/**
 * Returns the exponential moving average of numeric expressions applied to documents
 * in a partition defined in the $setWindowFields stage.
 */
export const $expMovingAvg = (
  _: AnyObject,
  collection: AnyObject[],
  expr: WindowOperatorInput,
  options: Options
): Any => {
  const { input, N, alpha } = expr.inputExpr as {
    input: Any;
    N: number;
    alpha: number;
  };

  assert(
    !(N && alpha),
    `You must specify either N or alpha. You cannot specify both.`
  );

  return withMemo(
    collection,
    expr,
    () => {
      const series = $push(collection, input, options).filter(isNumber);
      return series.length === collection.length ? series : null;
    },
    (series: number[]) => {
      // return null if there are incompatible values
      if (series === null) return null;
      // first item
      if (expr.documentNumber == 1) return series[0];
      const weight = N != undefined ? 2 / (N + 1) : alpha;
      const i = expr.documentNumber - 1;
      // update series with moving average
      series[i] = series[i] * weight + series[i - 1] * (1 - weight);
      return series[i];
    }
  );
};
