import { AggregatorImpl } from "../../aggregator/_internal";
import {
  ComputeOptions,
  computeValue,
  Options,
  PipelineOperator
} from "../../core";
import { Iterator } from "../../lazy";
import { AnyObject } from "../../types";
import {
  assert,
  hashCode,
  HashMap,
  isArray,
  isString,
  MingoError,
  resolve
} from "../../util";
import { $mergeObjects } from "../expression";

interface InputExpr {
  /** The output collection. */
  readonly into: string | AnyObject[];
  /** Field or fields that act as a unique identifier for a document. */
  readonly on?: string | string[];
  /** Specifies variables for use in the whenMatched pipeline. */
  readonly let?: AnyObject;
  /**
   * The behavior of $merge if a result document and an existing document
   * in the collection have the same value for the specified on field(s).
   */
  readonly whenMatched?:
    | "replace"
    | "keepExisting"
    | "merge"
    | "fail"
    | AnyObject[];
  /** The behavior of $merge if a result document does not match an existing document in the out collection. */
  readonly whenNotMatched?: "insert" | "discard" | "fail";
}

/**
 * Writes the resulting documents of the aggregation pipeline to a collection.
 *
 * NB: Object are deep cloned for outputing regardless of the ProcessingMode.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/merge/ usage}.
 *
 * @param collection
 * @param expr
 * @param options
 * @returns
 */
export const $merge: PipelineOperator = (
  collection: Iterator,
  expr: InputExpr,
  options: Options
): Iterator => {
  const output: AnyObject[] = isString(expr.into)
    ? options?.collectionResolver(expr.into)
    : expr.into;

  assert(isArray(output), `$merge: option 'into' must resolve to an array`);

  const onField = expr.on || options.idKey;

  const getHash = isString(onField)
    ? (o: AnyObject) => hashCode(resolve(o, onField), options.hashFunction)
    : (o: AnyObject) =>
        hashCode(onField.map(s => resolve(o, s), options.hashFunction));

  const map = HashMap.init<number, [AnyObject, number]>();

  // we assuming the lookup expressions are unique
  for (let i = 0; i < output.length; i++) {
    const obj = output[i];
    const k = getHash(obj);
    assert(
      !map.has(k),
      "$merge: 'into' collection must have unique entries for the 'on' field."
    );
    map.set(k, [obj, i]);
  }

  const copts = ComputeOptions.init(options);

  return collection.map((o: AnyObject) => {
    const k = getHash(o);
    if (map.has(k)) {
      const [target, i] = map.get(k);

      // compute variables
      const variables = computeValue(
        target,
        expr.let || { new: "$$ROOT" },
        null,
        // 'root' is the item from the iteration.
        copts.update({ root: o })
      ) as AnyObject;

      if (isArray(expr.whenMatched)) {
        const aggregator = new AggregatorImpl(
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
            throw new MingoError(
              "$merge: failed due to matching as specified by 'whenMatched' option."
            );
          case "keepExisting":
            break;
          case "merge":
          default:
            output[i] = $mergeObjects(
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
          throw new MingoError(
            "$merge: failed due to matching as specified by 'whenMatched' option."
          );
        case "insert":
        default:
          output.push(o);
          break;
      }
    }

    return o; // passthrough
  });
};
