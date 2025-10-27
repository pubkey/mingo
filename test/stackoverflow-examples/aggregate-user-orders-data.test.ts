import { aggregate } from "../../src";

// https://stackoverflow.com/a/79213065
describe("Aggregate User Orders Data", () => {
  const users = [
    {
      orderid: "1111",
      order_type: "individual",
      users: [
        {
          name: "user1",
          phone: 982928,
          items: [
            { name: "AAA", qty: 20, price: 10 },
            { name: "BBB", qty: 30, price: 15 }
          ]
        },
        {
          name: "user2",
          phone: 948783,
          items: [
            { name: "AAA", qty: 10, price: 10 },
            { name: "CCC", qty: 5, price: 20 }
          ]
        },
        {
          name: "user3",
          phone: 787868,
          items: [
            { name: "BBB", qty: 40, price: 10 },
            { name: "CCC", qty: 15, price: 20 }
          ]
        }
      ]
    },
    {
      orderid: "2222",
      order_type: "bulk",
      users: [
        { name: "user1", phone: 982928 },
        { name: "user3", phone: 787868 }
      ],
      items: [
        { name: "AAA", qty: 3, price: 10 },
        { name: "BBB", qty: 15, price: 10 }
      ]
    }
  ];

  it("passes", () => {
    const result = aggregate(users, [
      {
        $set: {
          items: "$$REMOVE",
          users: {
            $map: {
              input: "$users",
              in: { $mergeObjects: ["$$this", { items: "$items" }] }
            }
          }
        }
      },
      {
        $unwind: "$users"
      },
      {
        $group: {
          _id: "$users.name",
          orders: { $addToSet: "$orderid" },
          unique_items: { $addToSet: "$users.items.name" }
        }
      },
      {
        $set: {
          unique_items: {
            $reduce: {
              input: "$unique_items",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }
          }
        }
      },
      {
        $set: {
          unique_items: {
            $size: { $setUnion: "$unique_items" }
          }
        }
      }
    ]);

    expect(result).toEqual([
      {
        _id: "user1",
        orders: ["1111", "2222"],
        unique_items: 2
      },
      {
        _id: "user2",
        orders: ["1111"],
        unique_items: 2
      },
      {
        _id: "user3",
        orders: ["1111", "2222"],
        unique_items: 3
      }
    ]);
  });
});
