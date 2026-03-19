import { evalExpr } from "../../core/_internal";
import { hashCode } from "../../util";
const $toHashedIndexKey = (obj, expr, options) => hashCode(evalExpr(obj, expr, options));
export {
  $toHashedIndexKey
};
