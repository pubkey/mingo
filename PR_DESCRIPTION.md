# Performance optimizations & native ES2025 Set methods

## Summary

This fork adds comprehensive performance benchmarks and significant hot-path optimizations to mingo. Set operations now leverage native ES2025 `Set` methods (`intersection`, `difference`, `isSubsetOf`) for primitive arrays, delivering order-of-magnitude speedups on the most common query patterns. These changes retain ~95% of an earlier, more aggressive optimization pass while preserving code readability.

All 1,859 existing tests pass.

---

## Performance tests

A standalone benchmark suite (`benchmarks/perf.ts`, run via `npm run perf`) was added covering every layer of the library:

| Category | What is measured |
|---|---|
| **Context initialization** | Full operator set vs. minimal subset (e.g. only the 18 query + 2 pipeline operators used by RxDB) |
| **Query instantiation** | 10 operator patterns (`$eq`, `$gt/$lt`, `$and/$or`, `$regex`, `$elemMatch`, `$exists/$type/$mod`, `$not/$nin`, `$nor`, `$size`) at 10 K iterations each |
| **Query matching** | `query.test()` on a single document (100 K iterations) and in bulk over 1 K / 10 K / 100 K documents |
| **Cursor operations** | `find().all()`, projection, `sort().limit()`, `skip().limit()` over 1 K–100 K documents |
| **Aggregation pipelines** | `$match`, `$project`, `$group`, `$sort` individually and combined, up to 100 K documents |
| **Update operations** | `$set`, `$inc`, `$unset`, `$push`, `$addToSet`, nested paths, combined operators |
| **Sort comparator** | `compare()` utility for numbers, strings, dates, and mixed types |
| **Realistic patterns** | Query-matcher create-then-test cycle, `$in` batch ID lookup, `$regex` text search, nested-field queries, query reuse over 100 K documents |

An integration-level vitest performance test (`test/perf.test.ts`) guards against regressions with thresholds (aggregation < 30 s, sorting < 500 ms on 100 K / 10 K documents).

---

## Performance improvements

### Benchmark results (upstream → this fork)

| Benchmark | Upstream `kofrasa/mingo` | This fork |
|---|---|---|
| Simple equality query (10 K iter) | 643 ms | **31 ms** (~20× faster) |
| `$elemMatch` match (100 K iter) | 450 ms | **38 ms** (~12× faster) |
| `find().all()` 100 K docs | 421 ms | **154 ms** (~3× faster) |
| `$match` pipeline 10 K docs | 81 ms | **18 ms** (~4.5× faster) |
| `query.test()` reuse 100 K docs | 944 ms | **197 ms** (~5× faster) |

### Optimizations retained

| Optimization | Description |
|---|---|
| **`isObject` inline** | Bypasses `typeOf` overhead on the hottest path by checking `typeof v`, `constructor`, and known non-object types directly. |
| **`resolve()` fast paths** | 1-segment and 2-segment short circuits avoid the general recursive resolver for the most common dot-notation selectors (e.g. `"age"`, `"address.city"`). Pre-split `pathArray` parameter removes redundant `split(".")` calls. |
| **`$elemMatch` rewrite** | Compiles the inner `Query` once at operator build time instead of creating it per document, eliminating the biggest source of allocation churn. |
| **`Context.from()` single-context fast path** | Returns the context directly instead of allocating a new one when only a single context is supplied. |
| **`$in` / `$nin` Set fast path** | Constructs a `Set` from the comparison array for O(1) `has()` lookups when all values are primitives, turning O(n·m) scans into O(n+m). |
| **`mingoCmp` number/string fast paths** | Skips `typeOf` for the two most common comparison types (numbers and strings), which dominate sort and comparison operations. |
| **`isEqual` for-loops** | Replaces `.every()` with indexed for-loops in hot equality checks to avoid closure allocation overhead. |
| **Native ES2025 Set methods** | `Set.intersection()`, `Set.difference()`, `Set.isSubsetOf()` for set operators on primitive arrays (see details below). |
| **`computeExpression` operator-first check** | Checks the first key of an expression object for an operator prefix before iterating all keys. Uses `indexOf` instead of `split` for prefix extraction. |
| **Pre-split paths** | `processQuery`, `$exists`, and `resolve` accept or cache pre-split path arrays to avoid repeated `String.split(".")` calls. |

---

## New ES2025 Set methods & Node.js compatibility

### What changed

Several set operators now use native ES2025 `Set` methods as a fast path when all array elements are primitives (strings, numbers, booleans, `null`, `undefined`). When arrays contain objects or other non-primitive values, the existing `HashMap`-based fallback is used.

| Operator / Utility | Native method used | Location |
|---|---|---|
| `intersection()` utility | `Set.prototype.intersection()` | `src/util/_internal.ts` |
| `unique()` utility | `new Set()` (ES6, no issue) | `src/util/_internal.ts` |
| `$setDifference` | `Set.prototype.difference()` | `src/operators/expression/set/setDifference.ts` |
| `$setIsSubset` | `Set.prototype.isSubsetOf()` | `src/operators/expression/set/setIsSubset.ts` |
| `$setEquals` | `Set.prototype.isSubsetOf()` | `src/operators/expression/set/setEquals.ts` |
| `$setIntersection` | via `intersection()` → `Set.prototype.intersection()` | `src/operators/expression/set/setIntersection.ts` |
| `$in` / `$nin` predicate | `new Set()` + `Set.prototype.has()` (ES6, no issue) | `src/operators/_predicates.ts` |

A type-declaration file (`src/set-methods.d.ts`) was added so that consumers of the library do not need to add `"esnext.collection"` to their own `tsconfig.json` `lib` array.

### Compatibility impact

`Set.prototype.intersection()`, `Set.prototype.difference()`, and `Set.prototype.isSubsetOf()` are part of the [TC39 Set methods proposal](https://github.com/tc39/proposal-set-methods) (stage 4, shipping in ES2025). Runtime support:

| Runtime | Minimum version |
|---|---|
| Node.js | **22.0+** |
| Chrome | 122+ |
| Firefox | 127+ |
| Safari | 17+ |
| Deno | 1.42+ |
| Bun | 1.1.12+ |

The upstream `kofrasa/mingo` CI tested on Node.js **18.x** and **20.x**. Those versions do **not** ship native Set methods, so this change is a **breaking** runtime requirement.

### Proposed path forward

There are two options to reconcile this:

#### Option A — Add polyfills (non-breaking)

Add a runtime polyfill (e.g. [`core-js`](https://github.com/nicolo-ribaudo/core-js-compat) or the small [`set-methods-polyfill`](https://www.npmjs.com/package/set-methods-polyfill)) and keep the current semver range. This keeps backward compatibility with Node.js 18/20 but adds a dependency and a small startup cost.

#### Option B — Major version bump (recommended)

Release as **mingo v8.0.0** with `"engines": { "node": ">=22" }` in `package.json`. Node.js 18 reached end-of-life in April 2025 and Node.js 20 reaches EOL in April 2026. A major bump clearly communicates the new requirement and avoids shipping polyfill code that modern runtimes do not need.

---

## CI changes

The GitHub Actions workflow (`build.yml`) was updated to test on **Node.js 22.x only** (previously 18.x and 20.x) to match the native Set method requirement.
