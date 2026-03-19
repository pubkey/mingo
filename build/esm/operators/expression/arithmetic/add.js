import { evalExpr } from "../../../core/_internal";
import { isArray, isDate, isNil } from "../../../util";
import { errInvalidArgs } from "../_internal";
const err = "$add expression must resolve to array of numbers.";
const $add = (obj, expr, options) => {
  const args = evalExpr(obj, expr, options);
  const failOnError = options.failOnError;
  let dateFound = false;
  let result = 0;
  if (!isArray(args)) return errInvalidArgs(failOnError, err);
  for (const n of args) {
    if (isNil(n)) return null;
    if (typeof n === "number") {
      result += n;
    } else if (isDate(n)) {
      if (dateFound) {
        return errInvalidArgs(failOnError, "$add must only have one date");
      }
      dateFound = true;
      result += +n;
    } else {
      return errInvalidArgs(failOnError, err);
    }
  }
  return dateFound ? new Date(result) : result;
};
export {
  $add
};
