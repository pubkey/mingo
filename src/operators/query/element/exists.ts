import { Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { isArray, resolve, resolveGraph } from "../../../util/_internal";

/**
 * Matches documents that contain or do not contain a specified field, including documents where the field value is null.
 */
export const $exists = (selector: string, value: Any, _options: Options) => {
  const nested = selector.includes(".");
  const b = !!value;
  // top-level keys and array elements.
  if (!nested || selector.match(/\.\d+$/)) {
    return (o: AnyObject) => (resolve(o, selector) !== undefined) === b;
  }
  // for nested keys we resolve the entire value path so we don't confuse array scalars with plural values.
  return (o: AnyObject) => {
    const path = resolveGraph(o, selector, { preserveIndex: true });
    const val = resolve(path, selector.substring(0, selector.lastIndexOf(".")));
    return isArray(val)
      ? val.some(v => v !== undefined) === b
      : (val !== undefined) === b;
  };
};
