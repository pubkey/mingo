import { isArray, resolve } from "../../util";
import { $slice as __slice } from "../expression/array/slice";
const $slice = (obj, expr, field, options) => {
  const xs = resolve(obj, field);
  if (!isArray(xs)) return xs;
  return __slice(
    obj,
    isArray(expr) ? [xs, ...expr] : [xs, expr],
    options
  );
};
export {
  $slice
};
