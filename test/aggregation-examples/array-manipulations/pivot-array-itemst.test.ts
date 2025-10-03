import { aggregate, ISODate } from "../../support";

/**
 * You have a set of geographically dispersed weather station zones where each zone has multiple
 * sensor devices collecting readings such as temperature, humidity and pressure. Each weather
 * station assembles readings from its devices and once per hour transmits this set of measurements
 * to a central database to store. The set of persisted readings are randomly ordered measurements
 * for different devices in the zone. You need to take the mix of readings and group these by device, so
 * the weather data is easier to consume by downstream dashboards and applications.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/array-manipulations/pivot-array-items.html}
 */
describe("Pivot Array Items By A Key", () => {
  const weather_measurements = [
    {
      weatherStationsZone: "FieldZone-ABCD",
      dayHour: ISODate("2021-07-05T15:00:00.000Z"),
      readings: [
        { device: "ABCD-Device-123", tempCelsius: 18 },
        { device: "ABCD-Device-789", pressureMBar: 1004 },
        { device: "ABCD-Device-123", humidityPercent: 31 },
        { device: "ABCD-Device-123", tempCelsius: 19 },
        { device: "ABCD-Device-123", pressureMBar: 1005 },
        { device: "ABCD-Device-789", humidityPercent: 31 },
        { device: "ABCD-Device-123", humidityPercent: 30 },
        { device: "ABCD-Device-789", tempCelsius: 20 },
        { device: "ABCD-Device-789", pressureMBar: 1003 }
      ]
    },
    {
      weatherStationsZone: "FieldZone-ABCD",
      dayHour: ISODate("2021-07-05T16:00:00.000Z"),
      readings: [
        { device: "ABCD-Device-789", humidityPercent: 33 },
        { device: "ABCD-Device-123", humidityPercent: 32 },
        { device: "ABCD-Device-123", tempCelsius: 22 },
        { device: "ABCD-Device-123", pressureMBar: 1007 },
        { device: "ABCD-Device-789", pressureMBar: 1008 },
        { device: "ABCD-Device-789", tempCelsius: 22 },
        { device: "ABCD-Device-789", humidityPercent: 34 }
      ]
    }
  ];

  const pipeline = [
    // Loop for each unique device, to accumulate an array of devices and their readings
    {
      $set: {
        readings_device_summary: {
          $map: {
            input: {
              $setUnion: "$readings.device" // Get only unique device ids from the array
            },
            as: "device",
            in: {
              $mergeObjects: {
                // Merge array of key:values elements into single object
                $filter: {
                  input: "$readings", // Iterate the "readings" array field
                  as: "reading", // Name the current array element "reading"
                  cond: {
                    // Only include device properties matching the current device
                    $eq: ["$$reading.device", "$$device"]
                  }
                }
              }
            }
          }
        }
      }
    },

    // Exclude unrequired fields from each record
    { $unset: ["_id", "readings"] }
  ];

  it("returns documents with the weather station hourly records containing a new array field of elements representing each device and its measurements", () => {
    expect(aggregate(weather_measurements, pipeline)).toEqual([
      {
        weatherStationsZone: "FieldZone-ABCD",
        dayHour: ISODate("2021-07-05T15:00:00.000Z"),
        readings_device_summary: [
          {
            device: "ABCD-Device-123",
            tempCelsius: 19,
            humidityPercent: 30,
            pressureMBar: 1005
          },
          {
            device: "ABCD-Device-789",
            pressureMBar: 1003,
            humidityPercent: 31,
            tempCelsius: 20
          }
        ]
      },
      {
        weatherStationsZone: "FieldZone-ABCD",
        dayHour: ISODate("2021-07-05T16:00:00.000Z"),
        readings_device_summary: [
          {
            device: "ABCD-Device-789",
            humidityPercent: 34,
            pressureMBar: 1008,
            tempCelsius: 22
          },
          {
            device: "ABCD-Device-123",
            humidityPercent: 32,
            tempCelsius: 22,
            pressureMBar: 1007
          }
        ]
      }
    ]);
  });
});
