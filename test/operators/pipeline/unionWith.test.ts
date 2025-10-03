import { AnyObject } from "../../../src/types";
import { cloneDeep } from "../../../src/util";
import { aggregate } from "../../support";

describe("operators/pipeline/unionWith", () => {
  describe("$unionWith", () => {
    const collections = {
      warehouses: [
        { _id: 1, warehouse: "A", region: "West", state: "California" },
        { _id: 2, warehouse: "B", region: "Central", state: "Colorado" },
        { _id: 3, warehouse: "C", region: "East", state: "Florida" }
      ],
      sales2019q1: [
        { store: "A", item: "Chocolates", quantity: 150 },
        { store: "B", item: "Chocolates", quantity: 50 },
        { store: "A", item: "Cookies", quantity: 100 },
        { store: "B", item: "Cookies", quantity: 120 },
        { store: "A", item: "Pie", quantity: 10 },
        { store: "B", item: "Pie", quantity: 5 }
      ],
      sales2019q2: [
        { store: "A", item: "Cheese", quantity: 30 },
        { store: "B", item: "Cheese", quantity: 50 },
        { store: "A", item: "Chocolates", quantity: 125 },
        { store: "B", item: "Chocolates", quantity: 150 },
        { store: "A", item: "Cookies", quantity: 200 },
        { store: "B", item: "Cookies", quantity: 100 },
        { store: "B", item: "Nuts", quantity: 100 },
        { store: "A", item: "Pie", quantity: 30 },
        { store: "B", item: "Pie", quantity: 25 }
      ],
      sales2019q3: [
        { store: "A", item: "Cheese", quantity: 50 },
        { store: "B", item: "Cheese", quantity: 20 },
        { store: "A", item: "Chocolates", quantity: 125 },
        { store: "B", item: "Chocolates", quantity: 150 },
        { store: "A", item: "Cookies", quantity: 200 },
        { store: "B", item: "Cookies", quantity: 100 },
        { store: "A", item: "Nuts", quantity: 80 },
        { store: "B", item: "Nuts", quantity: 30 },
        { store: "A", item: "Pie", quantity: 50 },
        { store: "B", item: "Pie", quantity: 75 }
      ],
      sales2019q4: [
        { store: "A", item: "Cheese", quantity: 100 },
        { store: "B", item: "Cheese", quantity: 100 },
        { store: "A", item: "Chocolates", quantity: 200 },
        { store: "B", item: "Chocolates", quantity: 300 },
        { store: "A", item: "Cookies", quantity: 500 },
        { store: "B", item: "Cookies", quantity: 400 },
        { store: "A", item: "Nuts", quantity: 100 },
        { store: "B", item: "Nuts", quantity: 200 },
        { store: "A", item: "Pie", quantity: 100 },
        { store: "B", item: "Pie", quantity: 100 }
      ],
      sales_2017: [
        { store: "General Store", item: "Chocolates", quantity: 150 },
        { store: "ShopMart", item: "Chocolates", quantity: 50 },
        { store: "General Store", item: "Cookies", quantity: 100 },
        { store: "ShopMart", item: "Cookies", quantity: 120 },
        { store: "General Store", item: "Pie", quantity: 10 },
        { store: "ShopMart", item: "Pie", quantity: 5 }
      ],
      sales_2018: [
        { store: "General Store", item: "Cheese", quantity: 30 },
        { store: "ShopMart", item: "Cheese", quantity: 50 },
        { store: "General Store", item: "Chocolates", quantity: 125 },
        { store: "ShopMart", item: "Chocolates", quantity: 150 },
        { store: "General Store", item: "Cookies", quantity: 200 },
        { store: "ShopMart", item: "Cookies", quantity: 100 },
        { store: "ShopMart", item: "Nuts", quantity: 100 },
        { store: "General Store", item: "Pie", quantity: 30 },
        { store: "ShopMart", item: "Pie", quantity: 25 }
      ],
      sales_2019: [
        { store: "General Store", item: "Cheese", quantity: 50 },
        { store: "ShopMart", item: "Cheese", quantity: 20 },
        { store: "General Store", item: "Chocolates", quantity: 125 },
        { store: "ShopMart", item: "Chocolates", quantity: 150 },
        { store: "General Store", item: "Cookies", quantity: 200 },
        { store: "ShopMart", item: "Cookies", quantity: 100 },
        { store: "General Store", item: "Nuts", quantity: 80 },
        { store: "ShopMart", item: "Nuts", quantity: 30 },
        { store: "General Store", item: "Pie", quantity: 50 },
        { store: "ShopMart", item: "Pie", quantity: 75 }
      ],
      sales_2020: [
        { store: "General Store", item: "Cheese", quantity: 100 },
        { store: "ShopMart", item: "Cheese", quantity: 100 },
        { store: "General Store", item: "Chocolates", quantity: 200 },
        { store: "ShopMart", item: "Chocolates", quantity: 300 },
        { store: "General Store", item: "Cookies", quantity: 500 },
        { store: "ShopMart", item: "Cookies", quantity: 400 },
        { store: "General Store", item: "Nuts", quantity: 100 },
        { store: "ShopMart", item: "Nuts", quantity: 200 },
        { store: "General Store", item: "Pie", quantity: 100 },
        { store: "ShopMart", item: "Pie", quantity: 100 }
      ]
    };

    const options = {
      collectionResolver: (s: string): AnyObject[] =>
        cloneDeep(collections[s]) as AnyObject[]
    };

    it("Duplicates Results", () => {
      const suppliers = [
        { _id: 1, supplier: "Aardvark and Sons", state: "Texas" },
        { _id: 2, supplier: "Bears Run Amok.", state: "Colorado" },
        { _id: 3, supplier: "Squid Mark Inc. ", state: "Rhode Island" }
      ];

      const result = aggregate(
        suppliers,
        [
          { $project: { state: 1, _id: 0 } },
          {
            $unionWith: {
              coll: "warehouses",
              pipeline: [{ $project: { state: 1, _id: 0 } }]
            }
          }
        ],
        options
      );

      expect(result).toStrictEqual([
        { state: "Texas" },
        { state: "Colorado" },
        { state: "Rhode Island" },
        { state: "California" },
        { state: "Colorado" },
        { state: "Florida" }
      ]);
    });

    it("Create a Yearly Report from the Union of Quarterly Data Collections", () => {
      const result = aggregate(
        collections.sales2019q1,
        [
          { $set: { _id: "2019Q1" } },
          {
            $unionWith: {
              coll: "sales2019q2",
              pipeline: [{ $set: { _id: "2019Q2" } }]
            }
          },
          {
            $unionWith: {
              coll: "sales2019q3",
              pipeline: [{ $set: { _id: "2019Q3" } }]
            }
          },
          {
            $unionWith: {
              coll: collections.sales2019q4,
              pipeline: [{ $set: { _id: "2019Q4" } }]
            }
          },
          { $sort: { _id: 1, store: 1, item: 1 } }
        ],
        options
      );

      expect(result).toStrictEqual([
        { _id: "2019Q1", store: "A", item: "Chocolates", quantity: 150 },
        { _id: "2019Q1", store: "A", item: "Cookies", quantity: 100 },
        { _id: "2019Q1", store: "A", item: "Pie", quantity: 10 },
        { _id: "2019Q1", store: "B", item: "Chocolates", quantity: 50 },
        { _id: "2019Q1", store: "B", item: "Cookies", quantity: 120 },
        { _id: "2019Q1", store: "B", item: "Pie", quantity: 5 },
        { _id: "2019Q2", store: "A", item: "Cheese", quantity: 30 },
        { _id: "2019Q2", store: "A", item: "Chocolates", quantity: 125 },
        { _id: "2019Q2", store: "A", item: "Cookies", quantity: 200 },
        { _id: "2019Q2", store: "A", item: "Pie", quantity: 30 },
        { _id: "2019Q2", store: "B", item: "Cheese", quantity: 50 },
        { _id: "2019Q2", store: "B", item: "Chocolates", quantity: 150 },
        { _id: "2019Q2", store: "B", item: "Cookies", quantity: 100 },
        { _id: "2019Q2", store: "B", item: "Nuts", quantity: 100 },
        { _id: "2019Q2", store: "B", item: "Pie", quantity: 25 },
        { _id: "2019Q3", store: "A", item: "Cheese", quantity: 50 },
        { _id: "2019Q3", store: "A", item: "Chocolates", quantity: 125 },
        { _id: "2019Q3", store: "A", item: "Cookies", quantity: 200 },
        { _id: "2019Q3", store: "A", item: "Nuts", quantity: 80 },
        { _id: "2019Q3", store: "A", item: "Pie", quantity: 50 },
        { _id: "2019Q3", store: "B", item: "Cheese", quantity: 20 },
        { _id: "2019Q3", store: "B", item: "Chocolates", quantity: 150 },
        { _id: "2019Q3", store: "B", item: "Cookies", quantity: 100 },
        { _id: "2019Q3", store: "B", item: "Nuts", quantity: 30 },
        { _id: "2019Q3", store: "B", item: "Pie", quantity: 75 },
        { _id: "2019Q4", store: "A", item: "Cheese", quantity: 100 },
        { _id: "2019Q4", store: "A", item: "Chocolates", quantity: 200 },
        { _id: "2019Q4", store: "A", item: "Cookies", quantity: 500 },
        { _id: "2019Q4", store: "A", item: "Nuts", quantity: 100 },
        { _id: "2019Q4", store: "A", item: "Pie", quantity: 100 },
        { _id: "2019Q4", store: "B", item: "Cheese", quantity: 100 },
        { _id: "2019Q4", store: "B", item: "Chocolates", quantity: 300 },
        { _id: "2019Q4", store: "B", item: "Cookies", quantity: 400 },
        { _id: "2019Q4", store: "B", item: "Nuts", quantity: 200 },
        { _id: "2019Q4", store: "B", item: "Pie", quantity: 100 }
      ]);
    });

    it("Report 1: All Sales by Year and Stores and Items", () => {
      const result = aggregate(
        collections.sales_2017,
        [
          { $set: { _id: "2017" } },
          {
            $unionWith: {
              coll: "sales_2018",
              pipeline: [{ $set: { _id: "2018" } }]
            }
          },
          {
            $unionWith: {
              coll: "sales_2019",
              pipeline: [{ $set: { _id: "2019" } }]
            }
          },
          {
            $unionWith: {
              coll: "sales_2020",
              pipeline: [{ $set: { _id: "2020" } }]
            }
          },
          { $sort: { _id: 1, store: 1, item: 1 } }
        ],
        options
      );

      expect(result).toStrictEqual([
        {
          _id: "2017",
          store: "General Store",
          item: "Chocolates",
          quantity: 150
        },
        { _id: "2017", store: "General Store", item: "Cookies", quantity: 100 },
        { _id: "2017", store: "General Store", item: "Pie", quantity: 10 },
        { _id: "2017", store: "ShopMart", item: "Chocolates", quantity: 50 },
        { _id: "2017", store: "ShopMart", item: "Cookies", quantity: 120 },
        { _id: "2017", store: "ShopMart", item: "Pie", quantity: 5 },
        { _id: "2018", store: "General Store", item: "Cheese", quantity: 30 },
        {
          _id: "2018",
          store: "General Store",
          item: "Chocolates",
          quantity: 125
        },
        { _id: "2018", store: "General Store", item: "Cookies", quantity: 200 },
        { _id: "2018", store: "General Store", item: "Pie", quantity: 30 },
        { _id: "2018", store: "ShopMart", item: "Cheese", quantity: 50 },
        { _id: "2018", store: "ShopMart", item: "Chocolates", quantity: 150 },
        { _id: "2018", store: "ShopMart", item: "Cookies", quantity: 100 },
        { _id: "2018", store: "ShopMart", item: "Nuts", quantity: 100 },
        { _id: "2018", store: "ShopMart", item: "Pie", quantity: 25 },
        { _id: "2019", store: "General Store", item: "Cheese", quantity: 50 },
        {
          _id: "2019",
          store: "General Store",
          item: "Chocolates",
          quantity: 125
        },
        { _id: "2019", store: "General Store", item: "Cookies", quantity: 200 },
        { _id: "2019", store: "General Store", item: "Nuts", quantity: 80 },
        { _id: "2019", store: "General Store", item: "Pie", quantity: 50 },
        { _id: "2019", store: "ShopMart", item: "Cheese", quantity: 20 },
        { _id: "2019", store: "ShopMart", item: "Chocolates", quantity: 150 },
        { _id: "2019", store: "ShopMart", item: "Cookies", quantity: 100 },
        { _id: "2019", store: "ShopMart", item: "Nuts", quantity: 30 },
        { _id: "2019", store: "ShopMart", item: "Pie", quantity: 75 },
        { _id: "2020", store: "General Store", item: "Cheese", quantity: 100 },
        {
          _id: "2020",
          store: "General Store",
          item: "Chocolates",
          quantity: 200
        },
        { _id: "2020", store: "General Store", item: "Cookies", quantity: 500 },
        { _id: "2020", store: "General Store", item: "Nuts", quantity: 100 },
        { _id: "2020", store: "General Store", item: "Pie", quantity: 100 },
        { _id: "2020", store: "ShopMart", item: "Cheese", quantity: 100 },
        { _id: "2020", store: "ShopMart", item: "Chocolates", quantity: 300 },
        { _id: "2020", store: "ShopMart", item: "Cookies", quantity: 400 },
        { _id: "2020", store: "ShopMart", item: "Nuts", quantity: 200 },
        { _id: "2020", store: "ShopMart", item: "Pie", quantity: 100 }
      ]);
    });

    it("Report 2: Aggregated Sales by Items", () => {
      const result = aggregate(
        collections.sales_2017,
        [
          { $unionWith: "sales_2018" },
          { $unionWith: "sales_2019" },
          { $unionWith: "sales_2020" },
          { $group: { _id: "$item", total: { $sum: "$quantity" } } },
          { $sort: { total: -1 } }
        ],
        options
      );
      expect(result).toStrictEqual([
        { _id: "Cookies", total: 1720 },
        { _id: "Chocolates", total: 1250 },
        { _id: "Nuts", total: 510 },
        { _id: "Pie", total: 395 },
        { _id: "Cheese", total: 350 }
      ]);
    });

    it("Create a Union with Specified Documents", () => {
      const result = aggregate(
        [
          { _id: 1, flavor: "chocolate" },
          { _id: 2, flavor: "strawberry" },
          { _id: 3, flavor: "cherry" }
        ],
        [
          {
            $unionWith: {
              pipeline: [
                {
                  $documents: [
                    { _id: 4, flavor: "orange" },
                    { _id: 5, flavor: "vanilla", price: 20 }
                  ]
                }
              ]
            }
          }
        ]
      );

      expect(result).toStrictEqual([
        { _id: 1, flavor: "chocolate" },
        { _id: 2, flavor: "strawberry" },
        { _id: 3, flavor: "cherry" },
        { _id: 4, flavor: "orange" },
        { _id: 5, flavor: "vanilla", price: 20 }
      ]);
    });
  });
});
