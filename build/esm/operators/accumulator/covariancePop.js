import { covariance } from "./_internal";
import { $push } from "./push";
const $covariancePop = (coll, expr, options) => covariance($push(coll, expr, options), false);
export {
  $covariancePop
};
