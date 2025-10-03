import { aggregate } from "../../support";

/**
 * You want to generate a retail report to list the total value and quantity of expensive products sold (valued over 15 dollars).
 * The source data is a list of shop orders, where each order contains the set of products purchased as part of the order.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/foundational/unpack-array-group-differently.html}
 */
describe("Unpack Arrays & Group Differently", () => {
  // Insert 4 records into the orders collection each with 1+ product items
  const orders = [
    {
      order_id: 6363763262239,
      products: [
        {
          prod_id: "abc12345",
          name: "Asus Laptop",
          price: 431.43
        },
        {
          prod_id: "def45678",
          name: "Karcher Hose Set",
          price: 22.13
        }
      ]
    },
    {
      order_id: 1197372932325,
      products: [
        {
          prod_id: "abc12345",
          name: "Asus Laptop",
          price: 429.99
        }
      ]
    },
    {
      order_id: 9812343774839,
      products: [
        {
          prod_id: "pqr88223",
          name: "Morphy Richardds Food Mixer",
          price: 431.43
        },
        {
          prod_id: "def45678",
          name: "Karcher Hose Set",
          price: 21.78
        }
      ]
    },
    {
      order_id: 4433997244387,
      products: [
        {
          prod_id: "def45678",
          name: "Karcher Hose Set",
          price: 23.43
        },
        {
          prod_id: "jkl77336",
          name: "Picky Pencil Sharpener",
          price: 0.67
        },
        {
          prod_id: "xyz11228",
          name: "Russell Hobbs Chrome Kettle",
          price: 15.76
        }
      ]
    }
  ];

  it("returns four expensive products that were referenced multiple times in the customer orders, each showing the product's total order value and amount sold", () => {
    const pipeline = [
      // Unpack each product from each order's product as a new separate record
      {
        $unwind: {
          path: "$products"
        }
      },

      // Match only products valued greater than 15.00
      {
        $match: {
          "products.price": {
            $gt: 15.0
          }
        }
      },

      // Group by product type, capturing each product's total value + quantity
      {
        $group: {
          _id: "$products.prod_id",
          product: { $first: "$products.name" },
          total_value: { $round: [{ $sum: "$products.price" }, 2] },
          quantity: { $sum: 1 }
        }
      },

      // Set product id to be the value of the field that was grouped on
      {
        $set: {
          product_id: "$_id"
        }
      },

      // Omit unwanted fields
      { $unset: ["_id"] }
    ];

    expect(aggregate(orders, pipeline)).toEqual([
      {
        product_id: "abc12345",
        product: "Asus Laptop",
        total_value: 861.42,
        quantity: 2
      },
      {
        product_id: "def45678",
        product: "Karcher Hose Set",
        total_value: 67.34,
        quantity: 3
      },
      {
        product_id: "pqr88223",
        product: "Morphy Richardds Food Mixer",
        total_value: 431.43,
        quantity: 1
      },
      {
        product_id: "xyz11228",
        product: "Russell Hobbs Chrome Kettle",
        total_value: 15.76,
        quantity: 1
      }
    ]);
  });
});
