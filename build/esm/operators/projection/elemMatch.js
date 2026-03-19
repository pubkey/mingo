import { Query } from "../../query";
import { isArray, resolve } from "../../util";
const $elemMatch = (obj, expr, field, options) => {
  const arr = resolve(obj, field);
  const query = new Query(expr, options);
  if (!isArray(arr)) return void 0;
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (query.test(arr[i])) {
      if (options.useStrictMode) return [arr[i]];
      result.push(arr[i]);
    }
  }
  return result.length > 0 ? result : void 0;
};
export {
  $elemMatch
};
