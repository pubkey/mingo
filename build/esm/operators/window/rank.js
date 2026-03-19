import { rank } from "./_internal";
const $rank = (obj, coll, expr, options) => rank(
  obj,
  coll,
  expr,
  options,
  false
  /*dense*/
);
export {
  $rank
};
