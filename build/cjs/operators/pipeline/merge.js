var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var merge_exports = {};
__export(merge_exports, {
  $merge: () => $merge
});
module.exports = __toCommonJS(merge_exports);
var import_aggregator = require("../../aggregator");
var import_internal = require("../../core/_internal");
var import_util = require("../../util");
var import_expression = require("../expression");
var import_internal2 = require("./_internal");
function $merge(coll, expr, options) {
  const output = (0, import_internal2.resolveCollection)("$merge", expr.into, options);
  (0, import_util.assert)((0, import_util.isArray)(output), `$merge: expression 'into' must resolve to an array`);
  const onField = expr.on || options.idKey;
  const getHash = (0, import_util.isString)(onField) ? (o) => (0, import_util.hashCode)((0, import_util.resolve)(o, onField)) : (o) => (0, import_util.hashCode)(onField.map((s) => (0, import_util.resolve)(o, s)));
  const map = import_util.HashMap.init();
  for (let i = 0; i < output.length; i++) {
    const obj = output[i];
    const k = getHash(obj);
    (0, import_util.assert)(
      !map.has(k),
      "$merge: 'into' collection must have unique entries for the 'on' field."
    );
    map.set(k, [obj, i]);
  }
  const copts = import_internal.ComputeOptions.init(options);
  return coll.map((o) => {
    const k = getHash(o);
    if (map.has(k)) {
      const [target, i] = map.get(k);
      const variables = (0, import_internal.evalExpr)(
        target,
        expr.let || { new: "$$ROOT" },
        // 'root' is the item from the iteration.
        copts.update({ root: o })
      );
      if ((0, import_util.isArray)(expr.whenMatched)) {
        const aggregator = new import_aggregator.Aggregator(
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
            throw new import_util.MingoError(
              "$merge: failed due to matching as specified by 'whenMatched' option."
            );
          case "keepExisting":
            break;
          case "merge":
          default:
            output[i] = (0, import_expression.$mergeObjects)(
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
          throw new import_util.MingoError(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $merge
});
