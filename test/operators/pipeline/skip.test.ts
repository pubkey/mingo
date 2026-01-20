import { expect } from "vitest";

import { Any } from "../../../src/types";
import { runTestPipeline, studentsData } from "../../support";

runTestPipeline("operators/pipeline/skip", [
  {
    message: "can skip result with $skip",
    input: studentsData,
    pipeline: [{ $skip: 32 }],
    expected: (result: Any[]) => {
      expect(result.length).toEqual(studentsData.length - 32);
    }
  }
]);
