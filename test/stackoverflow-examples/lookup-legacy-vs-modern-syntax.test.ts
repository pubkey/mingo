import { aggregate } from "../../src";
import { ObjectId } from "../support";

// https://stackoverflow.com/a/55034166
describe("Ensure Lookup is in Stable Order", () => {
  const firstCollection = [
    {
      _id: ObjectId("5c781752176c512f180048e3"),
      Name: "Pedro",
      Classes: [
        { ID: ObjectId("5c7af2b2f6f6e47c9060d7ce") },
        { ID: ObjectId("5c7af2bcf6f6e47c9060d7cf") },
        { ID: ObjectId("5c7af2aaf6f6e47c9060d7cd") }
      ]
    }
  ];
  const secondCollection = [
    {
      _id: ObjectId("5c7af2aaf6f6e47c9060d7cd"),
      variable1: "A"
    },
    {
      _id: ObjectId("5c7af2b2f6f6e47c9060d7ce"),
      variable1: "B"
    },
    {
      _id: ObjectId("5c7af2bcf6f6e47c9060d7cf"),
      variable1: "C"
    }
  ];

  const expected = [
    {
      _id: ObjectId("5c781752176c512f180048e3"),
      Name: "Pedro",
      Classes: [
        { ID: ObjectId("5c7af2b2f6f6e47c9060d7ce") },
        { ID: ObjectId("5c7af2bcf6f6e47c9060d7cf") },
        { ID: ObjectId("5c7af2aaf6f6e47c9060d7cd") }
      ],
      results: [
        {
          _id: ObjectId("5c7af2b2f6f6e47c9060d7ce"),
          variable1: "B"
        },
        {
          _id: ObjectId("5c7af2bcf6f6e47c9060d7cf"),
          variable1: "C"
        },
        {
          _id: ObjectId("5c7af2aaf6f6e47c9060d7cd"),
          variable1: "A"
        }
      ]
    }
  ];

  it("passes with modern $lookup syntax", () => {
    const result = aggregate(firstCollection, [
      { $match: { _id: ObjectId("5c781752176c512f180048e3") } },
      {
        $lookup: {
          from: secondCollection,
          let: { classIds: "$Classes.ID" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$classIds"] } } },
            { $addFields: { sort: { $indexOfArray: ["$$classIds", "$_id"] } } },
            { $sort: { sort: 1 } },
            { $addFields: { sort: "$$REMOVE" } }
          ],
          as: "results"
        }
      }
    ]);

    expect(result).toEqual(expected);
  });

  it("passes with legacy $lookup syntax", () => {
    const result = aggregate(firstCollection, [
      { $match: { _id: ObjectId("5c781752176c512f180048e3") } },
      {
        $lookup: {
          from: secondCollection,
          localField: "Classes.ID",
          foreignField: "_id",
          as: "results"
        }
      },
      { $unwind: "$results" },
      {
        $addFields: { sort: { $indexOfArray: ["$Classes.ID", "$results._id"] } }
      },
      { $sort: { _id: 1, sort: 1 } },
      {
        $group: {
          _id: "$_id",
          Name: { $first: "$Name" },
          Classes: { $first: "$Classes" },
          results: { $push: "$results" }
        }
      }
    ]);

    expect(result).toEqual(expected);
  });
});
