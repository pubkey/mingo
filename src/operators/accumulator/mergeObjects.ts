import { AccumulatorOperator, Any, AnyObject, Options } from "../../types";
import { isNil } from "../../util";

/**
 * Combines multiple documents into a single document.
 *
 * @param {Array} collection The input array
 * @param {AnyObject} _ The right-hand side expression value of the operator
 * @param {Options} options The options to use for this operation
 * @returns {Array|*}
 */
export const $mergeObjects: AccumulatorOperator<AnyObject> = (
  collection: AnyObject[],
  _expr: Any,
  _options: Options
): AnyObject => {
  const acc = {} as AnyObject;
  for (const o of collection) {
    // filter out nil values
    if (isNil(o)) continue;
    for (const k of Object.keys(o)) {
      if (o[k] !== undefined) acc[k] = o[k];
    }
  }
  return acc;
};
