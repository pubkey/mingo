import { describe, expect, it } from "vitest";

import { aggregate } from "../../../src";
import { ISODate } from "../../support";

/**
 * You want to generate daily summaries for the exchange rates of foreign currency "pairs" (e.g. "Euro-to-USDollar").
 * You need to analyse an array of persisted hourly rates for each currency pair for each day.
 * You will output a daily summary of the open (first), close (last), low (minimum), high (maximum) and average exchange rate values for each currency pair.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-high-low-avg.html}
 */
describe("Summarising Arrays For First, Last, Minimum, Maximum & Average Values", () => {
  const current_pair_values = [
    {
      currencyPair: "USD/GBP",
      day: ISODate("2021-07-05T00:00:00.000Z"),
      hour_values: [
        0.71903411, 0.72741832, 0.71997271, 0.73837282, 0.75262621, 0.74739202,
        0.72972612, 0.73837292, 0.72393721, 0.72746837, 0.73787372, 0.73746483,
        0.73373632, 0.75737372, 0.76783263, 0.75632828, 0.75362823, 0.74682282,
        0.74628263, 0.74726262, 0.75376722, 0.75799222, 0.75545352, 0.74998835
      ]
    },
    {
      currencyPair: "EUR/GBP",
      day: ISODate("2021-07-05T00:00:00.000Z"),
      hour_values: [
        0.86739394, 0.86763782, 0.87362937, 0.87373652, 0.88002736, 0.87866372,
        0.87862628, 0.87374621, 0.87182626, 0.86892723, 0.86373732, 0.86017236,
        0.85873636, 0.85762283, 0.85362373, 0.85306218, 0.85346632, 0.84647462,
        0.8469472, 0.84723232, 0.85002222, 0.85468322, 0.85675656, 0.84811122
      ]
    }
  ];

  const pipeline = [
    // Generate day summaries from the hourly array values
    {
      $set: {
        "summary.open": { $trunc: [{ $first: "$hour_values" }, 8] },
        "summary.low": { $trunc: [{ $min: "$hour_values" }, 8] },
        "summary.high": { $trunc: [{ $max: "$hour_values" }, 8] },
        "summary.close": { $trunc: [{ $last: "$hour_values" }, 8] },
        "summary.average": { $trunc: [{ $avg: "$hour_values" }, 8] }
      }
    },

    // Exclude unrequired fields from each daily currency pair record
    { $unset: ["_id", "hour_values"] }
  ];

  it("returns documents now showing the daily summary open, low, high, close and average prices for each currency pair", () => {
    expect(aggregate(current_pair_values, pipeline)).toEqual([
      {
        currencyPair: "USD/GBP",
        day: ISODate("2021-07-05T00:00:00.000Z"),
        summary: {
          open: 0.71903411,
          low: 0.71903411,
          high: 0.76783263,
          close: 0.74998835,
          average: 0.74275533
        }
      },
      {
        currencyPair: "EUR/GBP",
        day: ISODate("2021-07-05T00:00:00.000Z"),
        summary: {
          open: 0.86739394,
          low: 0.84647462,
          high: 0.88002736,
          close: 0.84811122,
          average: 0.86186929
        }
      }
    ]);
  });
});
