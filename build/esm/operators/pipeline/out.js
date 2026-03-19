import { assert, cloneDeep, isArray } from "../../util";
import { resolveCollection } from "./_internal";
function $out(coll, expr, options) {
  const out = resolveCollection("$out", expr, options);
  assert(isArray(out), `$out: expression must resolve to an array`);
  return coll.map((o) => {
    out.push(cloneDeep(o));
    return o;
  });
}
export {
  $out
};
