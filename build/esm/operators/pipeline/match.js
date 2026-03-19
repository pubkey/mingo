import { Query } from "../../query";
function $match(coll, expr, options) {
  const q = new Query(expr, options);
  return coll.filter((o) => q.test(o));
}
export {
  $match
};
