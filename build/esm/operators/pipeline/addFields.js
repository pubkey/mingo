import { evalExpr } from "../../core/_internal";
import { removeValue, setValue } from "../../util";
function $addFields(coll, expr, options) {
  const newFields = Object.keys(expr);
  if (newFields.length === 0) return coll;
  return coll.map((obj) => {
    const newObj = { ...obj };
    for (const field of newFields) {
      const newValue = evalExpr(obj, expr[field], options);
      if (newValue !== void 0) {
        setValue(newObj, field, newValue);
      } else {
        removeValue(newObj, field);
      }
    }
    return newObj;
  });
}
export {
  $addFields
};
