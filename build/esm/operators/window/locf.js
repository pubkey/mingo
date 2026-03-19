import { isNil } from "../../util";
import { $push } from "../accumulator/push";
import { withMemo } from "./_internal";
const $locf = (_, coll, expr, options) => {
  return withMemo(
    coll,
    expr,
    () => {
      const values = $push(coll, expr.inputExpr, options);
      for (let i = 1; i < values.length; i++) {
        if (isNil(values[i])) values[i] = values[i - 1];
      }
      return values;
    },
    (series) => series[expr.documentNumber - 1]
  );
};
export {
  $locf
};
