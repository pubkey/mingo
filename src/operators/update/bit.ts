import { AnyObject, ArrayOrObject, Options } from "../../types";
import { assert, isNumber, isObject } from "../../util";
import {
  applyUpdate,
  DEFAULT_OPTIONS,
  SingleKeyRecord,
  walkExpression
} from "./_internal";

const BIT_OPS = ["and", "or", "xor"] as const;
type BitOp = (typeof BIT_OPS)[number];

/** Performs a bitwise update of a field. The operator supports AND, OR, and XOR.*/
export const $bit = (
  expr: Record<string, SingleKeyRecord<BitOp, number>>,
  arrayFilters: AnyObject[] = [],
  options: Options = DEFAULT_OPTIONS
) => {
  for (const vals of Object.values(expr)) {
    assert(isObject(vals), `$bit operator expression must be an object.`);
    const op = Object.keys(vals) as BitOp[];
    assert(
      op.length === 1 && BIT_OPS.includes(op[0]),
      `Invalid bit operator '${op[0]}'. Must be one of 'and', 'or', or 'xor'.`
    );
    assert(
      isNumber(vals[op[0]]),
      `Bit operator value must be a number. Got ${typeof vals[op[0]]}`
    );
  }
  return (obj: AnyObject) => {
    return walkExpression<BitOp>(
      expr,
      arrayFilters,
      options,
      (val, node, queries) => {
        const op = Object.keys(val) as BitOp[];
        return applyUpdate(
          obj,
          node,
          queries,
          (o: ArrayOrObject, k: number) => {
            let n = o[k] as number;
            const v = val[op[0]] as number;
            if (n !== undefined && !(isNumber(n) && isNumber(v))) return false;
            n = n || 0;
            if (op[0] === "and") return (o[k] = n & v) !== n;
            if (op[0] === "or") return (o[k] = n | v) !== n;
            if (op[0] === "xor") return (o[k] = n ^ v) !== n;
          },
          { buildGraph: true }
        );
      }
    );
  };
};
