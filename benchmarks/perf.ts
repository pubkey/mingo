/**
 * Performance measurements for mingo query functions.
 *
 *  - Query instantiation (new Query with various selectors)
 *  - Query matching (query.test())
 *  - Query find with cursor (query.find().all())
 *  - Aggregation pipelines ($match, $project, $group, $sort)
 *  - Update operations
 *  - Sort comparator (mingo compare utility)
 *  - Context initialization
 *
 * Run with: npm run perf
 */

/* eslint-disable no-console */

import { performance } from "perf_hooks";

import { Aggregator } from "../src/aggregator";
import { Context } from "../src/core";
import * as accumulatorOperators from "../src/operators/accumulator";
import * as expressionOperators from "../src/operators/expression";
import * as pipelineOperators from "../src/operators/pipeline";
import { $project, $sort } from "../src/operators/pipeline";
import * as projectionOperators from "../src/operators/projection";
import * as queryOperators from "../src/operators/query";
import {
  $and,
  $elemMatch,
  $eq,
  $exists,
  $gt,
  $gte,
  $in,
  $lt,
  $lte,
  $mod,
  $ne,
  $nin,
  $nor,
  $not,
  $or,
  $regex,
  $size,
  $type
} from "../src/operators/query";
import * as windowOperators from "../src/operators/window";
import { Query } from "../src/query";
import type { AnyObject, Options } from "../src/types";
import { update } from "../src/updater";
import { compare } from "../src/util";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function measure(label: string, fn: () => void, iterations = 1): number {
  // warmup
  fn();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const elapsed = performance.now() - start;
  const perOp = elapsed / iterations;
  console.log(
    `  ${label}: ${elapsed.toFixed(2)}ms total (${iterations} iterations, ${perOp.toFixed(4)}ms/op)`
  );
  return elapsed;
}

function generateDocuments(count: number): AnyObject[] {
  const docs: AnyObject[] = [];
  for (let i = 0; i < count; i++) {
    docs.push({
      _id: `doc-${i}`,
      name: `User ${i}`,
      age: 18 + (i % 60),
      score: Math.random() * 100,
      active: i % 3 !== 0,
      tags: [`tag${i % 5}`, `tag${(i + 1) % 5}`],
      nested: {
        city: `City ${i % 20}`,
        zip: 10000 + (i % 900)
      },
      items: Array.from({ length: 3 }, (_, j) => ({
        id: j,
        value: i * 10 + j
      })),
      createdAt: new Date(2020, 0, 1 + (i % 365)).toISOString()
    });
  }
  return docs;
}

// ─── Full context (all operators) ─────────────────────────────────────────────

const FULL_CONTEXT = Context.init({
  accumulator: accumulatorOperators,
  expression: expressionOperators,
  pipeline: pipelineOperators,
  projection: projectionOperators,
  query: queryOperators,
  window: windowOperators
});

const FULL_OPTS: Partial<Options> = {
  idKey: "_id",
  processingMode: 0, // CLONE_OFF
  context: FULL_CONTEXT
};

// ─── Minimal context (subset of operators) ────────────────────────────────────

const RXDB_CONTEXT = Context.init({
  pipeline: { $sort, $project },
  query: {
    $elemMatch,
    $eq,
    $nor,
    $exists,
    $regex,
    $and,
    $gt,
    $gte,
    $in,
    $lt,
    $lte,
    $ne,
    $nin,
    $mod,
    $not,
    $or,
    $size,
    $type
  }
});

const RXDB_OPTS: Partial<Options> = {
  idKey: "_id",
  processingMode: 0,
  context: RXDB_CONTEXT
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const SMALL_DOCS = generateDocuments(1_000);
const MEDIUM_DOCS = generateDocuments(10_000);
const LARGE_DOCS = generateDocuments(100_000);

// ─── Benchmark sections ───────────────────────────────────────────────────────

function benchContextInit() {
  console.log("\n=== Context Initialization ===");

  measure(
    "Full context init (all operators)",
    () => {
      Context.init({
        accumulator: accumulatorOperators,
        expression: expressionOperators,
        pipeline: pipelineOperators,
        projection: projectionOperators,
        query: queryOperators,
        window: windowOperators
      });
    },
    1_000
  );

  measure(
    "RxDB context init (subset of operators)",
    () => {
      Context.init({
        pipeline: { $sort, $project },
        query: {
          $elemMatch,
          $eq,
          $nor,
          $exists,
          $regex,
          $and,
          $gt,
          $gte,
          $in,
          $lt,
          $lte,
          $ne,
          $nin,
          $mod,
          $not,
          $or,
          $size,
          $type
        }
      });
    },
    1_000
  );
}

function benchQueryInstantiation() {
  console.log("\n=== Query Instantiation ===");

  measure(
    "Simple equality query",
    () => {
      new Query({ name: "User 1" }, FULL_OPTS);
    },
    10_000
  );

  measure(
    "Comparison operators ($gt, $lt)",
    () => {
      new Query({ age: { $gt: 25, $lt: 50 } }, FULL_OPTS);
    },
    10_000
  );

  measure(
    "Complex query ($and, $or, nested)",
    () => {
      new Query(
        {
          $and: [
            { active: true },
            { $or: [{ age: { $gte: 30 } }, { score: { $gt: 80 } }] },
            { "nested.city": { $in: ["City 1", "City 2", "City 3"] } }
          ]
        },
        FULL_OPTS
      );
    },
    10_000
  );

  measure(
    "RxDB-style query instantiation ($eq, $gt, $in)",
    () => {
      new Query(
        {
          $and: [
            { active: { $eq: true } },
            { age: { $gte: 18, $lte: 65 } },
            { tags: { $in: ["tag1", "tag2"] } }
          ]
        },
        RXDB_OPTS
      );
    },
    10_000
  );

  measure(
    "Query with $regex",
    () => {
      new Query({ name: { $regex: /^User 1/ } }, RXDB_OPTS);
    },
    10_000
  );

  measure(
    "Query with $elemMatch",
    () => {
      new Query(
        {
          items: { $elemMatch: { value: { $gt: 50 } } }
        },
        RXDB_OPTS
      );
    },
    10_000
  );

  measure(
    "Query with $exists, $type, $mod",
    () => {
      new Query(
        {
          age: { $exists: true, $type: "number", $mod: [10, 0] }
        },
        RXDB_OPTS
      );
    },
    10_000
  );

  measure(
    "Query with $not and $nin",
    () => {
      new Query(
        {
          $and: [
            { active: { $not: { $eq: false } } },
            { age: { $nin: [20, 30, 40] } }
          ]
        },
        RXDB_OPTS
      );
    },
    10_000
  );

  measure(
    "Query with $nor",
    () => {
      new Query(
        {
          $nor: [{ age: { $lt: 18 } }, { active: { $eq: false } }]
        },
        RXDB_OPTS
      );
    },
    10_000
  );

  measure(
    "Query with $size",
    () => {
      new Query({ tags: { $size: 2 } }, RXDB_OPTS);
    },
    10_000
  );
}

function benchQueryMatching() {
  console.log("\n=== Query Matching (query.test()) ===");

  const simpleQuery = new Query({ active: true }, FULL_OPTS);
  const comparisonQuery = new Query({ age: { $gt: 25, $lt: 50 } }, FULL_OPTS);
  const complexQuery = new Query(
    {
      $and: [
        { active: true },
        { $or: [{ age: { $gte: 30 } }, { score: { $gt: 80 } }] },
        { "nested.city": { $in: ["City 1", "City 2", "City 3"] } }
      ]
    },
    FULL_OPTS
  );
  const regexQuery = new Query({ name: { $regex: /^User 1/ } }, RXDB_OPTS);
  const elemMatchQuery = new Query(
    { items: { $elemMatch: { value: { $gt: 50 } } } },
    RXDB_OPTS
  );

  const rxdbQuery = new Query(
    {
      $and: [
        { active: { $eq: true } },
        { age: { $gte: 18, $lte: 65 } },
        { tags: { $in: ["tag1", "tag2"] } }
      ]
    },
    RXDB_OPTS
  );

  const doc = SMALL_DOCS[500];

  measure(
    "Simple equality match (single doc)",
    () => {
      simpleQuery.test(doc);
    },
    100_000
  );

  measure(
    "Comparison match (single doc)",
    () => {
      comparisonQuery.test(doc);
    },
    100_000
  );

  measure(
    "Complex $and/$or match (single doc)",
    () => {
      complexQuery.test(doc);
    },
    100_000
  );

  measure(
    "$regex match (single doc)",
    () => {
      regexQuery.test(doc);
    },
    100_000
  );

  measure(
    "$elemMatch (single doc)",
    () => {
      elemMatchQuery.test(doc);
    },
    100_000
  );

  measure(
    "RxDB-style match (single doc)",
    () => {
      rxdbQuery.test(doc);
    },
    100_000
  );

  // Bulk matching
  measure(
    "Simple match over 1K docs",
    () => {
      for (const d of SMALL_DOCS) simpleQuery.test(d);
    },
    100
  );

  measure(
    "Comparison match over 10K docs",
    () => {
      for (const d of MEDIUM_DOCS) comparisonQuery.test(d);
    },
    10
  );

  measure(
    "Complex match over 10K docs",
    () => {
      for (const d of MEDIUM_DOCS) complexQuery.test(d);
    },
    10
  );

  measure(
    "RxDB-style match over 10K docs",
    () => {
      for (const d of MEDIUM_DOCS) rxdbQuery.test(d);
    },
    10
  );

  measure(
    "Simple match over 100K docs",
    () => {
      for (const d of LARGE_DOCS) simpleQuery.test(d);
    },
    3
  );
}

function benchQueryFind() {
  console.log("\n=== Query Find with Cursor ===");

  const query = new Query({ active: true, age: { $gt: 30 } }, FULL_OPTS);
  const rxdbQuery = new Query(
    {
      $and: [{ active: { $eq: true } }, { age: { $gte: 30 } }]
    },
    RXDB_OPTS
  );

  measure(
    "find().all() over 1K docs",
    () => {
      query.find(SMALL_DOCS).all();
    },
    100
  );

  measure(
    "find().all() over 10K docs",
    () => {
      query.find(MEDIUM_DOCS).all();
    },
    10
  );

  measure(
    "find().all() over 100K docs",
    () => {
      query.find(LARGE_DOCS).all();
    },
    3
  );

  measure(
    "find() with projection over 10K docs",
    () => {
      query.find<AnyObject>(MEDIUM_DOCS, { name: 1, age: 1 }).all();
    },
    10
  );

  measure(
    "find().sort().limit() over 10K docs",
    () => {
      query.find(MEDIUM_DOCS).sort({ age: 1 }).limit(100).all();
    },
    10
  );

  measure(
    "find().skip().limit() over 10K docs",
    () => {
      query.find(MEDIUM_DOCS).skip(100).limit(50).all();
    },
    10
  );

  measure(
    "RxDB-style find().all() over 10K docs",
    () => {
      rxdbQuery.find(MEDIUM_DOCS).all();
    },
    10
  );
}

function benchAggregation() {
  console.log("\n=== Aggregation Pipeline ===");

  measure(
    "$match pipeline over 10K docs",
    () => {
      new Aggregator([{ $match: { active: true } }], FULL_OPTS).run(
        MEDIUM_DOCS
      );
    },
    10
  );

  measure(
    "$match + $project over 10K docs",
    () => {
      new Aggregator(
        [
          { $match: { active: true } },
          { $project: { name: 1, age: 1, score: 1 } }
        ],
        FULL_OPTS
      ).run(MEDIUM_DOCS);
    },
    10
  );

  measure(
    "$match + $group over 10K docs",
    () => {
      new Aggregator(
        [
          { $match: { active: true } },
          {
            $group: {
              _id: "$nested.city",
              avgAge: { $avg: "$age" },
              maxScore: { $max: "$score" },
              count: { $sum: 1 }
            }
          }
        ],
        FULL_OPTS
      ).run(MEDIUM_DOCS);
    },
    10
  );

  measure(
    "$match + $sort over 10K docs",
    () => {
      new Aggregator(
        [{ $match: { active: true } }, { $sort: { age: -1, score: 1 } }],
        FULL_OPTS
      ).run(MEDIUM_DOCS);
    },
    10
  );

  measure(
    "$match + $project + $group + $sort over 10K docs",
    () => {
      new Aggregator(
        [
          { $match: { active: true, age: { $gte: 25 } } },
          { $project: { city: "$nested.city", age: 1, score: 1 } },
          {
            $group: {
              _id: "$city",
              avgAge: { $avg: "$age" },
              totalScore: { $sum: "$score" },
              count: { $sum: 1 }
            }
          },
          { $sort: { totalScore: -1 } }
        ],
        FULL_OPTS
      ).run(MEDIUM_DOCS);
    },
    10
  );

  measure(
    "$match + $group over 100K docs",
    () => {
      new Aggregator(
        [
          { $match: { active: true } },
          {
            $group: {
              _id: "$nested.city",
              count: { $sum: 1 },
              avgScore: { $avg: "$score" }
            }
          }
        ],
        FULL_OPTS
      ).run(LARGE_DOCS);
    },
    3
  );

  measure(
    "$sort only over 10K docs",
    () => {
      new Aggregator([{ $sort: { score: -1, name: 1 } }], FULL_OPTS).run(
        MEDIUM_DOCS
      );
    },
    10
  );

  measure(
    "$project only over 10K docs",
    () => {
      new Aggregator(
        [{ $project: { name: 1, age: 1, "nested.city": 1 } }],
        FULL_OPTS
      ).run(MEDIUM_DOCS);
    },
    10
  );
}

function benchUpdate() {
  console.log("\n=== Update Operations ===");

  measure(
    "$set on single doc",
    () => {
      const doc = { _id: "1", name: "Alice", age: 30, score: 85 };
      update(doc, { $set: { age: 31, score: 90 } });
    },
    10_000
  );

  measure(
    "$inc on single doc",
    () => {
      const doc = { _id: "1", name: "Alice", age: 30, score: 85 };
      update(doc, { $inc: { age: 1, score: 5 } });
    },
    10_000
  );

  measure(
    "$unset on single doc",
    () => {
      const doc = { _id: "1", name: "Alice", age: 30, score: 85 };
      update(doc, { $unset: { score: "" } });
    },
    10_000
  );

  measure(
    "$push to array on single doc",
    () => {
      const doc = { _id: "1", tags: ["a", "b"] };
      update(doc, { $push: { tags: "c" } });
    },
    10_000
  );

  measure(
    "$addToSet on single doc",
    () => {
      const doc = { _id: "1", tags: ["a", "b"] };
      update(doc, { $addToSet: { tags: "c" } });
    },
    10_000
  );

  measure(
    "$set with nested path",
    () => {
      const doc = { _id: "1", nested: { city: "NYC", zip: 10001 } };
      update(doc, { $set: { "nested.city": "LA" } });
    },
    10_000
  );

  measure(
    "Combined $set + $inc",
    () => {
      const doc = { _id: "1", name: "Alice", age: 30, score: 85 };
      update(doc, { $set: { name: "Bob" }, $inc: { age: 1 } });
    },
    10_000
  );
}

function benchSortComparator() {
  console.log("\n=== Sort Comparator (mingo compare) ===");

  measure(
    "Compare numbers",
    () => {
      for (let i = 0; i < 1000; i++) {
        compare(i, i + 1);
        compare(i + 1, i);
        compare(i, i);
      }
    },
    1_000
  );

  measure(
    "Compare strings",
    () => {
      const strings = SMALL_DOCS.map(d => d.name as string);
      for (let i = 0; i < strings.length - 1; i++) {
        compare(strings[i], strings[i + 1]);
      }
    },
    100
  );

  measure(
    "Compare dates (ISO strings)",
    () => {
      const dates = SMALL_DOCS.map(d => d.createdAt);
      for (let i = 0; i < dates.length - 1; i++) {
        compare(dates[i], dates[i + 1]);
      }
    },
    100
  );

  measure(
    "Compare mixed types",
    () => {
      const values = [1, "a", null, true, [1, 2], { a: 1 }];
      for (let i = 0; i < values.length; i++) {
        for (let j = 0; j < values.length; j++) {
          compare(values[i], values[j]);
        }
      }
    },
    10_000
  );

  measure(
    "Sort 10K docs by score using compare",
    () => {
      const arr = MEDIUM_DOCS.map(d => d.score);
      arr.sort((a, b) => compare(a, b));
    },
    10
  );
}

function benchRxDBPatterns() {
  console.log("\n=== RxDB-Specific Patterns ===");

  // Create query and test many documents (query matcher)
  measure(
    "RxDB getQueryMatcher pattern (create + test 10K docs)",
    () => {
      const q = new Query(
        {
          $and: [{ active: { $eq: true } }, { age: { $gte: 18, $lte: 65 } }]
        },
        RXDB_OPTS
      );
      for (const d of MEDIUM_DOCS) q.test(d);
    },
    10
  );

  // Query with $in (batch lookups)
  measure(
    "RxDB $in query (batch ID lookup, 100 IDs) over 10K docs",
    () => {
      const ids = Array.from({ length: 100 }, (_, i) => `doc-${i * 100}`);
      const q = new Query({ _id: { $in: ids } }, RXDB_OPTS);
      for (const d of MEDIUM_DOCS) q.test(d);
    },
    10
  );

  // $regex for text search
  measure(
    "RxDB $regex query over 10K docs",
    () => {
      const q = new Query({ name: { $regex: /^User [12]/ } }, RXDB_OPTS);
      for (const d of MEDIUM_DOCS) q.test(d);
    },
    10
  );

  // Nested field queries
  measure(
    "RxDB nested field query over 10K docs",
    () => {
      const q = new Query(
        { "nested.city": { $in: ["City 1", "City 5", "City 10"] } },
        RXDB_OPTS
      );
      for (const d of MEDIUM_DOCS) q.test(d);
    },
    10
  );

  // $or with multiple conditions
  measure(
    "RxDB $or query over 10K docs",
    () => {
      const q = new Query(
        {
          $or: [
            { age: { $lt: 20 } },
            { age: { $gt: 60 } },
            { score: { $gte: 95 } }
          ]
        },
        RXDB_OPTS
      );
      for (const d of MEDIUM_DOCS) q.test(d);
    },
    10
  );

  // $elemMatch
  measure(
    "RxDB $elemMatch query over 10K docs",
    () => {
      const q = new Query(
        { items: { $elemMatch: { value: { $gt: 500 } } } },
        RXDB_OPTS
      );
      for (const d of MEDIUM_DOCS) q.test(d);
    },
    10
  );

  // Many sequential query instantiations
  measure(
    "Sequential query instantiation (1K different queries)",
    () => {
      for (let i = 0; i < 1_000; i++) {
        new Query({ age: { $gt: i % 60 } }, RXDB_OPTS);
      }
    },
    10
  );

  // $exists check
  measure(
    "RxDB $exists query over 10K docs",
    () => {
      const q = new Query(
        { score: { $exists: true }, "nested.city": { $exists: true } },
        RXDB_OPTS
      );
      for (const d of MEDIUM_DOCS) q.test(d);
    },
    10
  );

  // Query reuse (create once, test many)
  const reusableQuery = new Query(
    {
      $and: [
        { active: { $eq: true } },
        { age: { $gte: 25, $lte: 55 } },
        { tags: { $in: ["tag1", "tag3"] } },
        { "nested.zip": { $gt: 10100 } }
      ]
    },
    RXDB_OPTS
  );

  measure(
    "RxDB reuse query.test() over 100K docs",
    () => {
      for (const d of LARGE_DOCS) reusableQuery.test(d);
    },
    3
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║           mingo Performance Measurements                ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(
    `Documents: ${SMALL_DOCS.length} (small), ${MEDIUM_DOCS.length} (medium), ${LARGE_DOCS.length} (large)`
  );

  benchContextInit();
  benchQueryInstantiation();
  benchQueryMatching();
  benchQueryFind();
  benchAggregation();
  benchUpdate();
  benchSortComparator();
  benchRxDBPatterns();

  console.log("\n✅ All performance measurements complete.");
}

main();
