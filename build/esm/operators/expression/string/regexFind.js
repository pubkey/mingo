import { isArray } from "../../../util";
import { regexSearch } from "./_internal";
const $regexFind = (obj, expr, options) => {
  const result = regexSearch(obj, expr, options, { global: false });
  return isArray(result) && result.length > 0 ? result[0] : null;
};
export {
  $regexFind
};
