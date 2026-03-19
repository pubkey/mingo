import { isNumber } from "../../util";
import { stddev } from "./_internal";
import { $push } from "./push";
const $stdDevPop = (coll, expr, options) => stddev($push(coll, expr, options).filter(isNumber), false);
export {
  $stdDevPop
};
