import { describe, expect, it } from "vitest";

import { aggregate } from "../../../src";
import { ProcessingMode } from "../../../src/core/_internal";
import { testPath } from "../../support";

const options = {
  processingMode: ProcessingMode.CLONE_INPUT
};

describe(testPath(__filename), () => {
  it("Computes minMaxScaler over the window", () => {
    const result = aggregate(
      [{ a: 1 }, { a: 5 }, { a: 13 }, { a: 21 }],
      [
        {
          $setWindowFields: {
            sortBy: { a: 1 },
            output: {
              scaled: { $minMaxScaler: "$a" },
              scaledTo100: { $minMaxScaler: { input: "$a", min: 0, max: 100 } }
            }
          }
        }
      ],
      options
    );

    expect(result).toEqual([
      { a: 1, scaled: 0, scaledTo100: 0 },
      { a: 5, scaled: 0.2, scaledTo100: 20 },
      { a: 13, scaled: 0.6, scaledTo100: 60 },
      { a: 21, scaled: 1, scaledTo100: 100 }
    ]);
  });

  it("Throws if input is not numeric", () => {
    expect(() =>
      aggregate(
        [{ a: 1 }, { a: 5 }, { a: "x" }, { a: 21 }],
        [
          {
            $setWindowFields: {
              sortBy: { a: 1 },
              output: {
                scaled: { $minMaxScaler: "$a" }
              }
            }
          }
        ],
        options
      )
    ).toThrow("$minMaxScaler: input must be a numeric array");
  });

  it("correctly updates rmax when max is not the first element", () => {
    // Sort by b but scale on a, so a values are not in ascending order
    const result = aggregate(
      [
        { a: 5, b: 1 },
        { a: 1, b: 2 },
        { a: 13, b: 3 },
        { a: 21, b: 4 }
      ],
      [
        {
          $setWindowFields: {
            sortBy: { b: 1 },
            output: {
              scaled: { $minMaxScaler: "$a" }
            }
          }
        }
      ],
      options
    );
    // min=1, max=21, range=20
    // a=5: (5-1)/20 = 0.2
    expect(result[0].scaled).toBe(0.2);
    // a=1: (1-1)/20 = 0
    expect(result[1].scaled).toBe(0);
    // a=13: (13-1)/20 = 0.6
    expect(result[2].scaled).toBe(0.6);
    // a=21: (21-1)/20 = 1
    expect(result[3].scaled).toBe(1);
  });
});
