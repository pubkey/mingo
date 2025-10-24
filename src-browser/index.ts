import { AggregatorImpl } from "../src/aggregator/_internal";
import { ComputeOptions, Context, Options } from "../src/core/_internal";
import { Cursor } from "../src/cursor";
import fullContext from "../src/init/context";
import { Source } from "../src/lazy";
import { QueryImpl } from "../src/query/_internal";
import { AnyObject } from "../src/types";

export { Context, ProcessingMode } from "../src/core";
export { update, updateMany, updateOne } from "../src/updater";

const context = fullContext();
const makeOpts = (options?: Partial<Options>) => {
  return ComputeOptions.init(
    options?.context
      ? {
          ...options,
          context: Context.merge(context, options.context)
        }
      : options
  );
};

export class Query extends QueryImpl {
  constructor(condition: AnyObject, options?: Partial<Options>) {
    super(condition, makeOpts(options));
  }
}

export class Aggregator extends AggregatorImpl {
  constructor(pipeline: AnyObject[], options?: Partial<Options>) {
    super(pipeline, makeOpts(options));
  }
}

export const aggregate = (
  collection: Source,
  pipeline: AnyObject[],
  options?: Partial<Options>
): AnyObject[] => new Aggregator(pipeline, options).run(collection);

export const find = <T>(
  collection: Source,
  criteria: AnyObject,
  projection?: AnyObject,
  options?: Partial<Options>
): Cursor<T> => new Query(criteria, options).find<T>(collection, projection);
