import { describe, expect, it } from "vitest";

import { aggregate } from "../../../src";
import { ProcessingMode } from "../../../src/core/_internal";
import { testPath } from "../../support";

const options = {
  processingMode: ProcessingMode.CLONE_INPUT
};

describe(testPath(__filename), () => {
  it("Can Compute Derivative with Unit", () => {
    const result = aggregate(
      [
        {
          truckID: "1",
          timeStamp: new Date("2020-05-18T14:10:30Z"),
          miles: 1295.1
        },
        {
          truckID: "1",
          timeStamp: new Date("2020-05-18T14:11:00Z"),
          miles: 1295.63
        },
        {
          truckID: "1",
          timeStamp: new Date("2020-05-18T14:11:30Z"),
          miles: 1296.25
        },
        {
          truckID: "1",
          timeStamp: new Date("2020-05-18T14:12:00Z"),
          miles: 1296.76
        },
        {
          truckID: "2",
          timeStamp: new Date("2020-05-18T14:10:30Z"),
          miles: 10234.1
        },
        {
          truckID: "2",
          timeStamp: new Date("2020-05-18T14:11:00Z"),
          miles: 10234.33
        },
        {
          truckID: "2",
          timeStamp: new Date("2020-05-18T14:11:30Z"),
          miles: 10234.73
        },
        {
          truckID: "2",
          timeStamp: new Date("2020-05-18T14:12:00Z"),
          miles: 10235.13
        }
      ],
      [
        {
          $setWindowFields: {
            partitionBy: "$truckID",
            sortBy: { timeStamp: 1 },
            output: {
              truckAverageSpeed: {
                $derivative: {
                  input: "$miles",
                  unit: "hour"
                },
                window: {
                  range: [-30, 0],
                  unit: "second"
                }
              }
            }
          }
        },
        {
          $match: {
            truckAverageSpeed: {
              $gt: 50
            }
          }
        }
      ],
      options
    );

    expect(result).toStrictEqual([
      {
        truckID: "1",
        timeStamp: new Date("2020-05-18T14:11:00Z"),
        miles: 1295.63,
        truckAverageSpeed: 63.60000000002401
      },
      {
        truckID: "1",
        timeStamp: new Date("2020-05-18T14:11:30Z"),
        miles: 1296.25,
        truckAverageSpeed: 74.3999999999869
      },
      {
        truckID: "1",
        timeStamp: new Date("2020-05-18T14:12:00Z"),
        miles: 1296.76,
        truckAverageSpeed: 61.19999999999891
      }
    ]);
  });

  it("Can Compute Derivative without Unit (defaults to millisecond)", () => {
    const result = aggregate(
      [
        { _id: 1, x: 0, y: 0 },
        { _id: 2, x: 10, y: 20 },
        { _id: 3, x: 20, y: 60 }
      ],
      [
        {
          $setWindowFields: {
            sortBy: { x: 1 },
            output: {
              slope: {
                $derivative: { input: "$y" },
                window: { documents: ["unbounded", "current"] }
              }
            }
          }
        }
      ],
      options
    );
    // For x=0: only 1 point, returns null
    expect(result[0].slope).toBeNull();
    // For x=10: (20-0)/(10-0) = 2
    expect(result[1].slope).toBe(2);
    // For x=20: (60-0)/(20-0) = 3
    expect(result[2].slope).toBe(3);
  });
});
