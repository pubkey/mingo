import { aggregate } from "../../../src";
import { ISODate } from "../../support";

/**
 * You are monitoring various air-conditioning units running in two buildings on an industrial campus.
 * Every 30 minutes, a device in each unit sends the unit's current power consumption reading back to base, which a central database persists.
 * You want to analyse this data to see how much energy in kilowatt-hours (kWh) each air-conditioning unit has consumed over the last hour for each reading received.
 * Furthermore, you want to compute the total energy consumed by all the air-conditioning units combined in each building for every hour.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/time-series/iot-power-consumption.html}
 */
describe("IoT Power Consumption", () => {
  const device_readings = [
    // 11:29am device readings
    {
      buildingID: "Building-ABC",
      deviceID: "UltraAirCon-111",
      timestamp: ISODate("2021-07-03T11:29:59Z"),
      powerKilowatts: 8
    },
    {
      buildingID: "Building-ABC",
      deviceID: "UltraAirCon-222",
      timestamp: ISODate("2021-07-03T11:29:59Z"),
      powerKilowatts: 7
    },
    {
      buildingID: "Building-XYZ",
      deviceID: "UltraAirCon-666",
      timestamp: ISODate("2021-07-03T11:29:59Z"),
      powerKilowatts: 10
    },

    // 11:59am device readings
    {
      buildingID: "Building-ABC",
      deviceID: "UltraAirCon-222",
      timestamp: ISODate("2021-07-03T11:59:59Z"),
      powerKilowatts: 9
    },
    {
      buildingID: "Building-ABC",
      deviceID: "UltraAirCon-111",
      timestamp: ISODate("2021-07-03T11:59:59Z"),
      powerKilowatts: 8
    },
    {
      buildingID: "Building-XYZ",
      deviceID: "UltraAirCon-666",
      timestamp: ISODate("2021-07-03T11:59:59Z"),
      powerKilowatts: 11
    },

    // 12:29pm device readings
    {
      buildingID: "Building-ABC",
      deviceID: "UltraAirCon-222",
      timestamp: ISODate("2021-07-03T12:29:59Z"),
      powerKilowatts: 9
    },
    {
      buildingID: "Building-ABC",
      deviceID: "UltraAirCon-111",
      timestamp: ISODate("2021-07-03T12:29:59Z"),
      powerKilowatts: 9
    },
    {
      buildingID: "Building-XYZ",
      deviceID: "UltraAirCon-666",
      timestamp: ISODate("2021-07-03T12:29:59Z"),
      powerKilowatts: 10
    },

    // 12:59pm device readings
    {
      buildingID: "Building-ABC",
      deviceID: "UltraAirCon-222",
      timestamp: ISODate("2021-07-03T12:59:59Z"),
      powerKilowatts: 8
    },
    {
      buildingID: "Building-ABC",
      deviceID: "UltraAirCon-111",
      timestamp: ISODate("2021-07-03T12:59:59Z"),
      powerKilowatts: 8
    },
    {
      buildingID: "Building-XYZ",
      deviceID: "UltraAirCon-666",
      timestamp: ISODate("2021-07-03T12:59:59Z"),
      powerKilowatts: 11
    },

    // 13:29pm device readings
    {
      buildingID: "Building-ABC",
      deviceID: "UltraAirCon-222",
      timestamp: ISODate("2021-07-03T13:29:59Z"),
      powerKilowatts: 9
    },
    {
      buildingID: "Building-ABC",
      deviceID: "UltraAirCon-111",
      timestamp: ISODate("2021-07-03T13:29:59Z"),
      powerKilowatts: 9
    },
    {
      buildingID: "Building-XYZ",
      deviceID: "UltraAirCon-666",
      timestamp: ISODate("2021-07-03T13:29:59Z"),
      powerKilowatts: 10
    },

    // 13:59pm device readings
    {
      buildingID: "Building-ABC",
      deviceID: "UltraAirCon-222",
      timestamp: ISODate("2021-07-03T13:59:59Z"),
      powerKilowatts: 8
    },
    {
      buildingID: "Building-ABC",
      deviceID: "UltraAirCon-111",
      timestamp: ISODate("2021-07-03T13:59:59Z"),
      powerKilowatts: 8
    },
    {
      buildingID: "Building-XYZ",
      deviceID: "UltraAirCon-666",
      timestamp: ISODate("2021-07-03T13:59:59Z"),
      powerKilowatts: 11
    }
  ];

  it("calculate the energy an air-conditioning unit has consumed over the last hour for each reading received", () => {
    const pipelineRawReadings = [
      // Calculate each unit's energy consumed over the last hour for each reading
      {
        $setWindowFields: {
          partitionBy: "$deviceID",
          sortBy: { timestamp: 1 },
          output: {
            consumedKilowattHours: {
              $integral: {
                input: "$powerKilowatts",
                unit: "hour"
              },
              window: {
                range: [-1, "current"],
                unit: "hour"
              }
            }
          }
        }
      },
      {
        $limit: 5
      }
    ];

    expect(aggregate(device_readings, pipelineRawReadings)).toEqual([
      {
        buildingID: "Building-ABC",
        deviceID: "UltraAirCon-111",
        timestamp: ISODate("2021-07-03T11:29:59.000Z"),
        powerKilowatts: 8,
        consumedKilowattHours: 0
      },
      {
        buildingID: "Building-ABC",
        deviceID: "UltraAirCon-111",
        timestamp: ISODate("2021-07-03T11:59:59.000Z"),
        powerKilowatts: 8,
        consumedKilowattHours: 4
      },
      {
        buildingID: "Building-ABC",
        deviceID: "UltraAirCon-111",
        timestamp: ISODate("2021-07-03T12:29:59.000Z"),
        powerKilowatts: 9,
        consumedKilowattHours: 8.25
      },
      {
        buildingID: "Building-ABC",
        deviceID: "UltraAirCon-111",
        timestamp: ISODate("2021-07-03T12:59:59.000Z"),
        powerKilowatts: 8,
        consumedKilowattHours: 8.5
      },
      {
        buildingID: "Building-ABC",
        deviceID: "UltraAirCon-111",
        timestamp: ISODate("2021-07-03T13:29:59.000Z"),
        powerKilowatts: 9,
        consumedKilowattHours: 8.5
      }
    ]);
  });

  it("compute the total energy consumed by all the air-conditioning units combined in each building for every hour", () => {
    const pipelineBuildingsSummary = [
      // Calculate each unit's energy consumed over the last hour for each reading
      {
        $setWindowFields: {
          partitionBy: "$deviceID",
          sortBy: { timestamp: 1 },
          output: {
            consumedKilowattHours: {
              $integral: {
                input: "$powerKilowatts",
                unit: "hour"
              },
              window: {
                range: [-1, "current"],
                unit: "hour"
              }
            }
          }
        }
      },

      // Sort each reading by unit/device and then by timestamp
      {
        $sort: {
          deviceID: 1,
          timestamp: 1
        }
      },

      // Group readings together for each hour for each device using
      // the last calculated energy consumption field for each hour
      {
        $group: {
          _id: {
            deviceID: "$deviceID",
            date: {
              $dateTrunc: {
                date: "$timestamp",
                unit: "hour"
              }
            }
          },
          buildingID: { $last: "$buildingID" },
          consumedKilowattHours: { $last: "$consumedKilowattHours" }
        }
      },

      // Sum together the energy consumption for the whole building
      // for each hour across all the units in the building
      {
        $group: {
          _id: {
            buildingID: "$buildingID",
            dayHour: {
              $dateToString: { format: "%Y-%m-%d  %H", date: "$_id.date" }
            }
          },
          consumedKilowattHours: { $sum: "$consumedKilowattHours" }
        }
      },

      // Sort the results by each building and then by each hourly summary
      {
        $sort: {
          "_id.buildingID": 1,
          "_id.dayHour": 1
        }
      },

      // Make the results more presentable with meaningful field names
      {
        $set: {
          buildingID: "$_id.buildingID",
          dayHour: "$_id.dayHour",
          _id: "$$REMOVE"
        }
      }
    ];

    expect(aggregate(device_readings, pipelineBuildingsSummary)).toEqual([
      {
        buildingID: "Building-ABC",
        dayHour: "2021-07-03  11",
        consumedKilowattHours: 8
      },
      {
        buildingID: "Building-ABC",
        dayHour: "2021-07-03  12",
        consumedKilowattHours: 17.25
      },
      {
        buildingID: "Building-ABC",
        dayHour: "2021-07-03  13",
        consumedKilowattHours: 17
      },
      {
        buildingID: "Building-XYZ",
        dayHour: "2021-07-03  11",
        consumedKilowattHours: 5.25
      },
      {
        buildingID: "Building-XYZ",
        dayHour: "2021-07-03  12",
        consumedKilowattHours: 10.5
      },
      {
        buildingID: "Building-XYZ",
        dayHour: "2021-07-03  13",
        consumedKilowattHours: 10.5
      }
    ]);
  });
});
