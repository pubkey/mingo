import {
  assert,
  findInsertIndex,
  has,
  isArray,
  isNumber,
  isObject
} from "../../util";
import { errInvalidArgs } from "../expression/_internal";
import { $push } from "./push";
const $percentile = (coll, expr, options) => {
  assert(
    isObject(expr) && has(expr, "input", "p") && isArray(expr.p),
    "$percentile expects object { input, p }"
  );
  const X = $push(coll, expr.input, options).filter(isNumber).sort();
  const centiles = $push(expr.p, "$$CURRENT", options);
  const method = expr.method || "approximate";
  for (const n of centiles) {
    if (!isNumber(n) || n < 0 || n > 1) {
      return errInvalidArgs(
        options.failOnError,
        "$percentile 'p' must resolve to array of numbers between [0.0, 1.0]"
      );
    }
  }
  return centiles.map((p) => {
    const r = p * (X.length - 1) + 1;
    const ri = Math.floor(r);
    const result = r === ri ? X[r - 1] : X[ri - 1] + r % 1 * (X[ri] - X[ri - 1]);
    switch (method) {
      case "exact":
        return result;
      case "approximate": {
        const i = findInsertIndex(X, result);
        return i / X.length >= p ? X[Math.max(i - 1, 0)] : X[i];
      }
    }
  });
};
export {
  $percentile
};
