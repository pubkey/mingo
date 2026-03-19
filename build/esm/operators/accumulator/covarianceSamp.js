import { covariance } from "./_internal";
import { $push } from "./push";
const $covarianceSamp = (coll, expr, options) => covariance($push(coll, expr, options), true);
export {
  $covarianceSamp
};
