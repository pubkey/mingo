import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil } from "../../../util";
import { $mergeObjects as __mergeObjects } from "../../accumulator/mergeObjects";
import { ARR_OPTS, errExpectArray } from "../_internal";

/**
 * Combines multiple documents into a single document.
 */
export const $mergeObjects: ExpressionOperator<AnyObject> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): AnyObject => {
  const docs = computeValue(obj, expr, null, options) as AnyObject[];
  if (isNil(docs)) return {};
  if (!isArray(docs))
    return errExpectArray(options.failOnError, "$mergeObjects", ARR_OPTS.obj);
  return __mergeObjects(docs, expr, options);
};
