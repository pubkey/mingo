import { $unset } from "../../../src/operators/update";

describe("operators/update/unset", () => {
  it("unset fields in an object", () => {
    const state = { item: "chisel", sku: "C001", quantity: 4, instock: true };
    expect($unset(state, { quantity: "", instock: "" })).toEqual([
      "instock",
      "quantity"
    ]);
    expect(state).toEqual({
      item: "chisel",
      sku: "C001"
    });
  });

  it("unset values nested in an array", () => {
    const state = { item: "chisel", nums: [1, 2, 3, 4, 5] };
    expect($unset(state, { "nums.2": "" })).toEqual(["nums.2"]);
    expect(state).toEqual({
      item: "chisel",
      nums: [1, 2, null, 4, 5]
    });
  });
});
