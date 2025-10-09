import { UpdateOptions } from "../../core";
import { AnyObject, ArrayOrObject } from "../../types";
import { has } from "../../util";
import {
  Action,
  applyUpdate,
  DEFAULT_OPTIONS,
  walkExpression
} from "./_internal";
import { $set } from "./set";

/** Replaces the value of a field with the specified value. */
export const $rename = (
  obj: AnyObject,
  expr: Record<string, string>,
  arrayFilters: AnyObject[] = [],
  options: UpdateOptions = DEFAULT_OPTIONS
) => {
  const res: string[] = [];
  const changed = walkExpression(expr, arrayFilters, options, ((
    val,
    node,
    queries
  ) => {
    return applyUpdate(obj, node, queries, (o: ArrayOrObject, k: string) => {
      if (!has(o as AnyObject, k)) return false;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      res.push(...$set(obj, { [val]: o[k] }, arrayFilters, options));
      delete o[k];
      return true;
    });
  }) as Action<string>);
  return Array.from(new Set(changed.concat(res)));
};
