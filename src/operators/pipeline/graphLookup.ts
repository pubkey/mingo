import { computeValue } from "../../core/_internal";
import { Iterator, Lazy } from "../../lazy";
import { Any, AnyObject, Options, PipelineOperator } from "../../types";
import { flatten, HashMap, isNil, isString, setValue } from "../../util";
import { $lookup } from "./lookup";

interface InputExpr {
  /** Collection for the $graphLookup operation to search. */
  from: string | AnyObject[];
  /** Expression that specifies the value of the connectFromField with which to start the recursive search. */
  startWith: Any;
  /** Field name whose value $graphLookup uses to recursively match against the connectToField. */
  connectFromField: string;
  /** Field name in other documents against which to match the value of the field. */
  connectToField: string;
  /** Name of the array field added to each output document. */
  as: string;
  /** Non-negative integral number specifying the maximum recursion depth. */
  maxDepth?: number;
  /** Name of the field to add to each traversed document in the search path. */
  depthField?: string;
  /** A document specifying additional conditions for the recursive search. The syntax is identical to query filter syntax. */
  restrictSearchWithMatch?: AnyObject;
}

/**
 * Performs a recursive search on a collection.
 * To each output document, adds a new array field that contains the traversal results of the recursive search for that document.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/graphLookup/ usage}.
 *
 * @param collection
 * @param expr
 * @param options
 * @returns
 */
export const $graphLookup: PipelineOperator = (
  collection: Iterator,
  expr: InputExpr,
  options: Options
): Iterator => {
  const fromColl = isString(expr.from)
    ? options?.collectionResolver(expr.from)
    : expr.from;

  const {
    connectFromField,
    connectToField,
    as: asField,
    maxDepth,
    depthField,
    restrictSearchWithMatch: matchExpr
  } = expr;

  // extra match condition
  const pipelineExpr = matchExpr ? { pipeline: [{ $match: matchExpr }] } : {};

  return collection.map((obj: AnyObject) => {
    // initial object to start matching
    const matchObj = {};
    setValue(
      matchObj,
      connectFromField,
      computeValue(obj, expr.startWith, null, options)
    );
    let matches: AnyObject[] = [matchObj];
    let i = -1;
    const map = HashMap.init<AnyObject, number>(options.hashFunction);
    do {
      i++;
      matches = flatten(
        $lookup(
          Lazy(matches),
          {
            from: fromColl,
            localField: connectFromField,
            foreignField: connectToField,
            as: asField,
            ...pipelineExpr
          },
          options
        )
          .map(o => o[asField] as AnyObject)
          .collect()
      ) as AnyObject[];
      const oldSize = map.size;
      matches.forEach(k => map.set(k, map.get(k) ?? i));
      // check to see if there are any new items
      if (oldSize == map.size) break;
    } while (isNil(maxDepth) || i < maxDepth);

    const result = new Array(map.size);
    let n = 0;
    map.forEach((v, k) => {
      result[n++] = Object.assign(depthField ? { [depthField]: v } : {}, k);
    });
    return { ...obj, [asField]: result };
  });
};
