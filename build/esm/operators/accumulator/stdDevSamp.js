import { isNumber } from "../../util";
import { stddev } from "./_internal";
import { $push } from "./push";
const $stdDevSamp = (coll, expr, options) => stddev($push(coll, expr, options).filter(isNumber), true);
export {
  $stdDevSamp
};
