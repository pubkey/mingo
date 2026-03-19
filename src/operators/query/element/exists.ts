import { Any, AnyObject, Options } from "../../../types";
import { isArray, resolve, resolveGraph } from "../../../util/_internal";

/**
 * Matches documents that contain or do not contain a specified field, including documents where the field value is null.
 */
export const $exists = (selector: string, value: Any, _options: Options) => {
  const nested = selector.includes(".");
  const b = !!value;
  // top-level keys and array elements.
  if (!nested || selector.match(/\.\d+$/)) {
    const pathArray = selector.split(".");
    return (o: AnyObject) =>
      (resolve(o, selector, undefined, pathArray) !== undefined) === b;
  }
  // for nested keys we resolve the entire value path so we don't confuse array scalars with plural values.
  const parentSelector = selector.substring(0, selector.lastIndexOf("."));
  const parentPathArray = parentSelector.split(".");
  return (o: AnyObject) => {
    const path = resolveGraph(o, selector, {
      preserveIndex: true
    }) as AnyObject;
    const val = resolve(path, parentSelector, undefined, parentPathArray);
    return isArray(val)
      ? val.some(v => v !== undefined) === b
      : (val !== undefined) === b;
  };
};
