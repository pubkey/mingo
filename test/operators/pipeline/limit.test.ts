import { expect } from "vitest";

import { Any } from "../../../src/types";
import { runTestPipeline, studentsData } from "../../support";

runTestPipeline("operators/pipeline/limit", [
  {
    message: "can apply $limit",
    input: studentsData,
    pipeline: [{ $limit: 20 }],
    expected: (actual: Any[]) => {
      expect(actual.length).toEqual(20);
    }
  }
]);
