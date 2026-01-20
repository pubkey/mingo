import { describe, expect, it } from "vitest";

import { aggregate } from "../../src";

// https://stackoverflow.com/a/75245880
describe("Degrees of separation", () => {
  it("passes", () => {
    const input = [
      {
        from: "jerry",
        to: "lois"
      },
      {
        from: "lois",
        to: "jerry"
      },
      {
        from: "superman",
        to: "lois"
      },
      {
        from: "lois",
        to: "superman"
      },
      {
        from: "lois",
        to: "reporter 1"
      },
      {
        from: "reporter 1",
        to: "informant 1"
      },
      {
        from: "informant 1",
        to: "bad guy 1"
      },
      {
        from: "bad guy 1",
        to: "superman"
      }
    ];

    const result = aggregate(input, [
      {
        $match: {
          from: "jerry"
        }
      },
      {
        $graphLookup: {
          from: input,
          startWith: "$to",
          connectFromField: "to",
          connectToField: "from",
          depthField: "depth",
          as: "connections"
        }
      },
      {
        $set: {
          allDegsOfSep: {
            $map: {
              input: {
                $filter: {
                  input: "$connections",
                  as: "conn",
                  cond: {
                    $eq: ["$$conn.to", "superman"]
                  }
                }
              },
              as: "toSuperman",
              in: {
                $sum: [
                  {
                    $toInt: "$$toSuperman.depth"
                  },
                  // +1 zero-based, +1 "to" field
                  2
                ]
              }
            }
          }
        }
      },
      {
        // maybe doc has target
        $set: {
          allDegsOfSep: {
            $cond: [
              {
                $eq: ["$to", "superman"]
              },
              {
                $concatArrays: [[1], "$allDegsOfSep"]
              },
              "$allDegsOfSep"
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          allDegsOfSep: 1,
          degreeOfSeparation: {
            $min: "$allDegsOfSep"
          }
        }
      }
    ]);

    expect(result).toEqual([
      {
        allDegsOfSep: [2, 5],
        degreeOfSeparation: 2
      }
    ]);
  });
});
