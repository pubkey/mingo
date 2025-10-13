import { update } from "../src";
import { find } from "./support";

describe("update", () => {
  // const obj = {};
  // beforeEach(() => {
  //   Object.assign(obj, { name: "John", age: 30 });
  // });

  // it("should contain single operator in expression", () => {
  //   const expr = { $set: { name: "Fred" } };
  //   expr["$inc"] = { age: 2 };
  //   expect(() => update(obj, expr)).toThrow(/must contain only one operator/);
  // });

  // it("should contain valid operator in expression", () => {
  //   const expr = { $set: { name: "Fred" } };
  //   expr["$cos"] = { age: 2 };
  //   delete expr["$set" as string];
  //   expect(() => update(obj, expr)).toThrow(
  //     /operator '\$cos' is not supported/
  //   );
  // });

  // it("should check condition before update", () => {
  //   expect(
  //     update(obj, { $set: { name: "Fred" } }, [], { age: { $lt: 10 } })
  //   ).toEqual([]);
  //   expect(obj).toEqual({ name: "John", age: 30 });
  // });

  // it("should apply update on valid condition expression", () => {
  //   expect(
  //     update(obj, { $set: { name: "Fred" } }, [], { age: { $gt: 10 } })
  //   ).toEqual(["name"]);
  //   expect(obj).toEqual({ name: "Fred", age: 30 });
  // });

  // it("should not apply update on invalid condition expression", () => {
  //   expect(obj).toEqual({ name: "John", age: 30 });
  //   expect(update(obj, { $set: { name: "Fred" } }, [], { age: 10 })).toEqual(
  //     []
  //   );
  //   expect(obj).toEqual({ name: "John", age: 30 });
  // });

  // it("should apply update on valid condition query", () => {
  //   expect(
  //     update(obj, { $set: { name: "Fred" } }, [], { age: { $gt: 10 } })
  //   ).toEqual(["name"]);
  //   expect(obj).toEqual({ name: "Fred", age: 30 });
  // });

  // it.each([{ a: 1 }, [{ a: 1 }], new Date("2022-02-01")])(
  //   "should apply clone mode: %p",
  //   val => {
  //     const a = clone("deep", val);
  //     const b = clone("copy", val);
  //     const c = clone("none", val);

  //     expect(val).toEqual(a);
  //     expect(val).toEqual(b);
  //     expect(val).toEqual(c);

  //     expect(val).not.toBe(a);
  //     expect(val).not.toBe(b);
  //     expect(val).toBe(c);

  //     if (isArray(val)) {
  //       expect(val[0]).not.toBe((a as unknown[])[0]);
  //       expect(val[0]).toBe((b as unknown[])[0]);
  //       expect(val[0]).toBe((c as unknown[])[0]);
  //     }
  //   }
  // );

  // describe("Positional Operators", () => {
  //   it("Update Values in an Array", () => {
  //     const input = [
  //       { _id: 1, grades: [85, 80, 80] },
  //       { _id: 2, grades: [88, 90, 92] },
  //       { _id: 3, grades: [85, 100, 90] }
  //     ];
  //     const result = [
  //       { _id: 1, grades: [85, 82, 80] },
  //       { _id: 2, grades: [88, 90, 92] },
  //       { _id: 3, grades: [85, 100, 90] }
  //     ];

  //     input.forEach(o =>
  //       update(o, { $set: { "grades.$": 82 } }, [], { _id: 1, grades: 80 })
  //     );

  //     expect(input).toEqual(result);
  //   });

  //   it("Update Documents in an Array", () => {
  //     const input = {
  //       _id: 4,
  //       grades: [
  //         { grade: 80, mean: 75, std: 8 },
  //         { grade: 85, mean: 90, std: 5 },
  //         { grade: 85, mean: 85, std: 8 }
  //       ]
  //     };

  //     update(input, { $set: { "grades.$.std": 6 } }, [], {
  //       _id: 4,
  //       "grades.grade": 85
  //     });

  //     expect(input).toEqual({
  //       _id: 4,
  //       grades: [
  //         { grade: 80, mean: 75, std: 8 },
  //         { grade: 85, mean: 90, std: 6 },
  //         { grade: 85, mean: 85, std: 8 }
  //       ]
  //     });
  //   });

  //   it("Update Embedded Documents Using Multiple Field Matches", () => {
  //     const input = {
  //       _id: 5,
  //       grades: [
  //         { grade: 80, mean: 75, std: 8 },
  //         { grade: 85, mean: 90, std: 5 },
  //         { grade: 90, mean: 85, std: 3 }
  //       ]
  //     };

  //     update(input, { $set: { "grades.$.std": 6 } }, [], {
  //       _id: 5,
  //       grades: { $elemMatch: { grade: { $lte: 90 }, mean: { $gt: 80 } } }
  //     });

  //     expect(input).toEqual({
  //       _id: 5,
  //       grades: [
  //         { grade: 80, mean: 75, std: 8 },
  //         { grade: 85, mean: 90, std: 6 },
  //         { grade: 90, mean: 85, std: 3 }
  //       ]
  //     });
  //   });

  //   it("Update with Multiple Array Matches", () => {
  //     const input = {
  //       _id: 8,
  //       activity_ids: [1, 2],
  //       grades: [90, 95],
  //       deans_list: [2021, 2020]
  //     };

  //     update(input, { $set: { "deans_list.$": 2022 } }, [], {
  //       activity_ids: 1,
  //       grades: 95,
  //       deans_list: 2021
  //     });

  //     expect(input).toEqual({
  //       _id: 8,
  //       activity_ids: [1, 2],
  //       grades: [90, 95],
  //       deans_list: [2022, 2020]
  //     });
  //   });
  // });

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
