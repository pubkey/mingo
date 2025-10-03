import { ComputeOptions, Options } from "../core";
import { $match } from "../operators/pipeline/match";
import { $project } from "../operators/pipeline/project";
import { $sort } from "../operators/pipeline/sort";
import { AnyObject } from "../types";
import { AggregatorImpl } from "./_internal";

/**
 * The `Aggregator` class provides functionality to process data collections
 * through an aggregation pipeline. It supports streaming and executing
 * aggregation operations with customizable options.
 */
export class Aggregator extends AggregatorImpl {
  /**
   * Creates an instance of the Aggregator class.
   *
   * @param pipeline - An array of objects representing the aggregation pipeline stages.
   * @param options - Optional configuration settings for the aggregator.
   */
  constructor(pipeline: AnyObject[], options?: Partial<Options>) {
    const opts = ComputeOptions.init(options);
    opts.context.addPipelineOps({ $match, $project, $sort });
    super(pipeline, opts);
  }
}
