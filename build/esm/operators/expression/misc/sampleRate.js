import { evalExpr } from "../../../core/_internal";
const $sampleRate = (obj, expr, options) => Math.random() <= evalExpr(obj, expr, options);
export {
  $sampleRate
};
