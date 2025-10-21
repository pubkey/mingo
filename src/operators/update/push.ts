import { Options } from "../../core";
import { Any, AnyObject, ArrayOrObject } from "../../types";
import { compare, has, isEqual, isNumber, isObject, resolve } from "../../util";
import {
  Action,
  applyUpdate,
  clone,
  DEFAULT_OPTIONS,
  walkExpression
} from "./_internal";

const MODIFIERS = ["$each", "$slice", "$sort", "$position"] as const;

/** Appends a specified value to an array. */
export const $push = (
  obj: AnyObject,
  expr: AnyObject,
  arrayFilters: AnyObject[] = [],
  options: Options = DEFAULT_OPTIONS
) => {
  const { cloneMode: mode } = options.updateConfig;
  return walkExpression(expr, arrayFilters, options, ((val, node, queries) => {
    const args: {
      $each: Any[];
      $slice?: number;
      $sort?: Record<string, 1 | -1> | 1 | -1;
      $position?: number;
    } = {
      $each: [val]
    };

    if (isObject(val) && MODIFIERS.some(m => has(val as AnyObject, m))) {
      Object.assign(args, val);
    }

    return applyUpdate(
      obj,
      node,
      queries,
      (o: ArrayOrObject, k: string) => {
        const arr = (o[k] ||= []) as Any[];
        // take a copy of sufficient length.
        const prev = arr.slice(0, args.$slice || arr.length);
        const oldsize = arr.length;
        const pos = isNumber(args.$position) ? args.$position : arr.length;

        // insert new items
        arr.splice(pos, 0, ...(clone(mode, args.$each) as Any[]));

        if (args.$sort) {
          /* eslint-disable @typescript-eslint/no-unsafe-assignment */
          const sortKey = isObject(args.$sort)
            ? Object.keys(args.$sort || {}).pop()
            : "";
          const order: number = !sortKey ? args.$sort : args.$sort[sortKey];
          const f = !sortKey
            ? (a: Any) => a
            : (a: Any) => resolve(a as AnyObject, sortKey);
          arr.sort((a, b) => order * compare(f(a), f(b)));
          /* eslint-enable @typescript-eslint/no-unsafe-assignment */
        }

        // handle slicing
        if (isNumber(args.$slice)) {
          if (args.$slice < 0) arr.splice(0, arr.length + args.$slice);
          else arr.splice(args.$slice);
        }

        // detect change
        return oldsize != arr.length || !isEqual(prev, arr);
      },
      { descendArray: true, buildGraph: true }
    );
  }) as Action);
};
