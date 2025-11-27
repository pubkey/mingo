import { aggregate } from "../../../src";
import { testPath } from "../../support";

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
      { item: "", hashedKey: 1987565545 },
      { item: null, hashedKey: 3530670207 },
      { item: undefined, hashedKey: 3241479426 },
      { item: true, hashedKey: 1427630344 },
      { item: false, hashedKey: 2545049170 },
      { item: 0, hashedKey: 2882822322 },
      { item: "0", hashedKey: 2167639427 },
      { item: 123, hashedKey: 289662779 },
      { item: -123, hashedKey: 600755326 },
      { item: "123", hashedKey: 269761036 },
      { item: "-123", hashedKey: 3157440593 },
      { item: 3.14, hashedKey: 1773211978 },
      { item: -3.14, hashedKey: 352188871 },
      { item: "3.14", hashedKey: 380010096 },
      { item: "-3.14", hashedKey: 2994886030 },
      { item: [], hashedKey: 1423767502 },
      { item: {}, hashedKey: 1950882977 },
      { item: [1, 2, 3], hashedKey: 219003440 },
      { item: { a: 1, b: 2 }, hashedKey: 2141591136 }
    ]);
  });
});
