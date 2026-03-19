import {
  AccumulatorOperator,
  ExpressionOperator,
  Operator,
  PipelineOperator,
  ProjectionOperator,
  QueryOperator,
  WindowOperator
} from "../operators/typings";
import type { UpdateParams } from "../operators/update/_internal";
import type {
  Any,
  AnyObject,
  ArrayOrObject,
  Callback,
  Options
} from "../types";
import type { UpdateConfig } from "../updater";
import {
  assert,
  has,
  isArray,
  isNil,
  isObject,
  isOperator,
  isString,
  resolve
} from "../util";

export type OperatorName = `$${string}`;
export type AccumulatorOps = Record<OperatorName, AccumulatorOperator>;
export type ExpressionOps = Record<OperatorName, ExpressionOperator>;
export type ProjectionOps = Record<OperatorName, ProjectionOperator>;
export type QueryOps = Record<OperatorName, QueryOperator>;
export type PipelineOps = Record<OperatorName, PipelineOperator>;
export type WindowOps = Record<OperatorName, WindowOperator>;

/**
 * Enum representing the processing modes for handling input and output documents.
 * This determines whether cloning is applied to maintain immutability or ensure
 * distinct object references.
 */
export enum ProcessingMode {
  /** Do not clone inputs or outputs. Resulting documents may share references. This is the default mode. */
  CLONE_OFF = 0,
  /** Clone input documents to maintain immutability of the original input. */
  CLONE_INPUT = 1,
  /** Clone output documents to ensure distinct objects without shared references. */
  CLONE_OUTPUT = 2,
  /** Clone both input and output documents. Combines `CLONE_INPUT` and `CLONE_OUTPUT`.*/
  CLONE_ALL = CLONE_INPUT | CLONE_OUTPUT
}

interface Locals {
  /** Reference to the root object when processing subgraphs of the object. */
  root?: Any;
  /** The groupId computed for a group of documents. */
  groupId?: Any;
  /** Local user-defind variables. */
  variables?: AnyObject;
  /** The current timestamp */
  readonly timestamp?: number;
  /** Depth of field selector in Query condition. */
  readonly depth?: number;
  /** Query condition */
  readonly condition?: AnyObject;
  /** compiled information about update selectors */
  readonly updateParams?: UpdateParams;
  /** update configuration */
  readonly updateConfig?: UpdateConfig;
}

export class ComputeOptions implements Options {
  #locals: Locals;

  private constructor(
    readonly options: Options,
    locals?: Locals
  ) {
    this.#locals = locals ? { ...locals } : {};
  }

  /**
   * Initializes a new instance of the `ComputeOptions` class with the provided options.
   *
   * @param options - A partial set of options to configure the `ComputeOptions` instance.
   *                  If an instance of `ComputeOptions` is provided, its internal options and locals are used.
   * @returns A new `ComputeOptions` instance configured with the provided options and root.
   */
  static init(options: Partial<Options>): ComputeOptions {
    return options instanceof ComputeOptions
      ? new ComputeOptions(options.options, options.#locals)
      : new ComputeOptions({
          idKey: "_id",
          scriptEnabled: true,
          useStrictMode: true,
          failOnError: true,
          processingMode: ProcessingMode.CLONE_OFF,
          ...options,
          context: options?.context
            ? Context.from(options?.context)
            : Context.init()
        });
  }

  update(locals?: Omit<Locals, "now">): ComputeOptions {
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
    // defer setting the current time until accessed.`
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

/**
 * The different groups of operators
 */
export enum OpType {
  ACCUMULATOR = "accumulator",
  EXPRESSION = "expression",
  PIPELINE = "pipeline",
  PROJECTION = "projection",
  QUERY = "query",
  WINDOW = "window"
}

/**
 * The `Context` class is a utility for managing and organizing operators of various types.
 * It provides methods to initialize, merge, and retrieve operators, as well as add specific
 * types of operators to the context.
 */
export class Context {
  #operators: Record<string, Record<string, Callback>> = Object.fromEntries(
    Object.values(OpType).map(k => [k, {}])
  );

  private constructor() {}

  static init(
    ops: {
      accumulator?: AccumulatorOps;
      expression?: ExpressionOps;
      pipeline?: PipelineOps;
      projection?: ProjectionOps;
      query?: QueryOps;
      window?: WindowOps;
    } = {}
  ): Context {
    const ctx = new Context();
    // ensure all operator types are initialized
    for (const [type, operators] of Object.entries(ops)) {
      if (ctx.#operators[type] && operators) {
        ctx.addOps(type as OpType, operators);
      }
    }
    return ctx;
  }

  /** Returns a new context with the operators from the provided contexts merged left to right. */
  static from(...ctx: Context[]): Context {
    // fast path: single context can be reused directly
    if (ctx.length === 1) return ctx[0];
    const newCtx = new Context();
    for (const context of ctx) {
      for (const type of Object.values(OpType)) {
        newCtx.addOps(type, context.#operators[type]);
      }
    }
    return newCtx;
  }

  private addOps(
    type: OpType,
    operators: Record<OperatorName, Operator>
  ): Context {
    this.#operators[type] = Object.assign({}, operators, this.#operators[type]);
    return this;
  }

  getOperator(type: OpType, name: string): Callback | null {
    return this.#operators[type][name] ?? null;
  }

  addAccumulatorOps(ops: AccumulatorOps) {
    return this.addOps(OpType.ACCUMULATOR, ops);
  }

  addExpressionOps(ops: ExpressionOps) {
    return this.addOps(OpType.EXPRESSION, ops);
  }

  addQueryOps(ops: QueryOps) {
    return this.addOps(OpType.QUERY, ops);
  }

  addPipelineOps(ops: PipelineOps) {
    return this.addOps(OpType.PIPELINE, ops);
  }

  addProjectionOps(ops: ProjectionOps) {
    return this.addOps(OpType.PROJECTION, ops);
  }

  addWindowOps(ops: WindowOps) {
    return this.addOps(OpType.WINDOW, ops);
  }
}

/**
 * Computes the value of the expression on the object for the given operator.
 * @deprecated use {@link evalExpr}
 */
export function computeValue(
  obj: Any,
  expr: Any,
  operator: string,
  options: Options
): Any {
  return evalExpr(obj, { [operator]: expr }, options);
}

/**
 * Evaluates an expression with the given document context.
 * @param obj The document or value to use as data context.
 * @param expr The expression to evaluate.
 * @param options Options
 * @returns Result of evaluation.
 */
export function evalExpr(obj: Any, expr: Any, options: Options): Any {
  // only intialize compute opts when necessary.
  const copts =
    !(options instanceof ComputeOptions) || isNil(options.local.root)
      ? ComputeOptions.init(options).update({ root: obj })
      : options;

  return computeExpression(obj, expr, copts);
}

const SYSTEM_VARS = ["$$ROOT", "$$CURRENT", "$$REMOVE", "$$NOW"] as const;
type SystemVar = (typeof SYSTEM_VARS)[number];

/** Computes the value of the expr given for the object. */
function computeExpression(obj: Any, expr: Any, options: ComputeOptions): Any {
  // if expr is a string and begins with "$$", then we have a variable.
  //  this can be one of; redact variable, system variable, user-defined variable.
  //  we check and process them in that order.
  //
  // if expr begins only a single "$", then it is a path to a field on the object.
  if (isString(expr) && expr.length > 0 && expr[0] === "$") {
    // we return redact variables as literals
    if (expr === "$$KEEP" || expr === "$$PRUNE" || expr === "$$DESCEND")
      return expr;

    // default to root for resolving path.
    let ctx = options.local.root;

    // handle selectors with explicit prefix
    const arr = expr.split(".");
    if (SYSTEM_VARS.includes(arr[0] as SystemVar)) {
      // set 'root' only the first time it is required to be used for all subsequent calls
      // if it already available on the options, it will be used
      switch (arr[0] as SystemVar) {
        case "$$ROOT":
          break;
        case "$$CURRENT":
          ctx = obj;
          break;
        case "$$REMOVE":
          ctx = undefined;
          break;
        case "$$NOW":
          ctx = new Date(options.now);
          break;
      }
      expr = expr.slice(arr[0].length + 1); //  +1 for '.'
    } else if (arr[0].slice(0, 2) === "$$") {
      // handle user-defined variables
      ctx = Object.assign(
        {},
        // global vars
        options.variables,
        // current item is added before local variables because the binding may be changed.
        { this: obj },
        // local vars
        options?.local?.variables
      );
      // the variable name
      const name = arr[0].slice(2);
      assert(has(ctx as AnyObject, name), `Use of undefined variable: ${name}`);
      expr = expr.slice(2);
    } else {
      // 'expr' is a path to a field on the object.
      expr = expr.slice(1);
    }

    return expr === "" ? ctx : resolve(ctx as ArrayOrObject, expr as string);
  }

  // check and return value if already in a resolved state
  if (isArray(expr)) {
    return expr.map(item => computeExpression(obj, item, options));
  }

  if (isObject(expr)) {
    const result: AnyObject = {};
    const elems = Object.entries(expr);
    for (const [key, val] of elems) {
      // if object represents an operator expression, there should only be a single key
      if (isOperator(key)) {
        assert(
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

function computeOperator(
  obj: Any,
  expr: Any,
  operator: string,
  options: ComputeOptions
): Any {
  const context = options.context;
  // if the field of the object is a valid operator
  const fn = context.getOperator(OpType.EXPRESSION, operator);
  if (fn) return fn(obj, expr, options);

  // handle accumulators
  const accFn = context.getOperator(OpType.ACCUMULATOR, operator)!;

  // operator was not found
  assert(!!accFn, `accumulator '${operator}' is not registered.`);

  // if object is not an array, attempt to resolve to array.
  if (!isArray(obj)) {
    obj = computeExpression(obj, expr, options);
    expr = null;
  }

  assert(isArray(obj), `arguments must resolve to array for ${operator}.`);

  // accumulator must override the root accordingly. we pass the full context as is.
  return accFn(obj, expr, options);
}
