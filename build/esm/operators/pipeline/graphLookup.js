import { evalExpr } from "../../core/_internal";
import { Lazy } from "../../lazy";
import { assert, flatten, HashMap, isArray, isNil, setValue } from "../../util";
import { resolveCollection } from "./_internal";
import { $lookup } from "./lookup";
function $graphLookup(coll, expr, options) {
  const fromColl = resolveCollection("$graphLookup", expr.from, options);
  assert(
    isArray(fromColl),
    "$graphLookup: expression 'from' must resolve to array"
  );
  const {
    connectFromField,
    connectToField,
    as: asField,
    maxDepth,
    depthField,
    restrictSearchWithMatch: matchExpr
  } = expr;
  const pipelineExpr = matchExpr ? { pipeline: [{ $match: matchExpr }] } : {};
  return coll.map((obj) => {
    const matchObj = {};
    setValue(
      matchObj,
      connectFromField,
      evalExpr(obj, expr.startWith, options)
    );
    let matches = [matchObj];
    let i = -1;
    const map = HashMap.init();
    do {
      i++;
      matches = flatten(
        $lookup(
          Lazy(matches),
          {
            from: fromColl,
            localField: connectFromField,
            foreignField: connectToField,
            as: asField,
            ...pipelineExpr
          },
          options
        ).map((o) => o[asField]).collect()
      );
      const oldSize = map.size;
      matches.forEach((k) => map.set(k, map.get(k) ?? i));
      if (oldSize == map.size) break;
    } while (isNil(maxDepth) || i < maxDepth);
    const result = new Array(map.size);
    let n = 0;
    map.forEach((v, k) => {
      result[n++] = Object.assign(depthField ? { [depthField]: v } : {}, k);
    });
    return { ...obj, [asField]: result };
  });
}
export {
  $graphLookup
};
