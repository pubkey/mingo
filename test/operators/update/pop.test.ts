import { $pop } from "../../../src/operators/update";

describe("operators/update/pop", () => {
  it("Remove the First Item of an Array", () => {
    const state = { _id: 1, scores: [8, 9, 10] };
    expect($pop({ scores: -1 })(state)).toEqual(["scores"]);
    expect(state).toEqual({ _id: 1, scores: [9, 10] });
  });

  it("Remove the Last Item of an Array", () => {
    const state = { _id: 10, scores: [9, 10] };
    $pop({ scores: 1 })(state);
    expect(state).toEqual({ _id: 10, scores: [9] });
  });

  it("Remove Nothing from Empty Array", () => {
    const state = { _id: 10, scores: [] };
    expect($pop({ scores: 1 })(state)).toEqual([]);
    expect(state).toEqual({ _id: 10, scores: [] });
  });
});
