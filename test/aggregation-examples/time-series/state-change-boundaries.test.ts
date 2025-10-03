import { aggregate, ISODate } from "../../support";

/**
 * You are monitoring various industrial devices (e.g. heaters, fans) contained in the business locations of your clients.
 * You want to understand the typical patterns of when these devices are on and off to help you optimise for sustainability by reducing energy costs and carbon footprint.
 * The source database contains periodic readings for every device, capturing whether each is currently on or off.
 * You need a less verbose view that condenses this data, highlighting each device's timespan in a particular on or off state.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/time-series/state-change-boundaries.html}
 */
describe("State Change Boundaries", () => {
  const device_status = [
    {
      deviceID: "HEATER-111",
      timestamp: ISODate("2021-07-03T11:09:00Z"),
      state: "on"
    },
    {
      deviceID: "FAN-999",
      timestamp: ISODate("2021-07-03T11:09:00Z"),
      state: "on"
    },
    {
      deviceID: "HEATER-111",
      timestamp: ISODate("2021-07-03T11:19:00Z"),
      state: "on"
    },
    {
      deviceID: "HEATER-111",
      timestamp: ISODate("2021-07-03T11:29:00Z"),
      state: "on"
    },
    {
      deviceID: "FAN-999",
      timestamp: ISODate("2021-07-03T11:39:00Z"),
      state: "off"
    },
    {
      deviceID: "HEATER-111",
      timestamp: ISODate("2021-07-03T11:39:00Z"),
      state: "off"
    },
    {
      deviceID: "HEATER-111",
      timestamp: ISODate("2021-07-03T11:49:00Z"),
      state: "off"
    },
    {
      deviceID: "HEATER-111",
      timestamp: ISODate("2021-07-03T11:59:00Z"),
      state: "on"
    },
    {
      deviceID: "DEHUMIDIFIER-555",
      timestamp: ISODate("2021-07-03T11:29:00Z"),
      state: "on"
    }
  ];

  const pipeline = [
    // Capture previous and next records' state into new fields in this current record
    {
      $setWindowFields: {
        partitionBy: "$deviceID",
        sortBy: { timestamp: 1 },
        output: {
          previousState: {
            $shift: {
              output: "$state",
              by: -1
            }
          },
          nextState: {
            $shift: {
              output: "$state",
              by: 1
            }
          }
        }
      }
    },

    // Use current record's timestamp as "startTimestamp" only if state changed from
    // previous record in series, and only set "endMarkerDate" to current record's
    // timestamp if the state changes between current and next records in the series
    {
      $set: {
        startTimestamp: {
          $cond: [
            { $eq: ["$state", "$previousState"] },
            "$$REMOVE",
            "$timestamp"
          ]
        },
        endMarkerDate: {
          $cond: [{ $eq: ["$state", "$nextState"] }, "$$REMOVE", "$timestamp"]
        }
      }
    },

    // Only keep records where state has just changed or is just about to change (so
    // mostly start/end pairs, but not always if state change only lasted one record)
    {
      $match: {
        $expr: {
          $or: [
            { $ne: ["$state", "$previousState"] },
            { $ne: ["$state", "$nextState"] }
          ]
        }
      }
    },

    // Set "nextMarkerDate" to the timestamp of the next record in the series (will
    // be set to 'null' if no next record to indicate 'unbounded')
    {
      $setWindowFields: {
        partitionBy: "$deviceID",
        sortBy: { timestamp: 1 },
        output: {
          nextMarkerDate: {
            $shift: {
              output: "$timestamp",
              by: 1
            }
          }
        }
      }
    },

    // Only keep records at the start of the state change boundaries (throw away
    // matching pair end records, if any)
    {
      $match: {
        $expr: {
          $ne: ["$state", "$previousState"]
        }
      }
    },

    // If no boundary after this record (it's the last matching record in the series),
    // set "endTimestamp" as unbounded (null)
    // Otherwise, if this start boundary record was also an end boundary record (not
    //  paired - only 1 record before state changed), set "endTimestamp" to end timestamp
    // Otherwise, set "endTimestamp" to what was the captured timestamp from the original
    //  matching pair in the series (where the end paired record has since been removed)
    {
      $set: {
        endTimestamp: {
          $switch: {
            branches: [
              // Unbounded, so no final timestamp in series
              {
                case: { $eq: [{ $type: "$nextMarkerDate" }, "null"] },
                then: null
              },
              // Use end timestamp from what was same end record as start record
              {
                case: { $ne: [{ $type: "$endMarkerDate" }, "missing"] },
                then: "$endMarkerDate"
              }
            ],
            // Use timestamp from what was an end record paired with separate start record
            default: "$nextMarkerDate"
          }
        }
      }
    },

    // Remove unwanted fields from the final result
    {
      $unset: [
        "_id",
        "timestamp",
        "previousState",
        "nextState",
        "endMarkerDate",
        "nextMarkerDate"
      ]
    },
    { $sort: { deviceID: 1 } }
  ];

  it("captures the duration between two state change boundaries (on→off or off→on) for each device", () => {
    const result = aggregate(device_status, pipeline);
    expect(result).toEqual([
      {
        deviceID: "DEHUMIDIFIER-555",
        state: "on",
        startTimestamp: ISODate("2021-07-03T11:29:00.000Z"),
        endTimestamp: null
      },
      {
        deviceID: "FAN-999",
        state: "on",
        startTimestamp: ISODate("2021-07-03T11:09:00.000Z"),
        endTimestamp: ISODate("2021-07-03T11:09:00.000Z")
      },
      {
        deviceID: "FAN-999",
        state: "off",
        startTimestamp: ISODate("2021-07-03T11:39:00.000Z"),
        endTimestamp: null
      },
      {
        deviceID: "HEATER-111",
        state: "on",
        startTimestamp: ISODate("2021-07-03T11:09:00.000Z"),
        endTimestamp: ISODate("2021-07-03T11:29:00.000Z")
      },
      {
        deviceID: "HEATER-111",
        state: "off",
        startTimestamp: ISODate("2021-07-03T11:39:00.000Z"),
        endTimestamp: ISODate("2021-07-03T11:49:00.000Z")
      },
      {
        deviceID: "HEATER-111",
        state: "on",
        startTimestamp: ISODate("2021-07-03T11:59:00.000Z"),
        endTimestamp: null
      }
    ]);
  });
});
