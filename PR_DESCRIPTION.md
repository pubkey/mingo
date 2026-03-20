# Performance optimizations & native ES2025 Set methods

Hot-path optimizations with 3–20× speedups on common query patterns. All 1,859 tests pass.

## Before / after benchmark comparison

Run with `npm run perf` on Node v24.14. Upstream = `kofrasa/mingo` at `dd8db0f0`, Fork = this repo at HEAD.

### Query instantiation (10K iterations)

| Benchmark | Upstream | Fork | Speedup |
|---|---|---|---|
| Simple equality query | 661 ms | **35 ms** | ~19× |
| Comparison operators (`$gt`, `$lt`) | 654 ms | **44 ms** | ~15× |
| Complex query (`$and`/`$or`/nested) | 756 ms | **148 ms** | ~5× |
| Minimal-context (`$eq`, `$gt`, `$in`) | 112 ms | **87 ms** | ~1.3× |
| `$regex` | 45 ms | **28 ms** | ~1.6× |
| `$elemMatch` | 44 ms | **55 ms** | 0.8× |
| `$exists`, `$type`, `$mod` | 47 ms | **31 ms** | ~1.5× |
| `$not` and `$nin` | 109 ms | **80 ms** | ~1.4× |
| `$nor` | 83 ms | **61 ms** | ~1.4× |
| `$size` | 33 ms | **17 ms** | ~1.9× |

### Query matching — single doc (100K iterations)

| Benchmark | Upstream | Fork | Speedup |
|---|---|---|---|
| Simple equality match | 84 ms | **13 ms** | ~6.5× |
| Comparison match | 209 ms | **49 ms** | ~4.3× |
| Complex `$and`/`$or` match | 442 ms | **78 ms** | ~5.7× |
| `$regex` match | 241 ms | **151 ms** | ~1.6× |
| `$elemMatch` match | 460 ms | **41 ms** | ~11× |
| Minimal-context match | 539 ms | **89 ms** | ~6× |

### Query matching — bulk

| Benchmark | Upstream | Fork | Speedup |
|---|---|---|---|
| Simple match over 1K docs (×100) | 87 ms | **15 ms** | ~5.8× |
| Comparison match over 10K docs (×10) | 186 ms | **40 ms** | ~4.7× |
| Complex match over 10K docs (×10) | 310 ms | **57 ms** | ~5.4× |
| Minimal-context match over 10K docs (×10) | 355 ms | **67 ms** | ~5.3× |
| Simple match over 100K docs (×3) | 253 ms | **41 ms** | ~6.2× |

### Cursor operations

| Benchmark | Upstream | Fork | Speedup |
|---|---|---|---|
| `find().all()` 1K docs (×100) | 168 ms | **37 ms** | ~4.5× |
| `find().all()` 10K docs (×10) | 162 ms | **32 ms** | ~5× |
| `find().all()` 100K docs (×3) | 489 ms | **96 ms** | ~5.1× |
| `find()` + projection 10K docs (×10) | 278 ms | **108 ms** | ~2.6× |
| `find().sort().limit()` 10K docs (×10) | 216 ms | **50 ms** | ~4.3× |
| `find().skip().limit()` 10K docs (×10) | 158 ms | **30 ms** | ~5.3× |
| Minimal-context `find().all()` 10K docs (×10) | 166 ms | **39 ms** | ~4.3× |

### Aggregation pipelines

| Benchmark | Upstream | Fork | Speedup |
|---|---|---|---|
| `$match` 10K docs (×10) | 93 ms | **18 ms** | ~5.2× |
| `$match` + `$project` 10K docs (×10) | 263 ms | **132 ms** | ~2× |
| `$match` + `$group` 10K docs (×10) | 375 ms | **154 ms** | ~2.4× |
| `$match` + `$sort` 10K docs (×10) | 233 ms | **73 ms** | ~3.2× |
| `$match`+`$project`+`$group`+`$sort` 10K (×10) | 642 ms | **290 ms** | ~2.2× |
| `$match` + `$group` 100K docs (×3) | 849 ms | **338 ms** | ~2.5× |
| `$sort` only 10K docs (×10) | 295 ms | **96 ms** | ~3.1× |
| `$project` only 10K docs (×10) | 306 ms | **212 ms** | ~1.4× |

### Update operations (10K iterations)

| Benchmark | Upstream | Fork | Speedup |
|---|---|---|---|
| `$set` | 303 ms | **193 ms** | ~1.6× |
| `$inc` | 270 ms | **177 ms** | ~1.5× |
| `$unset` | 255 ms | **152 ms** | ~1.7× |
| `$push` | 235 ms | **146 ms** | ~1.6× |
| `$addToSet` | 242 ms | **146 ms** | ~1.7× |
| `$set` nested path | 237 ms | **139 ms** | ~1.7× |
| Combined `$set` + `$inc` | 248 ms | **155 ms** | ~1.6× |

### Realistic patterns

| Benchmark | Upstream | Fork | Speedup |
|---|---|---|---|
| Query matcher (create + test 10K docs, ×10) | 223 ms | **47 ms** | ~4.7× |
| `$in` batch ID lookup 10K docs (×10) | 628 ms | **368 ms** | ~1.7× |
| `$regex` query 10K docs (×10) | 221 ms | **132 ms** | ~1.7× |
| Nested field query 10K docs (×10) | 249 ms | **30 ms** | ~8.3× |
| `$or` query 10K docs (×10) | 277 ms | **65 ms** | ~4.3× |
| `$elemMatch` query 10K docs (×10) | 458 ms | **42 ms** | ~10.9× |
| Sequential instantiation (1K queries, ×10) | 33 ms | **25 ms** | ~1.3× |
| `$exists` query 10K docs (×10) | 229 ms | **43 ms** | ~5.3× |
| Reuse `query.test()` 100K docs (×3) | 1037 ms | **195 ms** | ~5.3× |

## Key optimizations

- **`resolve()` fast paths** — 1- and 2-segment short circuits, pre-split `pathArray`
- **`$elemMatch` rewrite** — compiles inner `Query` once at build time instead of per document
- **`$in`/`$nin` Set fast path** — O(1) `Set.has()` for primitive arrays
- **`mingoCmp` number/string fast paths** — skips `typeOf` for the most common types
- **`Context.from()` single-context fast path** — avoids allocation when only one context
- **`isObject` inline / `isEqual` for-loops / pre-split paths** — reduces overhead on hot paths
- **Native ES2025 Set methods** — `Set.intersection()`, `Set.difference()`, `Set.isSubsetOf()` for set operators on primitive arrays (with `HashMap` fallback for objects)

## ES2025 Set methods & Node.js compatibility

Native `Set` methods used as fast paths require **Node.js ≥ 22**. Two options:

- **Option A — Polyfills**: Add `core-js` or `set-methods-polyfill` to keep backward compat.
- **Option B — Major bump** (recommended): Release as **v8.0.0** with `engines.node >=22`. Node 18 is EOL, Node 20 EOL April 2026.
