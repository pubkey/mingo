import { aggregate, ISODate } from "../../support";

/**
 * You want to generate a report to show what each shop customer purchased in 2020. You will group the individual order records by customer,
 * capturing each customer's first purchase date, the number of orders they made, the total value of all their orders and a list of their order items sorted by date.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/foundational/group-and-total.html}
 */
describe("Group & Total", () => {
  const orders = [
    {
      customer_id: "elise_smith@myemail.com",
      orderdate: ISODate("2020-05-30T08:35:52Z"),
      value: 231.43
    },
    {
      customer_id: "elise_smith@myemail.com",
      orderdate: ISODate("2020-01-13T09:32:07Z"),
      value: 99.99
    },
    {
      customer_id: "oranieri@warmmail.com",
      orderdate: ISODate("2020-01-01T08:25:37Z"),
      value: 63.13
    },
    {
      customer_id: "tj@wheresmyemail.com",
      orderdate: ISODate("2019-05-28T19:13:32Z"),
      value: 2.01
    },
    {
      customer_id: "tj@wheresmyemail.com",
      orderdate: ISODate("2020-11-23T22:56:53Z"),
      value: 187.99
    },
    {
      customer_id: "tj@wheresmyemail.com",
      orderdate: ISODate("2020-08-18T23:04:48Z"),
      value: 4.59
    },
    {
      customer_id: "elise_smith@myemail.com",
      orderdate: ISODate("2020-12-26T08:55:46Z"),
      value: 48.5
    },
    {
      customer_id: "tj@wheresmyemail.com",
      orderdate: ISODate("2021-02-29T07:49:32Z"),
      value: 1024.89
    },
    {
      customer_id: "elise_smith@myemail.com",
      orderdate: ISODate("2020-10-03T13:49:44Z"),
      value: 102.24
    }
  ];

  it("returns three customers, each showing the customer's first purchase date, the total value of all their orders, the number of orders they made and a list of each order's detail, for 2020 only", () => {
    const pipeline = [
      // Match only orders made in 2020
      {
        $match: {
          orderdate: {
            $gte: ISODate("2020-01-01T00:00:00Z"),
            $lt: ISODate("2021-01-01T00:00:00Z")
          }
        }
      },

      // Sort by order date ascending (required to pick out 'first_purchase_date' below)
      {
        $sort: {
          orderdate: 1
        }
      },

      // Group by customer
      {
        $group: {
          _id: "$customer_id",
          first_purchase_date: { $first: "$orderdate" },
          total_value: { $sum: "$value" },
          total_orders: { $sum: 1 },
          orders: { $push: { orderdate: "$orderdate", value: "$value" } }
        }
      },

      // Sort by each customer's first purchase date
      {
        $sort: {
          first_purchase_date: 1
        }
      },

      // Set customer's ID to be value of the field that was grouped on
      {
        $set: {
          customer_id: "$_id"
        }
      },

      // Omit unwanted fields
      { $unset: ["_id"] }
    ];

    expect(aggregate(orders, pipeline)).toEqual([
      {
        customer_id: "oranieri@warmmail.com",
        first_purchase_date: ISODate("2020-01-01T08:25:37.000Z"),
        total_value: 63.13,
        total_orders: 1,
        orders: [
          {
            orderdate: ISODate("2020-01-01T08:25:37.000Z"),
            value: 63.13
          }
        ]
      },
      {
        customer_id: "elise_smith@myemail.com",
        first_purchase_date: ISODate("2020-01-13T09:32:07.000Z"),
        total_value: 482.16,
        total_orders: 4,
        orders: [
          {
            orderdate: ISODate("2020-01-13T09:32:07.000Z"),
            value: 99.99
          },
          {
            orderdate: ISODate("2020-05-30T08:35:52.000Z"),
            value: 231.43
          },
          {
            orderdate: ISODate("2020-10-03T13:49:44.000Z"),
            value: 102.24
          },
          {
            orderdate: ISODate("2020-12-26T08:55:46.000Z"),
            value: 48.5
          }
        ]
      },
      {
        customer_id: "tj@wheresmyemail.com",
        first_purchase_date: ISODate("2020-08-18T23:04:48.000Z"),
        total_value: 192.58,
        total_orders: 2,
        orders: [
          {
            orderdate: ISODate("2020-08-18T23:04:48.000Z"),
            value: 4.59
          },
          {
            orderdate: ISODate("2020-11-23T22:56:53.000Z"),
            value: 187.99
          }
        ]
      }
    ]);
  });
});
