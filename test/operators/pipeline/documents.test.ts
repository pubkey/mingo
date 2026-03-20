import { describe, expect, it } from "vitest";

import { aggregate } from "../../../src";
import { ProcessingMode } from "../../../src/core/_internal";
import { testPath } from "../../support";

describe(testPath(__filename), () => {
  it("Test a Pipeline Stage", () => {
    const result = aggregate(
      [],
      [
        { $documents: [{ x: 10 }, { x: 2 }, { x: 5 }] },
        { $bucketAuto: { groupBy: "$x", buckets: 4 } }
      ]
    );

    expect(result).toEqual([
      { _id: { min: 2, max: 5 }, count: 1 },
      { _id: { min: 5, max: 10 }, count: 1 },
      { _id: { min: 10, max: 10 }, count: 1 }
    ]);
  });

  it("Use a $documents Stage in a $lookup Stage", () => {
    const result = aggregate(
      [
        { zip: 94301, name: "Palo Alto" },
        { zip: 10019, name: "New York" }
      ],
      [
        { $match: {} },
        {
          $lookup: {
            localField: "zip",
            foreignField: "zip_id",
            as: "city_state",
            pipeline: [
              {
                $documents: [
                  { zip_id: 94301, name: "Palo Alto, CA" },
                  { zip_id: 10019, name: "New York, NY" }
                ]
              }
            ]
          }
        }
      ]
    );

    expect(result).toEqual([
      {
        zip: 94301,
        name: "Palo Alto",
        city_state: [{ zip_id: 94301, name: "Palo Alto, CA" }]
      },
      {
        zip: 10019,
        name: "New York",
        city_state: [{ zip_id: 10019, name: "New York, NY" }]
      }
    ]);
  });

  it("clones documents when CLONE_ALL processing mode is set", () => {
    const docs = [{ x: 1 }, { x: 2 }];
    const result = aggregate([], [{ $documents: docs }], {
      processingMode: ProcessingMode.CLONE_ALL
    });
    expect(result).toEqual(docs);
    // Verify the returned objects are clones (not the same references)
    expect(result[0]).not.toBe(docs[0]);
    expect(result[1]).not.toBe(docs[1]);
  });
});
