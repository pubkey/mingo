import { describe, expect, it } from "vitest";

import { $mul } from "../../../src/operators/update";

describe("operators/update/mul", () => {
  it("Multiply the Value of a Field", () => {
    const state = { _id: 1, item: "Hats", price: 10.99, quantity: 25 };
    $mul({
      price: 1.25,
      quantity: 2
    })(state);
    expect(state).toEqual({
      _id: 1,
      item: "Hats",
      price: 13.7375,
      quantity: 50
    });
  });

  it("Apply $mul Operator to a Non-existing Field", () => {
    const state = { _id: 2, item: "Unknown" };
    expect($mul({ price: 100 })(state)).toEqual(["price"]);
    expect(state).toEqual({ _id: 2, item: "Unknown", price: 0 });
  });
});
