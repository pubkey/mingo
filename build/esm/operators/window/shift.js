import { evalExpr } from "../../core/_internal";
const $shift = (obj, coll, expr, options) => {
  const input = expr.inputExpr;
  const shiftedIndex = expr.documentNumber - 1 + input.by;
  if (shiftedIndex < 0 || shiftedIndex > coll.length - 1) {
    return evalExpr(obj, input.default, options) ?? null;
  }
  return evalExpr(coll[shiftedIndex], input.output, options);
};
export {
  $shift
};
