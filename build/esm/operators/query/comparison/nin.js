import { $in } from "./in";
const $nin = (selector, value, options) => {
  const inPredicate = $in(selector, value, options);
  return (o) => !inPredicate(o);
};
export {
  $nin
};
