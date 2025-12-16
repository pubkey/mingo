import { ProcessingMode, Query } from "../src";
import * as samples from "./support";

describe("Cursor", () => {
  // create a query with no criteria
  const query = new Query({});
  const newCursor = () => query.find(samples.simpleGradesData);
  const options = { processingMode: ProcessingMode.CLONE_OUTPUT };

  it("should pass all navigation methods", () => {
    const cursor = newCursor();
    cursor.skip(10).limit(10);
    expect(cursor.hasNext()).toEqual(true);
    expect(cursor.next()).toBeTruthy();
    expect(cursor.all()).toBeTruthy(); // exhausts cursor
    expect(cursor.hasNext()).toBe(false);
  });

  it("can sort with collation", () => {
    const cursor = new Query({}, options).find([
      { name: "John" },
      { name: "Bob" },
      { name: "Casey" },
      { name: "Alice" }
    ]);

    cursor.sort({ name: 1 }).collation({ locale: "en" });

    // ensure multiple calls do not change internal buffer.
    expect(cursor.hasNext()).toEqual(true);
    expect(cursor.hasNext()).toEqual(true);
    expect(cursor.hasNext()).toEqual(true);
    expect(cursor.next()).toStrictEqual({ name: "Alice" });
    expect(cursor.hasNext()).toEqual(true);
    expect(cursor.next()).toStrictEqual({ name: "Bob" });
    expect(cursor.hasNext()).toEqual(true);
    expect(cursor.next()).toStrictEqual({ name: "Casey" });
    expect(cursor.hasNext()).toEqual(true);
    expect(cursor.all()).toStrictEqual([{ name: "John" }]);
    expect(cursor.next()).toEqual(undefined);
    expect(cursor.hasNext()).toEqual(false);
    expect(cursor.all()).toStrictEqual([]);
  });

  it("ensure multiple hasNext() calls do not exhaust internal buffer.", () => {
    const cursor = new Query({}, options).find([
      { name: "John" },
      { name: "Bob" },
      { name: "Casey" },
      { name: "Alice" }
    ]);

    // ensure multiple calls do not change internal buffer.
    expect(cursor.hasNext()).toEqual(true);
    expect(cursor.hasNext()).toEqual(true);
    expect(cursor.hasNext()).toEqual(true);
    expect(cursor.hasNext()).toEqual(true);
    expect(cursor.all().length).toEqual(4);
  });
});
