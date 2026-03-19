var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var internal_exports = {};
__export(internal_exports, {
  ComputeOptions: () => ComputeOptions,
  Context: () => Context,
  OpType: () => OpType,
  ProcessingMode: () => ProcessingMode,
  computeValue: () => computeValue,
  evalExpr: () => evalExpr
});
module.exports = __toCommonJS(internal_exports);
var import_util = require("../util");
var ProcessingMode = /* @__PURE__ */ ((ProcessingMode2) => {
  ProcessingMode2[ProcessingMode2["CLONE_OFF"] = 0] = "CLONE_OFF";
  ProcessingMode2[ProcessingMode2["CLONE_INPUT"] = 1] = "CLONE_INPUT";
  ProcessingMode2[ProcessingMode2["CLONE_OUTPUT"] = 2] = "CLONE_OUTPUT";
  ProcessingMode2[ProcessingMode2["CLONE_ALL"] = 3] = "CLONE_ALL";
  return ProcessingMode2;
})(ProcessingMode || {});
class ComputeOptions {
  constructor(options, locals) {
    this.options = options;
    this.#locals = locals ? { ...locals } : {};
  }
  #locals;
  /**
   * Initializes a new instance of the `ComputeOptions` class with the provided options.
   *
   * @param options - A partial set of options to configure the `ComputeOptions` instance.
   *                  If an instance of `ComputeOptions` is provided, its internal options and locals are used.
   * @returns A new `ComputeOptions` instance configured with the provided options and root.
   */
  static init(options) {
    return options instanceof ComputeOptions ? new ComputeOptions(options.options, options.#locals) : new ComputeOptions({
      idKey: "_id",
      scriptEnabled: true,
      useStrictMode: true,
      failOnError: true,
      processingMode: 0 /* CLONE_OFF */,
      ...options,
      context: options?.context ? Context.from(options?.context) : Context.init()
    });
  }
  update(locals) {
    Object.assign(this.#locals, locals, {
      // DO NOT override timestamp
      timestamp: this.#locals.timestamp,
      // merge variables.
      variables: { ...this.#locals?.variables, ...locals?.variables }
    });
    return this;
  }
  get local() {
    return this.#locals;
  }
  get now() {
    let timestamp = this.#locals.timestamp ?? 0;
    if (!timestamp) {
      timestamp = Date.now();
      Object.assign(this.#locals, { timestamp });
    }
    return new Date(timestamp);
  }
  get idKey() {
    return this.options.idKey;
  }
  get collation() {
    return this.options?.collation;
  }
  get processingMode() {
    return this.options?.processingMode;
  }
  get useStrictMode() {
    return this.options?.useStrictMode;
  }
  get scriptEnabled() {
    return this.options?.scriptEnabled;
  }
  get failOnError() {
    return this.options?.failOnError;
  }
  get collectionResolver() {
    return this.options?.collectionResolver;
  }
  get jsonSchemaValidator() {
    return this.options?.jsonSchemaValidator;
  }
  get variables() {
    return this.options?.variables;
  }
  get context() {
    return this.options?.context;
  }
}
var OpType = /* @__PURE__ */ ((OpType2) => {
  OpType2["ACCUMULATOR"] = "accumulator";
  OpType2["EXPRESSION"] = "expression";
  OpType2["PIPELINE"] = "pipeline";
  OpType2["PROJECTION"] = "projection";
  OpType2["QUERY"] = "query";
  OpType2["WINDOW"] = "window";
  return OpType2;
})(OpType || {});
class Context {
  #operators = Object.fromEntries(
    Object.values(OpType).map((k) => [k, {}])
  );
  constructor() {
  }
  static init(ops = {}) {
    const ctx = new Context();
    for (const [type, operators] of Object.entries(ops)) {
      if (ctx.#operators[type] && operators) {
        ctx.#operators[type] = { ...operators };
      }
    }
    return ctx;
  }
  /** Returns a new context with the operators from the provided contexts merged left to right. */
  static from(...ctx) {
    if (ctx.length === 1) return ctx[0];
    const newCtx = new Context();
    for (const context of ctx) {
      for (const type of Object.values(OpType)) {
        newCtx.addOps(type, context.#operators[type]);
      }
    }
    return newCtx;
  }
  addOps(type, operators) {
    this.#operators[type] = Object.assign({}, operators, this.#operators[type]);
    return this;
  }
  getOperator(type, name) {
    return this.#operators[type][name] ?? null;
  }
  addAccumulatorOps(ops) {
    return this.addOps("accumulator" /* ACCUMULATOR */, ops);
  }
  addExpressionOps(ops) {
    return this.addOps("expression" /* EXPRESSION */, ops);
  }
  addQueryOps(ops) {
    return this.addOps("query" /* QUERY */, ops);
  }
  addPipelineOps(ops) {
    return this.addOps("pipeline" /* PIPELINE */, ops);
  }
  addProjectionOps(ops) {
    return this.addOps("projection" /* PROJECTION */, ops);
  }
  addWindowOps(ops) {
    return this.addOps("window" /* WINDOW */, ops);
  }
}
function computeValue(obj, expr, operator, options) {
  return evalExpr(obj, { [operator]: expr }, options);
}
function evalExpr(obj, expr, options) {
  const copts = !(options instanceof ComputeOptions) || (0, import_util.isNil)(options.local.root) ? ComputeOptions.init(options).update({ root: obj }) : options;
  return computeExpression(obj, expr, copts);
}
const SYSTEM_VARS = ["$$ROOT", "$$CURRENT", "$$REMOVE", "$$NOW"];
function computeExpression(obj, expr, options) {
  if ((0, import_util.isString)(expr) && expr.length > 0 && expr[0] === "$") {
    if (expr === "$$KEEP" || expr === "$$PRUNE" || expr === "$$DESCEND")
      return expr;
    let ctx = options.local.root;
    const arr = expr.split(".");
    if (SYSTEM_VARS.includes(arr[0])) {
      switch (arr[0]) {
        case "$$ROOT":
          break;
        case "$$CURRENT":
          ctx = obj;
          break;
        case "$$REMOVE":
          ctx = void 0;
          break;
        case "$$NOW":
          ctx = new Date(options.now);
          break;
      }
      expr = expr.slice(arr[0].length + 1);
    } else if (arr[0].slice(0, 2) === "$$") {
      ctx = Object.assign(
        {},
        // global vars
        options.variables,
        // current item is added before local variables because the binding may be changed.
        { this: obj },
        // local vars
        options?.local?.variables
      );
      const name = arr[0].slice(2);
      (0, import_util.assert)((0, import_util.has)(ctx, name), `Use of undefined variable: ${name}`);
      expr = expr.slice(2);
    } else {
      expr = expr.slice(1);
    }
    return expr === "" ? ctx : (0, import_util.resolve)(ctx, expr);
  }
  if ((0, import_util.isArray)(expr)) {
    return expr.map((item) => computeExpression(obj, item, options));
  }
  if ((0, import_util.isObject)(expr)) {
    const result = {};
    const elems = Object.entries(expr);
    for (const [key, val] of elems) {
      if ((0, import_util.isOperator)(key)) {
        (0, import_util.assert)(
          elems.length === 1,
          `Expression must contain a single operator. got [${Object.keys(expr).join(",")}]`
        );
        return computeOperator(obj, val, key, options);
      }
      result[key] = computeExpression(obj, val, options);
    }
    return result;
  }
  return expr;
}
function computeOperator(obj, expr, operator, options) {
  const context = options.context;
  const fn = context.getOperator("expression" /* EXPRESSION */, operator);
  if (fn) return fn(obj, expr, options);
  const accFn = context.getOperator("accumulator" /* ACCUMULATOR */, operator);
  (0, import_util.assert)(!!accFn, `accumulator '${operator}' is not registered.`);
  if (!(0, import_util.isArray)(obj)) {
    obj = computeExpression(obj, expr, options);
    expr = null;
  }
  (0, import_util.assert)((0, import_util.isArray)(obj), `arguments must resolve to array for ${operator}.`);
  return accFn(obj, expr, options);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ComputeOptions,
  Context,
  OpType,
  ProcessingMode,
  computeValue,
  evalExpr
});
