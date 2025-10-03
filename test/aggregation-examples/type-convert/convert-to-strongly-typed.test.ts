import { aggregate, ISODate } from "../../support";

/**
 * A 3rd party has imported a set of retail orders into a MongoDB collection but with all data typing lost (it stored all field values as strings).
 * You want to re-establish correct typing for all the documents and copy them into a new "cleaned" collection.
 * You can incorporate such type transformation logic in the aggregation pipeline because you know the type each field had in the original record structure.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/type-convert/convert-to-strongly-typed.html}
 */
describe("Strongly-Typed Conversion", () => {
  const orders = [
    {
      customer_id: "elise_smith@myemail.com",
      order_date: "2020-05-30T08:35:52Z",
      value: "231.43",
      further_info: {
        item_qty: "3",
        reported: "false"
      }
    },
    {
      customer_id: "oranieri@warmmail.com",
      order_date: "2020-01-01T08:25:37Z",
      value: "63.13",
      further_info: {
        item_qty: "2"
      }
    },
    {
      customer_id: "tj@wheresmyemail.com",
      order_date: "2019-05-28T19:13:32Z",
      value: "2.01",
      further_info: {
        item_qty: "1",
        reported: "true"
      }
    }
  ];

  const pipeline = [
    // Convert strings to required types
    {
      $set: {
        order_date: { $toDate: "$order_date" },
        value: { $toDecimal: "$value" },
        "further_info.item_qty": { $toInt: "$further_info.item_qty" },
        "further_info.reported": {
          $switch: {
            branches: [
              {
                case: { $eq: [{ $toLower: "$further_info.reported" }, "true"] },
                then: true
              },
              {
                case: {
                  $eq: [{ $toLower: "$further_info.reported" }, "false"]
                },
                then: false
              }
            ],
            default: { $ifNull: ["$further_info.reported", "$$REMOVE"] }
          }
        }
      }
    }
  ];
  const collectionResolver = (_: string) => [];

  it(
    [
      "returns same number of documents should appear in the new orders_typed collection as the source collection had,",
      "with the same field structure and fields names, but now using strongly-typed boolean/date/integer/decimal values where appropriate"
    ].join(""),
    () => {
      expect(aggregate(orders, pipeline, { collectionResolver })).toEqual([
        {
          customer_id: "elise_smith@myemail.com",
          further_info: {
            item_qty: 3,
            reported: false
          },
          order_date: ISODate("2020-05-30T08:35:52.000Z"),
          value: 231.43
        },
        {
          customer_id: "oranieri@warmmail.com",
          further_info: {
            item_qty: 2
          },
          order_date: ISODate("2020-01-01T08:25:37.000Z"),
          value: 63.13
        },
        {
          customer_id: "tj@wheresmyemail.com",
          further_info: {
            item_qty: 1,
            reported: true
          },
          order_date: ISODate("2019-05-28T19:13:32.000Z"),
          value: 2.01
        }
      ]);
    }
  );
});
