import { evalExpr, ProcessingMode } from "../../core/_internal";
import { Lazy } from "../../lazy";
import { assert, cloneDeep, isArray } from "../../util";
function $documents(_, expr, options) {
  const docs = evalExpr(null, expr, options);
  assert(isArray(docs), "$documents expression must resolve to an array.");
  const iter = Lazy(docs);
  const mode = options.processingMode;
  return mode & ProcessingMode.CLONE_ALL ? iter.map((o) => cloneDeep(o)) : iter;
}
export {
  $documents
};
