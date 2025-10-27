import { aggregate } from "../../../src";
import { ISODate } from "../../support";

/**
 * You want to generate a report to list all shop purchases for 2020, showing the product's name and category for each order, rather than the product's id.
 * To achieve this, you need to take the customer orders collection and join each order record to the corresponding product record in the products collection.
 * There is a many:1 relationship between both collections, resulting in a 1:1 join when matching an order to a product.
 * The join will use a single field comparison between both sides, based on the product's id.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/joining/one-to-one-join.html}
 */
describe("One-to-One Join", () => {
  // Insert 4 records into the products collection
  const products = [
    {
      id: "a1b2c3d4",
      name: "Asus Laptop",
      category: "ELECTRONICS",
      description: "Good value laptop for students"
    },
    {
      id: "z9y8x7w6",
      name: "The Day Of The Triffids",
      category: "BOOKS",
      description: "Classic post-apocalyptic novel"
    },
    {
      id: "ff11gg22hh33",
      name: "Morphy Richardds Food Mixer",
      category: "KITCHENWARE",
      description: "Luxury mixer turning good cakes into great"
    },
    {
      id: "pqr678st",
      name: "Karcher Hose Set",
      category: "GARDEN",
      description: "Hose + nosels + winder for tidy storage"
    }
  ];

  // Insert 4 records into the orders collection
  const orders = [
    {
      customer_id: "elise_smith@myemail.com",
      orderdate: ISODate("2020-05-30T08:35:52Z"),
      product_id: "a1b2c3d4",
      value: 431.43
    },
    {
      customer_id: "tj@wheresmyemail.com",
      orderdate: ISODate("2019-05-28T19:13:32Z"),
      product_id: "z9y8x7w6",
      value: 5.01
    },
    {
      customer_id: "oranieri@warmmail.com",
      orderdate: ISODate("2020-01-01T08:25:37Z"),
      product_id: "ff11gg22hh33",
      value: 63.13
    },
    {
      customer_id: "jjones@tepidmail.com",
      orderdate: ISODate("2020-12-26T08:55:46Z"),
      product_id: "a1b2c3d4",
      value: 429.65
    }
  ];

  it("returns three customers orders that occurred in 2020, but with each order's product_id field replaced by two new looked up fields, product_name and product_category", () => {
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

      // Join "product_id" in orders collection to "id" in products" collection
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "id",
          as: "product_mapping"
        }
      },

      // For this data model, will always be 1 record in right-side
      // of join, so take 1st joined array element
      {
        $set: {
          product_mapping: { $first: "$product_mapping" }
        }
      },

      // Extract the joined embeded fields into top level fields
      {
        $set: {
          product_name: "$product_mapping.name",
          product_category: "$product_mapping.category"
        }
      },

      // Omit unwanted fields
      { $unset: ["_id", "product_id", "product_mapping"] }
    ];

    expect(
      aggregate(orders, pipeline, {
        collectionResolver: _ => products
      })
    ).toEqual([
      {
        customer_id: "elise_smith@myemail.com",
        orderdate: ISODate("2020-05-30T08:35:52.000Z"),
        value: 431.43,
        product_name: "Asus Laptop",
        product_category: "ELECTRONICS"
      },
      {
        customer_id: "oranieri@warmmail.com",
        orderdate: ISODate("2020-01-01T08:25:37.000Z"),
        value: 63.13,
        product_name: "Morphy Richardds Food Mixer",
        product_category: "KITCHENWARE"
      },
      {
        customer_id: "jjones@tepidmail.com",
        orderdate: ISODate("2020-12-26T08:55:46.000Z"),
        value: 429.65,
        product_name: "Asus Laptop",
        product_category: "ELECTRONICS"
      }
    ]);
  });
});
