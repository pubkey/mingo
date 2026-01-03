import { $max } from "../../../src/operators/update";

describe("operators/update/max", () => {
  it("should take bigger value", () => {
    const state = { _id: 1, highScore: 800, lowScore: 200 };
    expect($max({ highScore: 950 })(state)).toEqual(["highScore"]);
    expect(state).toEqual({ _id: 1, highScore: 950, lowScore: 200 });
  });

  it("should ignore smaller value", () => {
    const state = { _id: 1, highScore: 800, lowScore: 200 };
    expect($max({ highScore: 750 })(state)).toEqual([]);
    expect(state).toEqual({ _id: 1, highScore: 800, lowScore: 200 });
  });

  it("should ignore equal value", () => {
    const state = { _id: 1, highScore: 800, lowScore: 200 };
    expect($max({ highScore: 800 })(state)).toEqual([]);
    expect(state).toEqual({ _id: 1, highScore: 800, lowScore: 200 });
  });
});
