import { unique } from "../../util";
import { $push } from "./push";
const $addToSet = (coll, expr, options) => unique($push(coll, expr, options));
export {
  $addToSet
};
