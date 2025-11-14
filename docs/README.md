# mingo

MongoDB query language for in-memory objects

![license](https://img.shields.io/github/license/kofrasa/mingo)
[![version](https://img.shields.io/npm/v/mingo)](https://www.npmjs.org/package/mingo)
[![build](https://github.com/kofrasa/mingo/actions/workflows/build.yml/badge.svg)](https://github.com/kofrasa/mingo/actions/workflows/build.yml)
![issues](https://img.shields.io/github/issues/kofrasa/mingo)
[![codecov](https://img.shields.io/codecov/c/github/kofrasa/mingo)](https://codecov.io/gh/kofrasa/mingo)
[![npm downloads](https://img.shields.io/npm/dm/mingo)](https://www.npmjs.org/package/mingo)

## Install

`$ npm install mingo`

## Features

- Dot notation selectors. _`<array>.<index>`_ and _`<document>.<field>`_.
- [Query](https://www.mongodb.com/docs/manual/reference/mql/query-predicates/) and [Projection](https://www.mongodb.com/docs/manual/reference/mql/projection/).
- Aggregation [stages](https://www.mongodb.com/docs/manual/reference/mql/aggregation-stages/) with
  - [Accumulators](https://www.mongodb.com/docs/manual/reference/mql/accumulators/)
  - [Expressions](https://www.mongodb.com/docs/manual/reference/mql/expressions/)
  - [Window operators](https://docs.mongodb.com/manual/reference/operator/aggregation/setWindowFields/#window-operators)
- Aggregation variables; [`$$ROOT`, `$$CURRENT`, `$$DESCEND`, `$$PRUNE`, `$$KEEP`, `$$REMOVE`, `$$NOW`](https://docs.mongodb.com/manual/reference/aggregation-variables/)
- [Update](https://www.mongodb.com/docs/manual/reference/mql/update/) support. See [Updating Documents](#updating-documents).
- Lazy data processing pipeline.
- Support custom type value equality when `toString` is implemented.


## API
Below are the most commonly used objects exported in the default module.

- **Functions**: [find](http://kofrasa.github.io/mingo/api/functions/index.find.html), [aggregate](http://kofrasa.github.io/mingo/api/functions/index.aggregate.html), [update](http://kofrasa.github.io/mingo/api/functions/updater.update.html), [updateMany](http://kofrasa.github.io/mingo/api/functions/updater.updateMany.html), [updateOne](http://kofrasa.github.io/mingo/api/functions/updater.updateOne.html).
- **Classes**: [Query](http://kofrasa.github.io/mingo/api/classes/index.Query.html), [Aggregator](http://kofrasa.github.io/mingo/api/classes/index.Aggregator.html)

See [here](http://kofrasa.github.io/mingo/api/modules.html) for full module documentation. For information on how to use specific operators refer to official [MongoDB](https://www.mongodb.com/docs/manual/reference/mql/) website.

Use the <a href="http://kofrasa.github.io/mingo/demo.html" target="_blank" rel="noopener noreferrer">playground</a> to try out this library in a fully functional environment.

## Usage

```js
import * as mingo from "mingo";

const result = find(
  [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 21 },
    { name: 'Charlie', age: 25 },
  ],
  { age: { $gte: 25 } }
).all()

console.log(result)
/*
[
  { "name": "Alice", "age": 30 },
  { "name": "Charlie", "age": 25 }
]
*/
```

**NB:** Importing the default entry point or any objcets from it will load all operators into your environment.

### Loading Operators

To load only specific operators in your environment, you should import objects from their base modules such as `mingo/{core,query,aggregator,updater}`, and then import and register operators into a custom `Context` which is passed as an option. This is necessary for tree-shaking when build size is a concern.

Operators loaded into a `Context` cannot be replaced. Registering the same operator name is a no-op and does not throw an error.

```js
// In this example the only operators available will be $match, $count, and $gt.
// Attempting to use any other operator will throw an error.
import { Context } from "mingo/core";
import { Aggregator } from "mingo/aggregator";
import { $match } from "mingo/operators/pipeline/match";
import { $count } from "mingo/operators/pipeline/count";
import { $gt } from "mingo/operators/expression/comparison/gt";

// creates a context with only operators needed for execution.
const context = Context.init({
  pipeline: { $count, $match },
  expression: { $gt }
});

const agg = new Aggregator(
  [{ $match: { score: { $gt: 80 } } }, { $count: "passing_scores" }],
  { context } // pass context as part of options
);

const result = agg.run([
  { _id: 1, score: 10 },
  { _id: 2, score: 60 },
  { _id: 3, score: 100 }
]);
```

### Using Query to test objects

```js
// Query imported from default entry point. Automatically loads all operators into context.
import { Query } from "mingo";

// create a query with criteria
// find all grades for homework with score >= 50
let query = new Query({
  type: "homework",
  score: { $gte: 50 }
});

// test if an object matches query
query.test(doc); // returns boolean if `doc` matches criteria.
```

### Searching and Filtering

```js
// Query imported from default entry point. Automatically loads all operators into context.
import { Query } from "mingo";

const query = new Query({ score: { $gt: 10 } });

// filter some `collection` with find()
const cursor = query.find(collection);

// sort, skip and limit by chaining
cursor.sort({ student_id: 1, score: -1 }).skip(100).limit(100);

// count matches. exhausts cursor
cursor.count();

// classic cursor iterator (old school)
while (cursor.hasNext()) {
  console.log(cursor.next());
}

// ES6 iterators (new cool)
for (let value of cursor) {
  console.log(value);
}

// all() to retrieve matched objects. exhausts cursor
cursor.all();
```

### Using $jsonSchema operator

To use the `$jsonSchema` operator, you must register your own `JsonSchemaValidator` in the options.
No default implementation is provided out of the box so users can use a library with their preferred schema format.

The example below uses [Ajv](https://www.npmjs.com/package/ajv) to implement schema validation.

```js
import mingo from "mingo"
import type { AnyObject, JsonSchemaValidator } from "mingo/types"
import Ajv, { Schema } from "ajv"

const jsonSchemaValidator: JsonSchemaValidator = (s: AnyObject) => {
  const ajv = new Ajv();
  const v = ajv.compile(s as Schema);
  return (o: AnyObject) => (v(o) ? true : false);
};

const schema = {
  type: "object",
  required: ["item", "qty", "instock"],
  properties: {
    item: { type: "string" },
    qty: { type: "integer" },
    size: {
      type: "object",
      required: ["uom"],
      properties: {
        uom: { type: "string" },
        h: { type: "number" },
        w: { type: "number" },
      },
    },
    instock: { type: "boolean" },
  },
};

// queries documents using schema validation
mingo.find(docs, { $jsonSchema: schema }, {}, { jsonSchemaValidator }).all();
```

**NB:** An error is thrown when the `$jsonSchema` operator is used without a the `jsonSchemaValidator` configured.

### Aggregation

```js
import { Aggregator } from "mingo/aggregator";
import { Context } from "mingo/core";
import { $group } from "mingo/operators/pipeline/group";
import { $match } from "mingo/operators/pipeline/match";
import { $sort } from "mingo/operators/pipeline/sort";
import { $min } from "mingo/operators/accumulator/min";

// ensure the required operators are preloaded prior to using them.
const context = Context.init({
  pipeline: { $group, $match, $sort },
  accumulator: { $min }
});

let agg = new Aggregator(
  [
    { $match: { type: "homework" } },
    { $group: { _id: "$student_id", score: { $min: "$score" } } },
    { $sort: { _id: 1, score: 1 } }
  ],
  { context }
);

// return an iterator for streaming results
let stream = agg.stream(collection);

// return all results. same as `stream.all()`
let result = agg.run(collection);
```

## Options

Query and aggregation operations can be configured with options to enabled different features or customize how documents are processed. Some options are only relevant to specific operators and need not be specified if not required.

| Name                | Default | Description|
| ------------------- | ------- | ---------- |
| collation           | _none_ | [Collation](http://kofrasa.github.io/mingo/interfaces/core.CollationSpec.html) specification for string sorting operations. See [Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator) |
| collectionResolver  | _none_ | <p>Function to resolve strings to arrays for use with operators that reference other collections such as; `$lookup`, `$out` and `$merge`.</p>Expects: `(string) => AnyObject[]`. |
| context             | _none_ | <p>An object that defines which operators should be used.</p>This option allow users to load only desired operators or register custom operators which need not be available globally. |
| hashFunction        | _default_ | <p>Custom hash function to replace the default based on "Effective Java" hashCode.</p>Expects: `(Any) => number`. |
| idKey               | `"_id"`   | <p>The key that is used to lookup the ID value of a document.</p> |
| jsonSchemaValidator | _none_    | <p>JSON schema validator to use for the `$jsonSchema` operator.</p>Expects: `(schema: AnyObject) => (document: AnyObject) => boolean`.<br>The `$jsonSchema` operation would fail if a validator is not provided. |
| processingMode      | `CLONE_OFF` | <p>Determines how inputs are to be modified or not during processing.</p> |
| scriptEnabled       | `true` | <p>Enable or disable using custom script execution.</p>When disabled, operators that execute custom code are disallowed such as; `$where`, `$accumulator`, and `$function`. |
| useStrictMode       | `true` | <p>Enforces strict MongoDB compatibility. When disabled the behaviour changes as follows.</p><ul><li>`$elemMatch` returns all matching documents instead of only the first.</li><li>Empty string `""` is coerced to false during boolean checks.</li><li>`$type` returns JS native type names. <table><thead><tr><td><b>MongoDB</b></td><td><b>JS</b></td></tr></thead><tr><td><code>"missing"</code></td><td><code>"undefined"</code></td></tr><tr><td><code>"bool"</code></td><td><code>"boolean"</code></td></tr><tr><td><code>"int"&#124;"long"&#124;"double"</code></td><td><code>"number"</code></td></tr><tr><td><code>"regex"</code></td><td><code>"regexp"</code></td></tr></table> |
| variables           | _none_ | Global variables to pass to all operators. |

## Custom Operators

Custom operators can be registered using a `Context` object via the `context` option which is the recommended way since `6.4.2`. `Context` provides a container for operators that the execution engine will use to process queries.

Operators must conform to the signatures of their types. See [mingo/core](https://kofrasa.github.io/mingo/api/modules/core.html) module for types.

To define custom operators, the following imports are useful.

```js
const mingo = require("mingo");
const util = require("mingo/util");
```

### Custom Operator Examples

```js
// this example creates a query operator that checks if a value is between a boundary.
const $between = (selector, args, options) => {
  return obj => {
    const value = util.resolve(obj, selector, { unwrapArray: true });
    return value >= args[0] && value <= args[1];
  };
};
// a test collection
const collection = [
  { a: 1, b: 1 },
  { a: 7, b: 1 },
  { a: 10, b: 6 },
  { a: 20, b: 10 }
];
```

#### Register custom operator using the context option.

The custom operator is registered with a user-provided context object that is passed an option to the query. The context will be searched for operators used in a query and fallback to the global context when not found.

```ts
const context = mingo.Context.init().addQueryOps({ $between });
// must specify context option to make operator available
const result = mingo
  .find(collection, { a: { $between: [5, 10] } }, {}, { context })
  .all();

console.log(result); // output => [ { a: 7, b: 1 }, { a: 10, b: 6 } ]
```

## Updating Documents

The `updateOne` and `updateMany` functions can be used to update collections. These work similarly to the methods of the same names on MongoDB collections. These functions operate on an input collection and may _modify objects within the collection in-place, or replace them completely_. They also allow using supported pipeline operators as modifiers.

For updating a single object reference use the [update](https://kofrasa.github.io/mingo/api/functions/updater.update.html) function.

### Example: Modify object with `update()`

```ts
import { update } from "mingo";

const obj = {
  firstName: "John",
  lastName: "Wick",
  age: 40,
  friends: ["Scooby", "Shagy", "Fred"]
};

// returns array of modified paths if value changed.
update(obj, { $set: { firstName: "Bob", lastName: "Doe" } }); // ["firstName", "lastName"]

// update nested values.
update(obj, { $pop: { friends: 1 } }); // ["friends"] => friends: ["Scooby", "Shagy"]
// update nested value path
update(obj, { $unset: { "friends.1": "" } }); // ["friends.1"] => friends: ["Scooby", null]
// update with condition
update(obj, { $set: { "friends.$[e]": "Velma" } }, [{ e: null }]); // ["friends"] => friends: ["Scooby", "Velma"]
// empty array returned if value has not changed.
update(obj, { $set: { firstName: "Bob" } }); // [] => no change to object.
```

## Distribution

The library provides 3 distributions on [NPM](https://www.npmjs.com/package/mingo?activeTab=code).

1.  A browser bundle that exposes a global `mingo` object. See [unpkg](https://unpkg.com/mingo/dist/mingo.min.js).
1.  A CommonJS module under `./cjs` when loaded using `require` or in `NodeJS` environments.
1.  An ESM module under `./esm` which is the default export. Can load as module from [esm.run](https://esm.run/mingo/esm/index.js).

> Supporting both CJS and ESM modules makes this library subject to the [dual package hazard](https://github.com/nodejs/package-examples). In backend environments, be consistent with the module loading format to avoid surprises and subtle errors. You can avoid this by loading from only the default exports to get all operators, or creating a custom bundle with your favorite bundler.

### Load as global object in browser
<script src="https://unpkg.com/mingo/dist/mingo.min.js"></script>
<script>
  // global 'mingo' module available in scope
  console.log((new mingo.Query({a:5})).test({a:10})) // false
</script>

### Load as ESM module in browser
```html
<script type="module">
  import * as mingo from "https://esm.run/mingo/esm/index.js";
  // use objects on 'mingo' module with full operator support.
  console.log((new mingo.Query({a:5})).test({a:10})) // false
</script>
```

## Differences from MongoDB

Below is a description of how this library differs from the full MongoDB query engine.

1. There is no concept of a collection. Input is an array, generator or iterable of objects.
1. Support a single numeric type `number`.
1. Does not support [types](https://www.mongodb.com/docs/manual/reference/operator/aggregation/type/#available-types) `"minKey"`, `"maxKey"`, `"timestamp"`, or `"binData"`.
1. Does not support server specific operators. E.g. `$collStat`, `$planCacheStats`, `$listSessions`.
1. Does not support geometry operators.
1. Does not support query operators dependent on persistent storage; `$comment`, `$meta`, `$text`.
1. Does not support server specific expression operators; `$toObjectId`, `$binarySize`, `bsonSize`.
1. Aggregation pipeline operator `$merge` enforces unique constraint on the lookup field during input processing.
1. Custom function evaluation operators; `$where`, `$function`, and `$accumulator`, do not accept strings as the function body.
1. Custom function evaluation operators are enabled by default. They can be disabled with the `scriptEnabled` option.
1. Custom function evaluation operator [$accumulator](https://docs.mongodb.com/manual/reference/operator/aggregation/accumulator/) does not support the `merge` option.
1. To use `$jsonSchema` operator, you must register your own validator with the `jsonSchemaValidator` option.

## Use Cases

- Declarative data driven API.
- Usable on both frontend and backend.
- Provides an alternative to writing custom code for transforming objects.
- Validate MongoDB queries without running a server.
- Well documented. MongoDB query language is among the best available and has great documentation.

## Contributing

- Squash changes into one commit.
- Run `npm test` to build and run unit tests.
- Submit pull request.

To validate correct behaviour and semantics of operators, you may also test against [mongoplayground.net](https://mongoplayground.net/). Credit to the author _[@feliixx](https://github.com/feliixx)_.

A big thank you to all users and [CONTRIBUTORS](https://github.com/kofrasa/mingo/graphs/contributors) of this library.

## License

MIT
