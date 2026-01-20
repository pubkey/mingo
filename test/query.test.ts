import { describe, expect, it } from "vitest";

import { find, Query } from "../src";

describe("Query", () => {
  it("should query deeply nested arrays", () => {
    const query = new Query({ "children.children.flags": "foobar" });
    const result = query.test({
      children: [
        {
          children: [
            {
              flags: ["foobar"]
            }
          ]
        },
        {
          children: [
            {
              flags: []
            }
          ]
        }
      ]
    });

    expect(result).toBe(true);
  });

  it("should fail for unknown operator", () => {
    expect(() => find([{ a: 1 }], { a: { $cut: 3 } }, { a: 1 }).all()).toThrow(
      /unknown query operator/
    );
  });
});
