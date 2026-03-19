import { rank } from "./_internal";
const $denseRank = (obj, coll, expr, options) => rank(
  obj,
  coll,
  expr,
  options,
  true
  /*dense*/
);
export {
  $denseRank
};
