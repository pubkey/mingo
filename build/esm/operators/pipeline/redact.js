import { ComputeOptions, evalExpr } from "../../core/_internal";
import { has, isArray, isNil, isObject } from "../../util";
function $redact(coll, expr, options) {
  const copts = ComputeOptions.init(options);
  return coll.map(
    (root) => redact(root, expr, copts.update({ root }))
  );
}
function redact(obj, expr, options) {
  const action = evalExpr(obj, expr, options);
  switch (action) {
    case "$$KEEP":
      return obj;
    case "$$PRUNE":
      return void 0;
    case "$$DESCEND": {
      if (!has(expr, "$cond")) return obj;
      const output = {};
      for (const [key, value] of Object.entries(obj)) {
        if (isArray(value)) {
          const res = new Array();
          for (let elem of value) {
            if (isObject(elem)) {
              elem = redact(elem, expr, options.update({ root: elem }));
            }
            if (!isNil(elem)) res.push(elem);
          }
          output[key] = res;
        } else if (isObject(value)) {
          const res = redact(
            value,
            expr,
            options.update({ root: value })
          );
          if (!isNil(res)) output[key] = res;
        } else {
          output[key] = value;
        }
      }
      return output;
    }
    default:
      return action;
  }
}
export {
  $redact
};
