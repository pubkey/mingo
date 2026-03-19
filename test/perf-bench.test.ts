/**
 * Performance benchmarks for mingo query operations.
 *
 * Focuses on operations used by RxDB:
 * - Query instantiation (new Query with various selectors)
 * - Query matching (query.test() on documents)
 * - Query find with cursor operations (sort, skip, limit)
 * - Sort comparator
 * - Various query operators ($eq, $gt, $in, $regex, $elemMatch, etc.)
 * - Aggregation pipeline ($match, $sort, $project)
 * - Update operations
 */
import { performance } from "perf_hooks";
import { describe, expect, it } from "vitest";

import { aggregate, find, Query, update } from "../src";
import { AnyObject } from "../src/types";
import { compare } from "../src/util/_internal";
import { DEFAULT_OPTS } from "./support";

/* eslint-disable no-console */

// ── Helpers ──────────────────────────────────────────────────────────────────

interface BenchResult {
  label: string;
  ops: number;
  totalMs: number;
  opsPerSec: number;
}

function bench(label: string, iterations: number, fn: () => void): BenchResult {
  // warm up
  for (let i = 0; i < Math.min(50, iterations); i++) fn();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const totalMs = performance.now() - start;
  const opsPerSec = Math.round((iterations / totalMs) * 1000);
  console.log(
    `  ${label}: ${totalMs.toFixed(2)}ms for ${iterations} ops (${opsPerSec.toLocaleString()} ops/sec)`
  );
  return { label, ops: iterations, totalMs, opsPerSec };
}

// ── Test data ────────────────────────────────────────────────────────────────

function generateDocuments(count: number): AnyObject[] {
  const docs: AnyObject[] = [];
  const tags = ["alpha", "beta", "gamma", "delta", "epsilon"];
  for (let i = 0; i < count; i++) {
    docs.push({
      _id: `doc-${i}`,
      name: `user-${i}`,
      age: 18 + (i % 60),
      score: Math.round(Math.random() * 1000) / 10,
      active: i % 3 !== 0,
      email: `user${i}@example.com`,
      tags: [tags[i % 5], tags[(i + 1) % 5]],
      nested: {
        level: i % 10,
        value: `nested-${i % 100}`
      },
      items: Array.from({ length: 3 }, (_, j) => ({
        id: j,
        price: (i + j) * 1.5,
        quantity: (i + j) % 20
      })),
      createdAt: new Date(2020, 0, 1 + (i % 365)).toISOString()
    });
  }
  return docs;
}

const SMALL_COLLECTION = generateDocuments(100);
const MEDIUM_COLLECTION = generateDocuments(1_000);
const LARGE_COLLECTION = generateDocuments(10_000);

// ── Tests ────────────────────────────────────────────────────────────────────

describe("perf-bench", { timeout: 60_000 }, () => {
  // ── Query Instantiation ──────────────────────────────────────────────────

  describe("query instantiation", () => {
    it("simple $eq query", () => {
      const result = bench("Query({name: {$eq: ...}})", 5_000, () => {
        new Query({ name: { $eq: "user-50" } }, DEFAULT_OPTS);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("comparison operators query", () => {
      const result = bench(
        "Query({age: {$gt,$lt}, score: {$gte}})",
        5_000,
        () => {
          new Query(
            { age: { $gt: 20, $lt: 50 }, score: { $gte: 50 } },
            DEFAULT_OPTS
          );
        }
      );
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$and/$or compound query", () => {
      const result = bench("Query({$and: [{$or: [...]}]})", 5_000, () => {
        new Query(
          {
            $and: [
              { $or: [{ age: { $gt: 30 } }, { active: true }] },
              { score: { $gte: 50 } },
              { name: { $regex: "^user-1" } }
            ]
          },
          DEFAULT_OPTS
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$in operator query", () => {
      const values = Array.from({ length: 50 }, (_, i) => `user-${i}`);
      const result = bench("Query({name: {$in: [50 items]}})", 5_000, () => {
        new Query({ name: { $in: values } }, DEFAULT_OPTS);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$elemMatch query", () => {
      const result = bench("Query({items: {$elemMatch: ...}})", 5_000, () => {
        new Query(
          {
            items: { $elemMatch: { price: { $gt: 10 }, quantity: { $lt: 5 } } }
          },
          DEFAULT_OPTS
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$regex query", () => {
      const result = bench("Query({email: {$regex: ...}})", 5_000, () => {
        new Query(
          { email: { $regex: "^user[0-9]+@example\\.com$" } },
          DEFAULT_OPTS
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("nested dot-path query", () => {
      const result = bench(
        "Query({'nested.level': {$gte: ...}})",
        5_000,
        () => {
          new Query({ "nested.level": { $gte: 5 } }, DEFAULT_OPTS);
        }
      );
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$exists query", () => {
      const result = bench("Query({name: {$exists: true}})", 5_000, () => {
        new Query({ name: { $exists: true } }, DEFAULT_OPTS);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$type query", () => {
      const result = bench("Query({age: {$type: 'number'}})", 5_000, () => {
        new Query({ age: { $type: "number" } }, DEFAULT_OPTS);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$mod query", () => {
      const result = bench("Query({age: {$mod: [5, 0]}})", 5_000, () => {
        new Query({ age: { $mod: [5, 0] } }, DEFAULT_OPTS);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$size query", () => {
      const result = bench("Query({tags: {$size: 2}})", 5_000, () => {
        new Query({ tags: { $size: 2 } }, DEFAULT_OPTS);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$not query", () => {
      const result = bench("Query({age: {$not: {$lt: 20}}})", 5_000, () => {
        new Query({ age: { $not: { $lt: 20 } } }, DEFAULT_OPTS);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$nor query", () => {
      const result = bench(
        "Query({$nor: [{active: false}, {age: {$lt: 20}}]})",
        5_000,
        () => {
          new Query(
            { $nor: [{ active: false }, { age: { $lt: 20 } }] },
            DEFAULT_OPTS
          );
        }
      );
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("complex RxDB-like query", () => {
      const result = bench("Query(complex RxDB-like selector)", 2_000, () => {
        new Query(
          {
            $and: [
              { active: { $eq: true } },
              {
                $or: [
                  { age: { $gte: 18, $lte: 65 } },
                  { "nested.level": { $gt: 5 } }
                ]
              },
              { name: { $regex: "^user" } },
              { tags: { $in: ["alpha", "beta"] } },
              { score: { $nin: [0, 100] } },
              { email: { $exists: true } },
              { items: { $elemMatch: { price: { $gt: 0 } } } }
            ]
          },
          DEFAULT_OPTS
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });
  });

  // ── Query Matching (query.test) ──────────────────────────────────────────

  describe("query matching (query.test)", () => {
    it("simple equality match on small collection", () => {
      const query = new Query({ name: { $eq: "user-50" } }, DEFAULT_OPTS);
      const result = bench("query.test() simple $eq × 100 docs", 10_000, () => {
        for (const doc of SMALL_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("comparison operators match", () => {
      const query = new Query(
        { age: { $gt: 25, $lt: 50 }, score: { $gte: 30 } },
        DEFAULT_OPTS
      );
      const result = bench("query.test() $gt/$lt/$gte × 1k docs", 2_000, () => {
        for (const doc of MEDIUM_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$in operator match", () => {
      const targets = Array.from({ length: 20 }, (_, i) => `user-${i * 50}`);
      const query = new Query({ name: { $in: targets } }, DEFAULT_OPTS);
      const result = bench("query.test() $in(20) × 1k docs", 2_000, () => {
        for (const doc of MEDIUM_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$regex match", () => {
      const query = new Query(
        { email: { $regex: "^user[0-5]" } },
        DEFAULT_OPTS
      );
      const result = bench("query.test() $regex × 1k docs", 2_000, () => {
        for (const doc of MEDIUM_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$elemMatch on nested arrays", () => {
      const query = new Query(
        {
          items: {
            $elemMatch: { price: { $gt: 50 }, quantity: { $lt: 10 } }
          }
        },
        DEFAULT_OPTS
      );
      const result = bench("query.test() $elemMatch × 1k docs", 500, () => {
        for (const doc of MEDIUM_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$and/$or compound match", () => {
      const query = new Query(
        {
          $and: [
            { $or: [{ age: { $gt: 40 } }, { active: true }] },
            { score: { $gte: 30 } }
          ]
        },
        DEFAULT_OPTS
      );
      const result = bench("query.test() $and/$or × 1k docs", 2_000, () => {
        for (const doc of MEDIUM_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("dot-path nested field match", () => {
      const query = new Query({ "nested.level": { $gte: 5 } }, DEFAULT_OPTS);
      const result = bench("query.test() dot-path × 1k docs", 2_000, () => {
        for (const doc of MEDIUM_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("complex RxDB-like query match on large collection", () => {
      const query = new Query(
        {
          $and: [
            { active: { $eq: true } },
            {
              $or: [
                { age: { $gte: 18, $lte: 65 } },
                { "nested.level": { $gt: 5 } }
              ]
            },
            { name: { $regex: "^user" } },
            { tags: { $in: ["alpha", "beta"] } }
          ]
        },
        DEFAULT_OPTS
      );
      const result = bench("query.test() complex × 10k docs", 200, () => {
        for (const doc of LARGE_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$not operator match", () => {
      const query = new Query({ age: { $not: { $lt: 30 } } }, DEFAULT_OPTS);
      const result = bench("query.test() $not × 1k docs", 2_000, () => {
        for (const doc of MEDIUM_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$nor operator match", () => {
      const query = new Query(
        { $nor: [{ active: false }, { age: { $lt: 20 } }] },
        DEFAULT_OPTS
      );
      const result = bench("query.test() $nor × 1k docs", 2_000, () => {
        for (const doc of MEDIUM_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$exists operator match", () => {
      const query = new Query(
        { name: { $exists: true }, missing: { $exists: false } },
        DEFAULT_OPTS
      );
      const result = bench("query.test() $exists × 1k docs", 2_000, () => {
        for (const doc of MEDIUM_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$type operator match", () => {
      const query = new Query({ age: { $type: "number" } }, DEFAULT_OPTS);
      const result = bench("query.test() $type × 1k docs", 2_000, () => {
        for (const doc of MEDIUM_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$size operator match", () => {
      const query = new Query({ tags: { $size: 2 } }, DEFAULT_OPTS);
      const result = bench("query.test() $size × 1k docs", 2_000, () => {
        for (const doc of MEDIUM_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$mod operator match", () => {
      const query = new Query({ age: { $mod: [10, 0] } }, DEFAULT_OPTS);
      const result = bench("query.test() $mod × 1k docs", 2_000, () => {
        for (const doc of MEDIUM_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$nin operator match", () => {
      const excluded = Array.from({ length: 10 }, (_, i) => `user-${i}`);
      const query = new Query({ name: { $nin: excluded } }, DEFAULT_OPTS);
      const result = bench("query.test() $nin(10) × 1k docs", 2_000, () => {
        for (const doc of MEDIUM_COLLECTION) query.test(doc);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });
  });

  // ── Query Find with Cursor ───────────────────────────────────────────────

  describe("query find with cursor", () => {
    it("find().all() simple query", () => {
      const result = bench("find().all() $gt × 1k docs", 1_000, () => {
        find(MEDIUM_COLLECTION, { age: { $gt: 50 } }, {}, DEFAULT_OPTS).all();
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("find().sort().all()", () => {
      const result = bench("find().sort({age:1}).all() × 1k docs", 500, () => {
        find(MEDIUM_COLLECTION, { active: true }, {}, DEFAULT_OPTS)
          .sort({ age: 1 })
          .all();
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("find().sort().skip().limit().all()", () => {
      const result = bench(
        "find().sort().skip(10).limit(20) × 1k docs",
        1_000,
        () => {
          find(MEDIUM_COLLECTION, { active: true }, {}, DEFAULT_OPTS)
            .sort({ score: -1 })
            .skip(10)
            .limit(20)
            .all();
        }
      );
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("find() with projection", () => {
      const result = bench("find() with projection × 1k docs", 1_000, () => {
        find(
          MEDIUM_COLLECTION,
          { active: true },
          { name: 1, age: 1, score: 1 },
          DEFAULT_OPTS
        ).all();
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("find() large collection with limit", () => {
      const result = bench("find().limit(50) × 10k docs", 1_000, () => {
        find(LARGE_COLLECTION, { age: { $gte: 30 } }, {}, DEFAULT_OPTS)
          .limit(50)
          .all();
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("find() iterate with next()/hasNext()", () => {
      const result = bench("find().next() loop × 1k docs", 500, () => {
        const cursor = find(
          MEDIUM_COLLECTION,
          { active: true },
          {},
          DEFAULT_OPTS
        );
        while (cursor.hasNext()) cursor.next();
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });
  });

  // ── Sort Comparator ──────────────────────────────────────────────────────

  describe("sort comparator (mingo compare)", () => {
    it("number comparison", () => {
      const pairs = MEDIUM_COLLECTION.map((d, i) => [
        d["age"] as number,
        MEDIUM_COLLECTION[(i + 500) % MEDIUM_COLLECTION.length]["age"] as number
      ]);
      const result = bench("compare(num, num) × 1k pairs", 10_000, () => {
        for (const [a, b] of pairs) compare(a, b);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("string comparison", () => {
      const pairs = MEDIUM_COLLECTION.map((d, i) => [
        d["name"] as string,
        MEDIUM_COLLECTION[(i + 500) % MEDIUM_COLLECTION.length][
          "name"
        ] as string
      ]);
      const result = bench("compare(str, str) × 1k pairs", 10_000, () => {
        for (const [a, b] of pairs) compare(a, b);
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("mixed type comparison", () => {
      const values = [42, "hello", true, null, undefined, new Date(), [1, 2]];
      const result = bench("compare(mixed types)", 10_000, () => {
        for (let i = 0; i < values.length; i++) {
          for (let j = i + 1; j < values.length; j++) {
            compare(values[i], values[j]);
          }
        }
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });
  });

  // ── Aggregation Pipeline ─────────────────────────────────────────────────

  describe("aggregation pipeline", () => {
    it("$match stage", () => {
      const result = bench("aggregate([$match]) × 10k docs", 200, () => {
        aggregate(
          LARGE_COLLECTION,
          [{ $match: { active: true, age: { $gte: 30 } } }],
          DEFAULT_OPTS
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$sort stage", () => {
      const result = bench("aggregate([$sort]) × 1k docs", 500, () => {
        aggregate(
          MEDIUM_COLLECTION,
          [{ $sort: { age: 1, score: -1 } }],
          DEFAULT_OPTS
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$project stage", () => {
      const result = bench("aggregate([$project]) × 1k docs", 500, () => {
        aggregate(
          MEDIUM_COLLECTION,
          [{ $project: { name: 1, age: 1, active: 1 } }],
          DEFAULT_OPTS
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$match + $sort + $project pipeline", () => {
      const result = bench(
        "aggregate([$match,$sort,$project]) × 10k docs",
        100,
        () => {
          aggregate(
            LARGE_COLLECTION,
            [
              { $match: { active: true } },
              { $sort: { age: 1 } },
              { $project: { name: 1, age: 1, score: 1 } }
            ],
            DEFAULT_OPTS
          );
        }
      );
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$match + $group pipeline", () => {
      const result = bench("aggregate([$match,$group]) × 10k docs", 100, () => {
        aggregate(
          LARGE_COLLECTION,
          [
            { $match: { active: true } },
            {
              $group: {
                _id: "$age",
                count: { $sum: 1 },
                avgScore: { $avg: "$score" },
                maxScore: { $max: "$score" }
              }
            }
          ],
          DEFAULT_OPTS
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$match + $sort + $skip + $limit pipeline", () => {
      const result = bench(
        "aggregate([$match,$sort,$skip,$limit]) × 10k docs",
        200,
        () => {
          aggregate(
            LARGE_COLLECTION,
            [
              { $match: { active: true } },
              { $sort: { score: -1 } },
              { $skip: 100 },
              { $limit: 50 }
            ],
            DEFAULT_OPTS
          );
        }
      );
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$unwind + $group pipeline", () => {
      const result = bench("aggregate([$unwind,$group]) × 1k docs", 200, () => {
        aggregate(
          MEDIUM_COLLECTION,
          [
            { $unwind: "$tags" },
            {
              $group: {
                _id: "$tags",
                count: { $sum: 1 }
              }
            }
          ],
          DEFAULT_OPTS
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$addFields stage", () => {
      const result = bench("aggregate([$addFields]) × 1k docs", 500, () => {
        aggregate(
          MEDIUM_COLLECTION,
          [
            {
              $addFields: {
                ageGroup: {
                  $cond: {
                    if: { $gte: ["$age", 40] },
                    then: "senior",
                    else: "junior"
                  }
                }
              }
            }
          ],
          DEFAULT_OPTS
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });
  });

  // ── Update Operations ────────────────────────────────────────────────────

  describe("update operations", () => {
    it("$set single field", () => {
      const result = bench("update $set × 5k ops", 5_000, () => {
        const doc = { _id: "1", name: "test", age: 25, score: 50 };
        update(
          doc,
          { $set: { score: 99 } },
          [],
          {},
          { queryOptions: DEFAULT_OPTS }
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$set multiple fields", () => {
      const result = bench("update $set multi × 5k ops", 5_000, () => {
        const doc = {
          _id: "1",
          name: "test",
          age: 25,
          score: 50,
          active: false
        };
        update(
          doc,
          { $set: { score: 99, active: true, name: "updated" } },
          [],
          {},
          { queryOptions: DEFAULT_OPTS }
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$inc operation", () => {
      const result = bench("update $inc × 5k ops", 5_000, () => {
        const doc = { _id: "1", counter: 0, score: 50 };
        update(
          doc,
          { $inc: { counter: 1, score: 10 } },
          [],
          {},
          { queryOptions: DEFAULT_OPTS }
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$unset operation", () => {
      const result = bench("update $unset × 5k ops", 5_000, () => {
        const doc = { _id: "1", name: "test", age: 25, temp: "remove" };
        update(
          doc,
          { $unset: { temp: "" } },
          [],
          {},
          { queryOptions: DEFAULT_OPTS }
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$push to array", () => {
      const result = bench("update $push × 5k ops", 5_000, () => {
        const doc = { _id: "1", items: [1, 2, 3] };
        update(
          doc,
          { $push: { items: 4 } },
          [],
          {},
          { queryOptions: DEFAULT_OPTS }
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("$set nested dot-path", () => {
      const result = bench("update $set nested × 5k ops", 5_000, () => {
        const doc = { _id: "1", nested: { level: 1, value: "old" } };
        update(
          doc,
          { $set: { "nested.value": "new" } },
          [],
          {},
          { queryOptions: DEFAULT_OPTS }
        );
      });
      expect(result.opsPerSec).toBeGreaterThan(0);
    });
  });

  // ── Scaling Tests ────────────────────────────────────────────────────────

  describe("scaling", () => {
    const sizes = [100, 1_000, 10_000];
    const collections: Record<number, ReturnType<typeof generateDocuments>> = {
      100: SMALL_COLLECTION,
      1_000: MEDIUM_COLLECTION,
      10_000: LARGE_COLLECTION
    };

    it("query.test() scaling across collection sizes", () => {
      const query = new Query(
        {
          $and: [
            { active: true },
            { age: { $gte: 25, $lte: 55 } },
            { tags: { $in: ["alpha", "gamma"] } }
          ]
        },
        DEFAULT_OPTS
      );

      const results: BenchResult[] = [];
      for (const size of sizes) {
        const coll = collections[size];
        const iters = Math.max(50, Math.round(5_000 / size));
        results.push(
          bench(`query.test() × ${size} docs`, iters, () => {
            for (const doc of coll) query.test(doc);
          })
        );
      }

      // Verify all benchmarks completed
      expect(results.length).toBe(sizes.length);

      // Log ops/doc to check scaling linearity
      for (const r of results) {
        const docsPerOp = parseInt(
          r.label.match(/(\d[\d_]*) docs/)?.[1]?.replace(/_/g, "") ?? "0"
        );
        const msPerDoc = r.totalMs / (r.ops * docsPerOp);
        console.log(`  ${r.label}: ${(msPerDoc * 1000).toFixed(3)} µs/doc`);
      }
    });

    it("find().all() scaling across collection sizes", () => {
      const results: BenchResult[] = [];
      for (const size of sizes) {
        const coll = collections[size];
        const iters = Math.max(20, Math.round(2_000 / size));
        results.push(
          bench(`find().all() × ${size} docs`, iters, () => {
            find(
              coll,
              { active: true, age: { $gt: 30 } },
              {},
              DEFAULT_OPTS
            ).all();
          })
        );
      }
      expect(results.length).toBe(sizes.length);
    });
  });

  // ── Query Reuse ──────────────────────────────────────────────────────────

  describe("query reuse", () => {
    it("instantiate once, match many times", () => {
      const query = new Query(
        {
          $and: [
            { active: true },
            { age: { $gte: 20, $lte: 60 } },
            { name: { $regex: "^user" } }
          ]
        },
        DEFAULT_OPTS
      );

      const result = bench(
        "reuse query.test() × 10k docs × 50 runs",
        50,
        () => {
          for (const doc of LARGE_COLLECTION) query.test(doc);
        }
      );
      expect(result.opsPerSec).toBeGreaterThan(0);
    });

    it("instantiate fresh each time vs reuse", () => {
      const selector = {
        active: true,
        age: { $gte: 20 },
        tags: { $in: ["alpha", "beta"] }
      };

      const freshResult = bench("fresh Query + test × 1k docs", 1_000, () => {
        const q = new Query(selector, DEFAULT_OPTS);
        for (const doc of MEDIUM_COLLECTION) q.test(doc);
      });

      const reusedQuery = new Query(selector, DEFAULT_OPTS);
      const reuseResult = bench("reused Query.test × 1k docs", 1_000, () => {
        for (const doc of MEDIUM_COLLECTION) reusedQuery.test(doc);
      });

      console.log(
        `  Instantiation overhead: ${((freshResult.totalMs - reuseResult.totalMs) / freshResult.ops).toFixed(4)}ms per query`
      );
      expect(freshResult.opsPerSec).toBeGreaterThan(0);
      expect(reuseResult.opsPerSec).toBeGreaterThan(0);
    });
  });
});

/* eslint-enable no-console */
