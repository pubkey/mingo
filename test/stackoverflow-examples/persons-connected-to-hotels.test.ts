import { aggregate } from "../../src";

// https://stackoverflow.com/a/57427863
describe("Give me all persons connected to hotels", () => {
  it("passes", () => {
    const input = [
      {
        _id: 1,
        personId: "Sai",
        pnr: "P1",
        flight: "F1",
        hotel: "H1"
      },
      {
        _id: 2,
        personId: "Sai",
        pnr: "P2",
        flight: "F2",
        hotel: "H2"
      },
      {
        _id: 3,
        personId: "Sai",
        pnr: "P3",
        flight: "F3",
        hotel: "H3"
      },
      {
        _id: 4,
        personId: "Sai",
        pnr: "P4",
        flight: "F4",
        hotel: "H4"
      },
      {
        _id: 5,
        personId: "Sai",
        pnr: "P5",
        flight: "F5",
        hotel: "H5"
      },
      {
        _id: 6,
        personId: "PJ",
        pnr: "P1",
        flight: "F1",
        hotel: "H2"
      },
      {
        _id: 7,
        personId: "PJ",
        pnr: "P2",
        flight: "F1",
        hotel: "H3"
      },
      {
        _id: 8,
        personId: "Kumar",
        pnr: "P6",
        flight: "F6",
        hotel: "H1"
      },
      {
        _id: 9,
        personId: "Kumar",
        pnr: "P7",
        flight: "F7",
        hotel: "H1"
      },
      {
        _id: 10,
        personId: "Kumar",
        pnr: "P8",
        flight: "F8",
        hotel: "H1"
      },
      {
        _id: 11,
        personId: "Kumar",
        pnr: "P9",
        flight: "F9",
        hotel: "H1"
      },
      {
        _id: 12,
        personId: "Kannan",
        pnr: "P10",
        flight: "F10",
        hotel: "H1"
      },
      {
        _id: 13,
        personId: "Kannan",
        pnr: "P11",
        flight: "F11",
        hotel: "H6"
      },
      {
        _id: 14,
        personId: "Akansha",
        pnr: "P12",
        flight: "F12",
        hotel: "H6"
      },
      {
        _id: 15,
        personId: "Akansha",
        pnr: "P13",
        flight: "F13",
        hotel: "H7"
      }
    ];

    const result = aggregate(input, [
      {
        $group: {
          _id: "$personId",
          personId: { $min: "$personId" },
          hotels: { $push: "$hotel" }
        }
      },
      {
        $match: {
          personId: { $ne: "Sai" }
        }
      },
      {
        $lookup: {
          from: input,
          let: {
            personId: "$personId",
            hotel: "$hotels"
          },
          as: "hotel_connections",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$hotel", "$$hotel"] },
                    { $ne: ["H1", "$hotel"] },
                    { $ne: ["$personId", "$$personId"] },
                    { $ne: ["Sai", "$personId"] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: "$personId",
                hotel: { $min: "$hotel" },
                personId: { $min: "$personId" }
              }
            }
          ]
        }
      },
      {
        $match: {
          hotels: { $in: ["H1"] },
          hotel_connections: { $ne: [] }
        }
      }
    ]);

    expect(result).toEqual([
      {
        _id: "Kannan",
        hotel_connections: [
          {
            _id: "Akansha",
            hotel: "H6",
            personId: "Akansha"
          }
        ],
        hotels: ["H1", "H6"],
        personId: "Kannan"
      }
    ]);
  });
});
