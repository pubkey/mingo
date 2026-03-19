import { ensureArray } from "../../util";
import { $project } from "./project";
function $unset(coll, expr, options) {
  expr = ensureArray(expr);
  const doc = {};
  for (const k of expr) doc[k] = 0;
  return $project(coll, doc, options);
}
export {
  $unset
};
