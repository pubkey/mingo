import { $currentDate } from "../../../src/operators/update";

describe("operators/update/currentDate", () => {
  it("should set field to current date", () => {
    const state = { _id: 1, status: "a", lastModified: 100 };
    const past = state.lastModified;
    expect(
      $currentDate({
        lastModified: { $type: "timestamp" },
        startDate: true,
        endDate: { $type: "date" }
      })(state)
    ).toEqual(["endDate", "lastModified", "startDate"]);
    expect(state.lastModified).toBeGreaterThan(past);
    expect(state["startDate"]).toEqual(state["endDate"]);
    expect(state["startDate"]).toBeInstanceOf(Date);
  });
});
