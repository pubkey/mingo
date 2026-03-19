import { Aggregator } from "../../aggregator";
import { ComputeOptions, ProcessingMode } from "../../core/_internal";
import { Lazy } from "../../lazy";
function $facet(coll, expr, options) {
  if (!(options.processingMode & ProcessingMode.CLONE_INPUT)) {
    options = {
      ...ComputeOptions.init(options).options,
      processingMode: ProcessingMode.CLONE_INPUT
    };
  }
  return coll.transform((arr) => {
    const o = {};
    for (const [k, stages] of Object.entries(expr)) {
      o[k] = new Aggregator(stages, options).run(arr);
    }
    return Lazy([o]);
  });
}
export {
  $facet
};
