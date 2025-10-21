import { clone, Trie } from "../src/operators/update/_internal";
import { update, updateMany } from "../src/updater";
import { isArray } from "../src/util";
import { DEFAULT_OPTS, find, ISODate } from "./support";

describe("updater", () => {
  describe("Trie: Conflict Detection", () => {
    it("should detect conflicts for overlapping paths: nested -> root", () => {
      const trie = new Trie();
      expect(trie.add("name.firstname")).toBe(true);
      expect(trie.add("name.lastname")).toBe(true);
      expect(trie.add("name")).toBe(false);
      expect(trie.add("age")).toBe(true);
    });

    it("should detect conflicts for overlapping paths: root -> nested", () => {
      const trie = new Trie();
      expect(trie.add("name")).toBe(true);
      expect(trie.add("name.firstname")).toBe(false);
      expect(trie.add("address")).toBe(true);
      expect(trie.add("address.street.name")).toBe(false);
    });

    it("should not detect conflict for non-overlapping paths", () => {
      const trie = new Trie();
      expect(trie.add("name.firstname")).toBe(true);
      expect(trie.add("name.lastname")).toBe(true);
      expect(trie.add("address.street")).toBe(true);
      expect(trie.add("address.city")).toBe(true);
    });
  });

  describe("update()", () => {
    const obj = {};
    beforeEach(() => {
      Object.assign(obj, { name: "John", age: 30 });
    });

    it("should allow multiple selectors with same parent conflict", () => {
      const state = { name: { firstname: "John", lastname: "Wick" }, age: 30 };
      update(state, {
        $set: { "name.firstname": "Freddy", "name.lastname": "Mercury" }
      });
      expect(state.name.firstname).toBe("Freddy");
      expect(state.name.lastname).toBe("Mercury");
    });

    it("should FAIL if multiple selectors on same operator have path conflict", () => {
      const state = { name: { firstname: "John", lastname: "Wick" }, age: 30 };
      expect(() =>
        update(state, {
          $set: { "name.firstname": "Freddy", name: { firstname: "John" } }
        })
      ).toThrow();
    });

    it("should FAIL if multiple selectors on different operators have path conflict", () => {
      const state = { name: { firstname: "John", lastname: "Wick" }, age: 30 };
      expect(() =>
        update(state, {
          $set: { "name.firstname": "Freddy", name: { firstname: "John" } }
        })
      ).toThrow();
    });

    it("should contain valid operator in expression", () => {
      const expr = { $set: { name: "Fred" } };
      expr["$cos"] = { age: 2 };
      delete expr["$set" as string];
      expect(() => update(obj, expr)).toThrow(
        /operator '\$cos' is not supported/
      );
    });

    it("should check condition before update", () => {
      expect(
        update(obj, { $set: { name: "Fred" } }, [], { age: { $lt: 10 } })
      ).toEqual([]);
      expect(obj).toEqual({ name: "John", age: 30 });
    });

    it("should apply update on valid condition expression", () => {
      expect(
        update(obj, { $set: { name: "Fred" } }, [], { age: { $gt: 10 } })
      ).toEqual(["name"]);
      expect(obj).toEqual({ name: "Fred", age: 30 });
    });

    it("should not apply update on invalid condition expression", () => {
      expect(obj).toEqual({ name: "John", age: 30 });
      expect(update(obj, { $set: { name: "Fred" } }, [], { age: 10 })).toEqual(
        []
      );
      expect(obj).toEqual({ name: "John", age: 30 });
    });

    it("should apply update on valid condition query", () => {
      expect(
        update(obj, { $set: { name: "Fred" } }, [], { age: { $gt: 10 } })
      ).toEqual(["name"]);
      expect(obj).toEqual({ name: "Fred", age: 30 });
    });

    it.each([{ a: 1 }, [{ a: 1 }], new Date("2022-02-01")])(
      "should apply clone mode: %p",
      val => {
        const a = clone("deep", val);
        const b = clone("copy", val);
        const c = clone("none", val);

        expect(val).toEqual(a);
        expect(val).toEqual(b);
        expect(val).toEqual(c);

        expect(val).not.toBe(a);
        expect(val).not.toBe(b);
        expect(val).toBe(c);

        if (isArray(val)) {
          expect(val[0]).not.toBe((a as unknown[])[0]);
          expect(val[0]).toBe((b as unknown[])[0]);
          expect(val[0]).toBe((c as unknown[])[0]);
        }
      }
    );
  });

  describe("updateMany() with expressions", () => {
    it("performs idempotent updates", () => {
      const employees = [
        { _id: 1, name: "Rob", salary: 37000 },
        { _id: 2, name: "Trish", salary: 65000 },
        { _id: 3, name: "Zeke", salary: 99999 },
        { _id: 4, name: "Mary", salary: 200000 }
      ];

      expect(
        updateMany(
          employees,
          { salary: { $lt: 100000 }, raiseApplied: { $ne: true } },
          { $inc: { salary: 1000 }, $set: { raiseApplied: true } }
        )
      ).toEqual({ matchedCount: 3, modifiedCount: 3 });
      expect(employees).toEqual([
        { _id: 1, name: "Rob", salary: 38000, raiseApplied: true },
        { _id: 2, name: "Trish", salary: 66000, raiseApplied: true },
        { _id: 3, name: "Zeke", salary: 100999, raiseApplied: true },
        { _id: 4, name: "Mary", salary: 200000 }
      ]);

      expect(
        updateMany(employees, {}, { $unset: { raiseApplied: 1 } })
      ).toEqual({ matchedCount: 4, modifiedCount: 3 });

      expect(employees).toEqual([
        { _id: 1, name: "Rob", salary: 38000 },
        { _id: 2, name: "Trish", salary: 66000 },
        { _id: 3, name: "Zeke", salary: 100999 },
        { _id: 4, name: "Mary", salary: 200000 }
      ]);
    });

    it("should Update Multiple Documents", () => {
      const restaurants = [
        { _id: 1, name: "Central Perk Cafe", violations: 3 },
        { _id: 2, name: "Rock A Feller Bar and Grill", violations: 2 },
        { _id: 3, name: "Empire State Sub", violations: 5 },
        { _id: 4, name: "Pizza Rat's Pizzaria", violations: 8 }
      ];

      expect(
        updateMany(
          restaurants,
          { violations: { $gt: 4 } },
          { $set: { Review: true } }
        )
      ).toEqual({ matchedCount: 2, modifiedCount: 2 });

      expect(restaurants).toEqual([
        { _id: 1, name: "Central Perk Cafe", violations: 3 },
        { _id: 2, name: "Rock A Feller Bar and Grill", violations: 2 },
        { _id: 3, name: "Empire State Sub", violations: 5, Review: true },
        { _id: 4, name: "Pizza Rat's Pizzaria", violations: 8, Review: true }
      ]);
    });
  });

  describe("updateMany() with pipeline", () => {
    it("Update with Aggregation Pipeline Using Existing Fields", () => {
      const students = [
        {
          _id: 1,
          student: "Skye",
          points: 75,
          commentsSemester1: "great at math",
          commentsSemester2: "loses temper",
          lastUpdate: ISODate("2019-01-01T00:00:00Z")
        },
        {
          _id: 2,
          student: "Elizabeth",
          points: 60,
          commentsSemester1: "well behaved",
          commentsSemester2: "needs improvement",
          lastUpdate: ISODate("2019-01-01T00:00:00Z")
        }
      ];

      const now = new Date();

      expect(
        updateMany(
          students,
          {},
          [
            {
              $set: {
                status: "Modified", // missing in MongoDB docs
                comments: ["$commentsSemester1", "$commentsSemester2"],
                lastUpdate: "$$NOW"
              }
            },
            { $unset: ["commentsSemester1", "commentsSemester2"] }
          ],
          [],
          { variables: { NOW: now } }
        )
      ).toEqual({ matchedCount: 2, modifiedCount: 2 });

      expect(students).toEqual([
        {
          _id: 1,
          student: "Skye",
          status: "Modified",
          points: 75,
          lastUpdate: now,
          comments: ["great at math", "loses temper"]
        },
        {
          _id: 2,
          student: "Elizabeth",
          status: "Modified",
          points: 60,
          lastUpdate: now,
          comments: ["well behaved", "needs improvement"]
        }
      ]);
    });

    it("Update with Aggregation Pipeline Using Existing Fields Conditionally", () => {
      const students = [
        {
          _id: 1,
          tests: [95, 92, 90],
          lastUpdate: ISODate("2019-01-01T00:00:00Z")
        },
        {
          _id: 2,
          tests: [94, 88, 90],
          lastUpdate: ISODate("2019-01-01T00:00:00Z")
        },
        {
          _id: 3,
          tests: [70, 75, 82],
          lastUpdate: ISODate("2019-01-01T00:00:00Z")
        }
      ];

      const now = new Date();
      const res = updateMany(
        students,
        {},
        [
          {
            $set: {
              average: { $trunc: [{ $avg: "$tests" }, 0] },
              lastUpdate: "$$NOW"
            }
          },
          {
            $set: {
              grade: {
                $switch: {
                  branches: [
                    { case: { $gte: ["$average", 90] }, then: "A" },
                    { case: { $gte: ["$average", 80] }, then: "B" },
                    { case: { $gte: ["$average", 70] }, then: "C" },
                    { case: { $gte: ["$average", 60] }, then: "D" }
                  ],
                  default: "F"
                }
              }
            }
          }
        ],
        [],
        { ...DEFAULT_OPTS, variables: { NOW: now } }
      );

      expect(res).toEqual({ matchedCount: 3, modifiedCount: 3 });

      expect(students).toEqual([
        {
          _id: 1,
          tests: [95, 92, 90],
          lastUpdate: now,
          average: 92,
          grade: "A"
        },
        {
          _id: 2,
          tests: [94, 88, 90],
          lastUpdate: now,
          average: 90,
          grade: "A"
        },
        {
          _id: 3,
          tests: [70, 75, 82],
          lastUpdate: now,
          average: 75,
          grade: "C"
        }
      ]);
    });
  });

  describe("Positional Operators", () => {
    it("Update Values in an Array", () => {
      const input = [
        { _id: 1, grades: [85, 80, 80] },
        { _id: 2, grades: [88, 90, 92] },
        { _id: 3, grades: [85, 100, 90] }
      ];
      const result = [
        { _id: 1, grades: [85, 82, 80] },
        { _id: 2, grades: [88, 90, 92] },
        { _id: 3, grades: [85, 100, 90] }
      ];

      input.forEach(o =>
        update(o, { $set: { "grades.$": 82 } }, [], { _id: 1, grades: 80 })
      );

      expect(input).toEqual(result);
    });

    it("Update Documents in an Array", () => {
      const input = {
        _id: 4,
        grades: [
          { grade: 80, mean: 75, std: 8 },
          { grade: 85, mean: 90, std: 5 },
          { grade: 85, mean: 85, std: 8 }
        ]
      };

      update(input, { $set: { "grades.$.std": 6 } }, [], {
        _id: 4,
        "grades.grade": 85
      });

      expect(input).toEqual({
        _id: 4,
        grades: [
          { grade: 80, mean: 75, std: 8 },
          { grade: 85, mean: 90, std: 6 },
          { grade: 85, mean: 85, std: 8 }
        ]
      });
    });

    it("Update Embedded Documents Using Multiple Field Matches", () => {
      const input = {
        _id: 5,
        grades: [
          { grade: 80, mean: 75, std: 8 },
          { grade: 85, mean: 90, std: 5 },
          { grade: 90, mean: 85, std: 3 }
        ]
      };

      update(input, { $set: { "grades.$.std": 6 } }, [], {
        _id: 5,
        grades: { $elemMatch: { grade: { $lte: 90 }, mean: { $gt: 80 } } }
      });

      expect(input).toEqual({
        _id: 5,
        grades: [
          { grade: 80, mean: 75, std: 8 },
          { grade: 85, mean: 90, std: 6 },
          { grade: 90, mean: 85, std: 3 }
        ]
      });
    });

    it("Update with Multiple Array Matches", () => {
      const input = {
        _id: 8,
        activity_ids: [1, 2],
        grades: [90, 95],
        deans_list: [2021, 2020]
      };

      update(input, { $set: { "deans_list.$": 2022 } }, [], {
        activity_ids: 1,
        grades: 95,
        deans_list: 2021
      });

      expect(input).toEqual({
        _id: 8,
        activity_ids: [1, 2],
        grades: [90, 95],
        deans_list: [2022, 2020]
      });
    });
  });

  describe.sequential("Positional Operators: More examples", () => {
    const input = [
      {
        _id: "SF",
        engineering: [
          { name: "Alice", email: "missingEmail", salary: 100000 },
          { name: "Bob", email: "missingEmail", salary: 75000 }
        ],
        sales: [
          {
            name: "Charlie",
            email: "charlie@mail.com",
            salary: 90000,
            bonus: 1000
          }
        ]
      },
      {
        _id: "NYC",
        engineering: [{ name: "Dave", email: "dave@mail.com", salary: 55000 }],
        sales: [
          { name: "Ed", email: "ed@mail.com", salary: 99000, bonus: 2000 },
          {
            name: "Fran",
            email: "fran@mail.com",
            salary: 50000,
            bonus: 10000
          }
        ]
      }
    ];

    it("Use the $ Operator to Update the First Match in an Array", () => {
      update(
        input[0],
        { $set: { "engineering.$.email": "alice@mail.com" } },
        [],
        { "engineering.email": "missingEmail" }
      );

      expect(input[0]).toEqual({
        _id: "SF",
        engineering: [
          { name: "Alice", email: "alice@mail.com", salary: 100000 },
          { name: "Bob", email: "missingEmail", salary: 75000 }
        ],
        sales: [
          {
            name: "Charlie",
            email: "charlie@mail.com",
            salary: 90000,
            bonus: 1000
          }
        ]
      });

      update(
        input[0],
        { $set: { "engineering.$.email": "bob@mail.com" } },
        [],
        {
          engineering: { $elemMatch: { name: "Bob", email: "missingEmail" } }
        }
      );

      expect(input[0]).toEqual({
        _id: "SF",
        engineering: [
          { name: "Alice", email: "alice@mail.com", salary: 100000 },
          { name: "Bob", email: "bob@mail.com", salary: 75000 }
        ],
        sales: [
          {
            name: "Charlie",
            email: "charlie@mail.com",
            salary: 90000,
            bonus: 1000
          }
        ]
      });
    });

    it("Use the $[] Operator to Update All Array Elements Within a Document", () => {
      input.forEach(o => {
        update(o, { $inc: { "sales.$[].bonus": 2000 } }, [], { _id: "NYC" });
      });

      expect(find(input, { _id: "NYC" }, { sales: 1, _id: 0 }).all()).toEqual([
        {
          sales: [
            { name: "Ed", email: "ed@mail.com", salary: 99000, bonus: 4000 },
            {
              name: "Fran",
              email: "fran@mail.com",
              salary: 50000,
              bonus: 12000
            }
          ]
        }
      ]);
    });

    it("Use the $[<identifier>] Operator to Update Elements that Match a Filter Condition", () => {
      input.forEach(o => {
        update(
          o,
          {
            $set: {
              "engineering.$[elemX].salary": 95000,
              "sales.$[elemY].salary": 75000
            }
          },
          [
            { "elemX.name": "Bob", "elemX.salary": 75000 },
            { "elemY.name": "Ed", "elemY.salary": 50000 }
          ]
        );
      });

      expect(
        find(
          input,
          { "engineering.name": "Bob" },
          { engineering: { $elemMatch: { name: "Bob" } }, _id: 0 }
        ).all()
      ).toEqual([
        {
          engineering: [{ name: "Bob", email: "bob@mail.com", salary: 95000 }]
        }
      ]);

      expect(
        find(
          input,
          { "sales.name": "Ed" },
          { sales: { $elemMatch: { name: "Ed" } }, _id: 0 }
        ).all()
      ).toEqual([
        {
          sales: [
            { name: "Ed", email: "ed@mail.com", salary: 99000, bonus: 4000 }
          ]
        }
      ]);
    });
  });
});
