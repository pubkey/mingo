import { describe, expect, it } from "vitest";

import { aggregate } from "../../../src";
import { ProcessingMode } from "../../../src/core/_internal";
import { testPath } from "../../support";

const options = {
  processingMode: ProcessingMode.CLONE_INPUT
};

describe(testPath(__filename), () => {
  it("Can Compute Integral with Unit", () => {
    const result = aggregate(
      [
        {
          powerMeterID: "1",
          timeStamp: new Date("2020-05-18T14:10:30Z"),
          kilowatts: 2.95
        },
        {
          powerMeterID: "1",
          timeStamp: new Date("2020-05-18T14:11:00Z"),
          kilowatts: 2.7
        },
        {
          powerMeterID: "1",
          timeStamp: new Date("2020-05-18T14:11:30Z"),
          kilowatts: 2.6
        },
        {
          powerMeterID: "1",
          timeStamp: new Date("2020-05-18T14:12:00Z"),
          kilowatts: 2.98
        },
        {
          powerMeterID: "2",
          timeStamp: new Date("2020-05-18T14:10:30Z"),
          kilowatts: 2.5
        },
        {
          powerMeterID: "2",
          timeStamp: new Date("2020-05-18T14:11:00Z"),
          kilowatts: 2.25
        },
        {
          powerMeterID: "2",
          timeStamp: new Date("2020-05-18T14:11:30Z"),
          kilowatts: 2.75
        },
        {
          powerMeterID: "2",
          timeStamp: new Date("2020-05-18T14:12:00Z"),
          kilowatts: 2.82
        }
      ],
      [
        {
          $setWindowFields: {
            partitionBy: "$powerMeterID",
            sortBy: { timeStamp: 1 },
            output: {
              powerMeterKilowattHours: {
                $integral: {
                  input: "$kilowatts",
                  unit: "hour"
                },
                window: {
                  range: ["unbounded", "current"],
                  unit: "hour"
                }
              }
            }
          }
        }
      ],
      options
    );

    expect(result).toStrictEqual([
      {
        powerMeterID: "1",
        timeStamp: new Date("2020-05-18T14:10:30Z"),
        kilowatts: 2.95,
        powerMeterKilowattHours: 0
      },
      {
        powerMeterID: "1",
        timeStamp: new Date("2020-05-18T14:11:00Z"),
        kilowatts: 2.7,
        powerMeterKilowattHours: 0.02354166666666667
      },
      {
        powerMeterID: "1",
        timeStamp: new Date("2020-05-18T14:11:30Z"),
        kilowatts: 2.6,
        powerMeterKilowattHours: 0.045625000000000006
      },
      {
        powerMeterID: "1",
        timeStamp: new Date("2020-05-18T14:12:00Z"),
        kilowatts: 2.98,
        powerMeterKilowattHours: 0.068875
      },
      {
        powerMeterID: "2",
        timeStamp: new Date("2020-05-18T14:10:30Z"),
        kilowatts: 2.5,
        powerMeterKilowattHours: 0
      },
      {
        powerMeterID: "2",
        timeStamp: new Date("2020-05-18T14:11:00Z"),
        kilowatts: 2.25,
        powerMeterKilowattHours: 0.019791666666666666
      },
      {
        powerMeterID: "2",
        timeStamp: new Date("2020-05-18T14:11:30Z"),
        kilowatts: 2.75,
        powerMeterKilowattHours: 0.040624999999999994
      },
      {
        powerMeterID: "2",
        timeStamp: new Date("2020-05-18T14:12:00Z"),
        kilowatts: 2.82,
        powerMeterKilowattHours: 0.06383333333333333
      }
    ]);
  });

  it("Can Compute Integral without Unit (defaults to millisecond)", () => {
    const result = aggregate(
      [
        { _id: 1, x: 0, y: 2 },
        { _id: 2, x: 10, y: 4 },
        { _id: 3, x: 20, y: 6 }
      ],
      [
        {
          $setWindowFields: {
            sortBy: { x: 1 },
            output: {
              area: {
                $integral: { input: "$y" },
                window: { documents: ["unbounded", "current"] }
              }
            }
          }
        }
      ],
      options
    );
    // For x=0: only 1 point, integral = 0
    expect(result[0].area).toBe(0);
    // For x=10: trapezoid(2,4)*10 = 0.5*(2+4)*10 = 30
    expect(result[1].area).toBe(30);
    // For x=20: 30 + trapezoid(4,6)*10 = 30 + 0.5*(4+6)*10 = 30 + 50 = 80
    expect(result[2].area).toBe(80);
  });
});
