import { Any, AnyObject } from "../../../src/types";
import { aggregate, ISODate } from "../../support";

/**
 * You have a set of shop orders accumulated over many years, with the retail channel adding new order records continuously to the orders collection throughout each trading day.
 * You want to frequently generate a summary report so management can understand the state of the business and react to changing business trends.
 * Over the years, it takes increasingly longer to generate the report of all daily sums and averages because there is increasingly more days' worth of data to process.
 * From now on, to address this problem, you will only generate each new day's summary analysis at the end of the day and store it in a different collection which accumulates the daily summary records over time.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/trend-analysis/incremental-analytics.html}
 */
describe("Incremental Analytics", () => {
  // Insert records into the orders collection
  // (5 orders for 1st Feb, 4 orders for 2nd Feb)
  const orders = [
    {
      orderdate: ISODate("2021-02-01T08:35:52Z"),
      value: 231.43
    },
    {
      orderdate: ISODate("2021-02-01T09:32:07Z"),
      value: 99.99
    },
    {
      orderdate: ISODate("2021-02-01T08:25:37Z"),
      value: 63.13
    },
    {
      orderdate: ISODate("2021-02-01T19:13:32Z"),
      value: 2.01
    },
    {
      orderdate: ISODate("2021-02-01T22:56:53Z"),
      value: 187.99
    },
    {
      orderdate: ISODate("2021-02-02T23:04:48Z"),
      value: 4.59
    },
    {
      orderdate: ISODate("2021-02-02T08:55:46Z"),
      value: 48.5
    },
    {
      orderdate: ISODate("2021-02-02T07:49:32Z"),
      value: 1024.89
    },
    {
      orderdate: ISODate("2021-02-02T13:49:44Z"),
      value: 102.24
    }
  ];

  const daily_orders_summary = new Array<Any>();

  function getDayAggPipeline(startDay: string, endDay: string): AnyObject[] {
    return [
      // Match orders for one day only
      {
        $match: {
          orderdate: {
            $gte: ISODate(startDay),
            $lt: ISODate(endDay)
          }
        }
      },

      // Group all orders together into one summary record for the day
      {
        $group: {
          _id: null,
          date_parts: { $first: { $dateToParts: { date: "$orderdate" } } },
          total_value: { $sum: "$value" },
          total_orders: { $sum: 1 }
        }
      },

      // Get date parts from 1 order (need year+month+day, for UTC)
      {
        $set: {
          day: {
            $dateFromParts: {
              year: "$date_parts.year",
              month: "$date_parts.month",
              day: "$date_parts.day"
            }
          }
        }
      },

      // Omit unwanted field
      { $unset: ["_id", "date_parts"] },

      // Add day summary to summary collection (overwrite if already exists)
      {
        $merge: {
          into: daily_orders_summary,
          on: "day",
          whenMatched: "replace",
          whenNotMatched: "insert"
        }
      }
    ];
  }

  it("returns aggregation for 1st day", () => {
    // Get the pipeline for the 1st day
    const pipeline = getDayAggPipeline(
      "2021-02-01T00:00:00Z",
      "2021-02-02T00:00:00Z"
    );

    // Run aggregation for 01-Feb-2021 orders & put result in summary collection
    aggregate(orders, pipeline);

    // View the summary collection content (should be 1 record only)
    expect(daily_orders_summary).toEqual([
      {
        total_value: 584.55,
        total_orders: 5,
        day: ISODate("2021-02-01T00:00:00.000Z")
      }
    ]);
  });

  it("returns aggregation for 2nd day", () => {
    // Get the pipeline for the 2nd day
    const pipeline = getDayAggPipeline(
      "2021-02-02T00:00:00Z",
      "2021-02-03T00:00:00Z"
    );

    // Run aggregation for 02-Feb-2021 orders & put result in summary collection
    aggregate(orders, pipeline);

    // View the summary collection content (should be 2 record now)
    expect(daily_orders_summary).toEqual([
      {
        total_value: 584.55,
        total_orders: 5,
        day: ISODate("2021-02-01T00:00:00.000Z")
      },
      {
        total_value: 1180.22,
        total_orders: 4,
        day: ISODate("2021-02-02T00:00:00.000Z")
      }
    ]);
  });

  it("returns aggregation with missed order included", () => {
    // Retrospectively add an order to an older day (01-Feb-2021)
    const ordersUpdated = [
      ...orders,
      {
        orderdate: ISODate("2021-02-01T09:32:07Z"),
        value: 11111.11
      }
    ];

    // Get the pipeline for the 1st day again
    const pipeline = getDayAggPipeline(
      "2021-02-01T00:00:00Z",
      "2021-02-02T00:00:00Z"
    );

    // Re-run aggregation for 01-Feb-2021 overwriting 1st record in summary collections
    aggregate(ordersUpdated, pipeline);

    // View the summary collection content (should still be 2 records but 1st changed)
    expect(daily_orders_summary).toEqual([
      {
        total_value: 11695.66,
        total_orders: 6,
        day: ISODate("2021-02-01T00:00:00.000Z")
      },
      {
        total_value: 1180.22,
        total_orders: 4,
        day: ISODate("2021-02-02T00:00:00.000Z")
      }
    ]);
  });
});
