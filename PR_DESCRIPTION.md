# Performance optimizations & native ES2025 Set methods

Hot-path optimizations and a benchmark suite for mingo, with 3–20× speedups on common query patterns. All 1,859 tests pass.

## Performance tests

Added `benchmarks/perf.ts` (`npm run perf`) covering query instantiation, matching, cursors, aggregation, updates, and sort across 1K–100K document sets. A vitest guard (`test/perf.test.ts`) prevents regressions.

## Benchmark results (upstream → this fork)

| Benchmark | Upstream | This fork |
|---|---|---|
| Simple equality query (10K iter) | 643 ms | **31 ms** (~20×) |
| `$elemMatch` match (100K iter) | 450 ms | **38 ms** (~12×) |
| `find().all()` 100K docs | 421 ms | **154 ms** (~3×) |
| `$match` pipeline 10K docs | 81 ms | **18 ms** (~4.5×) |
| `query.test()` reuse 100K docs | 944 ms | **197 ms** (~5×) |

## Key optimizations

- **`resolve()` fast paths** — 1- and 2-segment short circuits, pre-split `pathArray`
- **`$elemMatch` rewrite** — compiles inner `Query` once at build time instead of per document
- **`$in`/`$nin` Set fast path** — O(1) `Set.has()` for primitive arrays
- **`mingoCmp` number/string fast paths** — skips `typeOf` for the most common types
- **`Context.from()` single-context fast path** — avoids allocation when only one context
- **`isObject` inline / `isEqual` for-loops / pre-split paths** — reduces overhead on hot paths
- **Native ES2025 Set methods** — `Set.intersection()`, `Set.difference()`, `Set.isSubsetOf()` for set operators on primitive arrays (with `HashMap` fallback for objects)

## ES2025 Set methods & Node.js compatibility

`$setDifference`, `$setIsSubset`, `$setEquals`, and `intersection()` now use native `Set` methods as a fast path for primitive arrays. These methods require **Node.js ≥ 22** (Chrome 122+, Firefox 127+, Safari 17+).

The upstream CI tested on Node 18/20 which do **not** support these methods. Two options:

- **Option A — Polyfills**: Add `core-js` or `set-methods-polyfill` to keep backward compat (adds a dependency).
- **Option B — Major bump** (recommended): Release as **v8.0.0** with `engines.node >=22`. Node 18 is EOL, Node 20 EOL April 2026.
