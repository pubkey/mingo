import { $addToSet } from "../../../src/operators/update";

describe("operators/update/addToSet", () => {
  it("Value to Add is An Array", () => {
    const state = { _id: 1, letters: ["a", "b"] };
    $addToSet({ letters: ["c", "d"] })(state);
    expect(state).toEqual({ _id: 1, letters: ["a", "b", ["c", "d"]] });
  });

  it("Value to Add is a Document", () => {
    const state = {
      _id: 1,
      item: "polarizing_filter",
      tags: ["electronics", "camera"]
    };
    expect($addToSet({ tags: "accessories" })(state)).toEqual(["tags"]);
    expect($addToSet({ tags: "camera" })(state)).toEqual([]);
    expect(state).toEqual({
      _id: 1,
      item: "polarizing_filter",
      tags: ["electronics", "camera", "accessories"]
    });
  });

  it("Add with $each Modifier", () => {
    const state = { _id: 2, item: "cable", tags: ["electronics", "supplies"] };
    $addToSet({ tags: { $each: ["camera", "electronics", "accessories"] } })(
      state
    );
    expect(state).toEqual({
      _id: 2,
      item: "cable",
      tags: ["electronics", "supplies", "camera", "accessories"]
    });
  });
});
