import { Options } from "../../core/_internal";
import { AnyObject } from "../../types";
import { $documents } from "./documents";

export function filterDocumentsStage(
  pipeline: AnyObject[],
  options: Options
): {
  documents?: AnyObject[];
  pipeline: AnyObject[];
} {
  const docs = !!pipeline && pipeline[0]?.$documents;
  if (!docs) return { pipeline };
  return {
    documents: $documents(null, docs, options).value(),
    pipeline: pipeline.slice(1)
  };
}
