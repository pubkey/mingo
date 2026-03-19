import { evalExpr } from "../../../core/_internal";
import { dateAdd } from "./_internal";
const $dateAdd = (obj, expr, options) => {
  const args = evalExpr(obj, expr, options);
  return dateAdd(args.startDate, args.unit, args.amount, args.timezone);
};
export {
  $dateAdd
};
