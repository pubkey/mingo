import { aggregate, testPath } from "../../support";

describe(testPath(__filename), () => {
  it("Computes and returns the hash value of the input expression", () => {
    const data = [
      { item: "" },
      { item: null },
      { item: undefined },
      { item: true },
      { item: false },
      { item: 0 },
      { item: "0" },
      { item: 123 },
      { item: -123 },
      { item: "123" },
      { item: "-123" },
      { item: 3.14 },
      { item: -3.14 },
      { item: "3.14" },
      { item: "-3.14" },
      { item: [] },
      { item: {} },
      { item: [1, 2, 3] },
      { item: { a: 1, b: 2 } }
    ];

    const result = aggregate(data, [
      {
        $addFields: {
          hashedKey: { $toHashedIndexKey: "$item" }
        }
      }
    ]);

    expect(result).toEqual([
      { item: "", hashedKey: 1084 },
      { item: null, hashedKey: null },
      { item: undefined, hashedKey: null },
      { item: true, hashedKey: 3023732 },
      { item: false, hashedKey: 93690805 },
      { item: 0, hashedKey: 48 },
      { item: "0", hashedKey: 33200 },
      { item: 123, hashedKey: 48624 },
      { item: -123, hashedKey: 1507389 },
      { item: "123", hashedKey: 31799024 },
      { item: "-123", hashedKey: 985770179 },
      { item: 3.14, hashedKey: 1595552 },
      { item: -3.14, hashedKey: 49462093 },
      { item: "3.14", hashedKey: 984948708 },
      { item: "-3.14", hashedKey: 468639063 },
      { item: [], hashedKey: 2840 },
      { item: {}, hashedKey: 3928 },
      { item: [1, 2, 3], hashedKey: 2263927342 },
      { item: { a: 1, b: 2 }, hashedKey: 1283072046 }
    ]);
  });
});
