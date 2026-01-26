import { describe, expect, it } from "vitest";

import { aggregate } from "../../../src";
import { runTest } from "../../support";

runTest("operators/expression/boolean", {
  $and: [
    [[1, "green"], true],
    [[], true],
    [[[null], [false], [0]], true],
    [[null, true], false],
    [[0, true], false]
  ],
  $not: [
    [[true], false],
    [[[false]], false],
    [[false], true],
    [[null], true],
    [[0], true],
    [[0, 1], Error()],
    // single values
    [true, false],
    [0, true],
    ["string", false],
    ["", true],
    ["", true, { useStrictMode: false }],
    [[], false]
  ],
  $or: [
    [[true, false], true],
    [[[false], false], true],
    [[null, 0, undefined], false],
    [[], false]
  ]
});

describe("Boolean Operators: More Examples", () => {
  const inventory = [
    { _id: 1, item: "abc1", description: "product 1", qty: 300 },
    { _id: 2, item: "abc2", description: "product 2", qty: 200 },
    { _id: 3, item: "xyz1", description: "product 3", qty: 250 },
    { _id: 4, item: "VWZ1", description: "product 4", qty: 300 },
    { _id: 5, item: "VWZ2", description: "product 5", qty: 180 }
  ];

  it("can apply $and operator", () => {
    const result = aggregate(inventory, [
      {
        $project: {
          item: 1,
          result: { $and: [{ $gt: ["$qty", 100] }, { $lt: ["$qty", 250] }] }
        }
      }
    ]);
    expect(result).toEqual([
      { _id: 1, item: "abc1", result: false },
      { _id: 2, item: "abc2", result: true },
      { _id: 3, item: "xyz1", result: false },
      { _id: 4, item: "VWZ1", result: false },
      { _id: 5, item: "VWZ2", result: true }
    ]);
  });

  it("can apply $or aggregate operator", () => {
    const result = aggregate(inventory, [
      {
        $project: {
          item: 1,
          result: { $or: [{ $gt: ["$qty", 250] }, { $lt: ["$qty", 200] }] }
        }
      }
    ]);

    expect(result).toEqual([
      { _id: 1, item: "abc1", result: true },
      { _id: 2, item: "abc2", result: false },
      { _id: 3, item: "xyz1", result: false },
      { _id: 4, item: "VWZ1", result: true },
      { _id: 5, item: "VWZ2", result: true }
    ]);
  });

  it("can apply $not aggregate operator", () => {
    const result = aggregate(inventory, [
      {
        $project: {
          item: 1,
          result: { $not: [{ $gt: ["$qty", 250] }] }
        }
      }
    ]);

    expect(result).toEqual([
      { _id: 1, item: "abc1", result: false },
      { _id: 2, item: "abc2", result: true },
      { _id: 3, item: "xyz1", result: true },
      { _id: 4, item: "VWZ1", result: false },
      { _id: 5, item: "VWZ2", result: true }
    ]);
  });

  it("can apply $in aggregate operator", () => {
    const result = aggregate(inventory, [
      {
        $project: {
          item: 1,
          result: { $in: ["$item", ["abc1", "abc2"]] }
        }
      }
    ]);

    expect(result).toEqual([
      { _id: 1, item: "abc1", result: true },
      { _id: 2, item: "abc2", result: true },
      { _id: 3, item: "xyz1", result: false },
      { _id: 4, item: "VWZ1", result: false },
      { _id: 5, item: "VWZ2", result: false }
    ]);
  });
});
