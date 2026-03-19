import { isArray, resolve, resolveGraph } from "../../../util/_internal";
const $exists = (selector, value, _options) => {
  const nested = selector.includes(".");
  const b = !!value;
  if (!nested || selector.match(/\.\d+$/)) {
    const pathArray = selector.split(".");
    return (o) => resolve(o, selector, void 0, pathArray) !== void 0 === b;
  }
  const parentSelector = selector.substring(0, selector.lastIndexOf("."));
  const parentPathArray = parentSelector.split(".");
  return (o) => {
    const path = resolveGraph(o, selector, {
      preserveIndex: true
    });
    const val = resolve(path, parentSelector, void 0, parentPathArray);
    return isArray(val) ? val.some((v) => v !== void 0) === b : val !== void 0 === b;
  };
};
export {
  $exists
};
