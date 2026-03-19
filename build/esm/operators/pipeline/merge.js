import { Aggregator } from "../../aggregator";
import { ComputeOptions, evalExpr } from "../../core/_internal";
import {
  assert,
  hashCode,
  HashMap,
  isArray,
  isString,
  MingoError,
  resolve
} from "../../util";
import { $mergeObjects } from "../expression";
import { resolveCollection } from "./_internal";
function $merge(coll, expr, options) {
  const output = resolveCollection("$merge", expr.into, options);
  assert(isArray(output), `$merge: expression 'into' must resolve to an array`);
  const onField = expr.on || options.idKey;
  const getHash = isString(onField) ? (o) => hashCode(resolve(o, onField)) : (o) => hashCode(onField.map((s) => resolve(o, s)));
  const map = HashMap.init();
  for (let i = 0; i < output.length; i++) {
    const obj = output[i];
    const k = getHash(obj);
    assert(
      !map.has(k),
      "$merge: 'into' collection must have unique entries for the 'on' field."
    );
    map.set(k, [obj, i]);
  }
  const copts = ComputeOptions.init(options);
  return coll.map((o) => {
    const k = getHash(o);
    if (map.has(k)) {
      const [target, i] = map.get(k);
      const variables = evalExpr(
        target,
        expr.let || { new: "$$ROOT" },
        // 'root' is the item from the iteration.
        copts.update({ root: o })
      );
      if (isArray(expr.whenMatched)) {
        const aggregator = new Aggregator(
          expr.whenMatched,
          copts.update({ root: null, variables })
        );
        output[i] = aggregator.run([target])[0];
      } else {
        switch (expr.whenMatched) {
          case "replace":
            output[i] = o;
            break;
          case "fail":
            throw new MingoError(
              "$merge: failed due to matching as specified by 'whenMatched' option."
            );
          case "keepExisting":
            break;
          case "merge":
          default:
            output[i] = $mergeObjects(
              target,
              [target, o],
              // 'root' is the item from the iteration.
              copts.update({ root: o, variables })
            );
            break;
        }
      }
    } else {
      switch (expr.whenNotMatched) {
        case "discard":
          break;
        case "fail":
          throw new MingoError(
            "$merge: failed due to matching as specified by 'whenMatched' option."
          );
        case "insert":
        default:
          output.push(o);
          break;
      }
    }
    return o;
  });
}
export {
  $merge
};
