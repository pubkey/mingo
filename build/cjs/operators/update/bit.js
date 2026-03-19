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
var bit_exports = {};
__export(bit_exports, {
  $bit: () => $bit
});
module.exports = __toCommonJS(bit_exports);
var import_util = require("../../util");
var import_internal = require("./_internal");
const BIT_OPS = ["and", "or", "xor"];
function $bit(expr, arrayFilters = [], options = import_internal.DEFAULT_OPTIONS) {
  for (const vals of Object.values(expr)) {
    (0, import_util.assert)((0, import_util.isObject)(vals), `$bit operator expression must be an object.`);
    const op = Object.keys(vals);
    (0, import_util.assert)(
      op.length === 1 && BIT_OPS.includes(op[0]),
      `$bit spec is invalid '${op[0]}'. Must be one of 'and', 'or', or 'xor'.`
    );
    (0, import_util.assert)(
      (0, import_util.isNumber)(vals[op[0]]),
      `$bit expression value must be a number. Got ${typeof vals[op[0]]}`
    );
  }
  return (obj) => {
    return (0, import_internal.walkExpression)(
      expr,
      arrayFilters,
      options,
      (val, node, queries) => {
        const op = Object.keys(val);
        return (0, import_internal.applyUpdate)(
          obj,
          node,
          queries,
          (o, k) => {
            let n = o[k];
            const v = val[op[0]];
            if (n !== void 0 && !((0, import_util.isNumber)(n) && (0, import_util.isNumber)(v))) return false;
            n = n || 0;
            switch (op[0]) {
              case "and":
                return (o[k] = n & v) !== n;
              case "or":
                return (o[k] = n | v) !== n;
              case "xor":
                return (o[k] = n ^ v) !== n;
            }
          },
          { buildGraph: true }
        );
      }
    );
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $bit
});
