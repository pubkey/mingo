import { evalExpr } from "../../../core/_internal";
import { isArray, isNil } from "../../../util";
import { $mergeObjects as __mergeObjects } from "../../accumulator/mergeObjects";
import { ARR_OPTS, errExpectArray } from "../_internal";
const $mergeObjects = (obj, expr, options) => {
  const docs = evalExpr(obj, expr, options);
  if (isNil(docs)) return {};
  if (!isArray(docs))
    return errExpectArray(options.failOnError, "$mergeObjects", ARR_OPTS.obj);
  return __mergeObjects(docs, expr, options);
};
export {
  $mergeObjects
};
