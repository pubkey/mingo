import { Iterator } from "./lazy";
import type { UpdateParams } from "./operators/update/_internal";
import type { WindowOperatorInput } from "./operators/window/_internal";
import {
  Any,
  AnyObject,
  ArrayOrObject,
  Callback,
  HashFunction,
  Predicate
} from "./types";
import {
  assert,
  has,
  isArray,
  isNil,
  isObject,
  isOperator,
  isString,
  resolve
} from "./util";

/**
 * Resolves the given string to a Collection.
 * This is useful for operators that require a second collection to use such as $lookup and $out.
 * The collection is not cached and will be resolved each time it is used.
 */
export type CollectionResolver = (name: string) => AnyObject[];

/** Specification for collation options */
export interface CollationSpec {
  readonly locale: string;
  readonly caseLevel?: boolean;
  readonly caseFirst?: "upper" | "lower" | "off";
  readonly strength?: 1 | 2 | 3;
  readonly numericOrdering?: boolean;
  readonly alternate?: string;
  readonly maxVariable?: never; // unsupported
  readonly backwards?: never; // unsupported
}

/**
 * JSON schema validator
 */
export type JsonSchemaValidator = (schema: AnyObject) => Predicate<AnyObject>;

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

/**
 * Generic options interface passed down to all operators
 */
export interface Options {
  /** The key that is used to lookup the ID value of a document. @default "_id". */
  readonly idKey: string;
  /** The collation specification for string sorting operations. */
  readonly collation?: CollationSpec;
  /** Determines how to treat inputs and outputs. @default ProcessingMode.CLONE_OFF. */
  readonly processingMode: ProcessingMode;
  /** Enforces strict MongoDB compatibilty. See README. @default true. */
  readonly useStrictMode: boolean;
  /** Enable or disable custom script execution using `$where`, `$accumulator`, and `$function` operators. @default true. */
  readonly scriptEnabled: boolean;
  /** Hash function to replace the Effective Java default implementation. */
  readonly hashFunction?: HashFunction;
  /** Function to resolve strings to arrays for use with operators that reference other collections such as; `$lookup`, `$out` and `$merge`. */
  readonly collectionResolver?: CollectionResolver;
  /** JSON schema validator to use with the '$jsonSchema' operator. Required in order to use the operator. */
  readonly jsonSchemaValidator?: JsonSchemaValidator;
  /** Global variables. */
  readonly variables?: Readonly<AnyObject>;
  /** Extra references to operators to be used for processing. */
  readonly context: Context;
  /** configurations for update */
  readonly updateConfig?: {
    cloneMode: CloneMode;
    sort?: AnyObject;
  };
}

interface Locals {
  /** Reference to the root object when processing subgraphs of the object. */
  root?: Any;
  /** The groupId computed for a group of documents. */
  groupId?: Any;
  /** Local user-defind variables. */
  variables?: AnyObject;
  /** The current timestamp */
  readonly now?: number;
  /** Depth of field selector in Query condition. */
  readonly depth?: number;
  /** Query condition */
  readonly condition?: AnyObject;
  /** compiled information about update selectors */
  readonly updateParams?: UpdateParams;
}

export class ComputeOptions implements Options {
  #locals: Locals;

  private constructor(
    readonly options: Options,
    locals?: Locals
  ) {
    this.#locals = Object.assign({ now: Date.now() }, locals);
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
          processingMode: ProcessingMode.CLONE_OFF,
          updateConfig: { cloneMode: "copy", ...options?.updateConfig },
          ...options,
          context: options?.context
            ? Context.from(options?.context)
            : Context.init()
        });
  }

  update(locals?: Omit<Locals, "now">): ComputeOptions {
    Object.assign(this.#locals, locals, {
      // DO NOT override timestamp
      now: this.#locals.now,
      // merge variables.
      variables: { ...this.#locals?.variables, ...locals?.variables }
    });
    return this;
  }

  get root() {
    return this.#locals.root;
  }
  get local() {
    return this.#locals;
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
  get hashFunction() {
    return this.options?.hashFunction;
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
  get updateConfig() {
    return this.options?.updateConfig;
  }
}

/**
 * Supported cloning modes.
 * - "deep": Performs a recursive deep clone of the object.
 * - "copy": Performs a shallow copy of the object. @default
 * - "none": No cloning. Uses the value as given. NOT RECOMMENDED.
 */
export type CloneMode = "deep" | "copy" | "none";

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

/** @deprecated use {@link OpType} */
export type OperatorType = OpType;

export type AccumulatorOperator<R = Any> = (
  collection: Any[],
  expr: Any,
  options: Options
) => R;

export type ExpressionOperator<R = Any> = (
  obj: AnyObject,
  expr: Any,
  options: Options
) => R;

export type PipelineOperator = (
  collection: Iterator,
  expr: Any,
  options: Options
) => Iterator;

export type ProjectionOperator = (
  obj: AnyObject,
  expr: Any,
  selector: string,
  options: Options
) => Any;

export type QueryOperator = (
  selector: string,
  value: Any,
  options: Options
) => (obj: AnyObject) => boolean;

export type WindowOperator = (
  obj: AnyObject,
  array: AnyObject[],
  expr: WindowOperatorInput,
  options: Options
) => Any;

type Operator =
  | AccumulatorOperator
  | ExpressionOperator
  | PipelineOperator
  | ProjectionOperator
  | QueryOperator
  | WindowOperator;

type AccumulatorOps = Record<string, AccumulatorOperator>;
type ExpressionOps = Record<string, ExpressionOperator>;
type ProjectionOps = Record<string, ProjectionOperator>;
type QueryOps = Record<string, QueryOperator>;
type PipelineOps = Record<string, PipelineOperator>;
type WindowOps = Record<string, WindowOperator>;

export class Context {
  #operators = new Map<OpType, Record<string, Operator>>(
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
      if (ctx.#operators.has(type as OpType) && operators) {
        ctx.addOperators(type as OpType, operators);
      }
    }
    return ctx;
  }

  static from(ctx?: Context): Context {
    return Context.init((ctx && Object.fromEntries(ctx.#operators)) || {});
  }

  static merge(first: Context, second: Context): Context {
    const ctx = Context.from(first);
    for (const type of Object.values(OpType)) {
      ctx.addOperators(type, second.#operators.get(type));
    }
    return ctx;
  }

  private addOperators(
    type: OpType,
    operators: Record<string, Operator>
  ): Context {
    this.#operators.set(
      type,
      Object.assign({}, operators, this.#operators.get(type))
    );
    return this;
  }

  getOperator(type: OpType, name: string): Callback | null {
    return this.#operators.get(type)[name] ?? null;
  }

  addAccumulatorOps(ops: AccumulatorOps) {
    return this.addOperators(OpType.ACCUMULATOR, ops);
  }

  addExpressionOps(ops: ExpressionOps) {
    return this.addOperators(OpType.EXPRESSION, ops);
  }

  addQueryOps(ops: QueryOps) {
    return this.addOperators(OpType.QUERY, ops);
  }

  addPipelineOps(ops: PipelineOps) {
    return this.addOperators(OpType.PIPELINE, ops);
  }

  addProjectionOps(ops: ProjectionOps) {
    return this.addOperators(OpType.PROJECTION, ops);
  }

  addWindowOps(ops: WindowOps) {
    return this.addOperators(OpType.WINDOW, ops);
  }
}

/**
 * Computes the value of the expression on the object for the given operator
 *
 * @param obj the current object from the collection
 * @param expr the expression for the given field
 * @param operator the operator to resolve the field with
 * @param options {Object} extra options
 * @returns {*}
 */
export function computeValue(
  obj: Any,
  expr: Any,
  operator: string | null,
  options: Options
): Any {
  // only intialize compute opts when necessary.
  const copts =
    !(options instanceof ComputeOptions) || isNil(options.root)
      ? ComputeOptions.init(options).update({ root: obj })
      : options;

  // ensure valid options exist on first invocation
  return !!operator && isOperator(operator)
    ? computeOperator(obj, expr, operator, copts)
    : computeExpression(obj, expr, copts);
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
    let ctx = options.root;

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
          ctx = new Date(options.local?.now);
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
    const elems = Object.entries(expr as AnyObject);
    for (const [key, val] of elems) {
      // if object represents an operator expression, there should only be a single key
      if (isOperator(key)) {
        assert(elems.length == 1, "expression must have single operator.");
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
  const callExpression = context.getOperator(
    OpType.EXPRESSION,
    operator
  ) as ExpressionOperator;
  if (callExpression) return callExpression(obj as AnyObject, expr, options);

  // handle accumulators
  const callAccumulator = context.getOperator(
    OpType.ACCUMULATOR,
    operator
  ) as AccumulatorOperator;

  // operator was not found
  assert(!!callAccumulator, `accumulator '${operator}' is not registered.`);

  // if object is not an array, attempt to resolve to array.
  if (!isArray(obj)) {
    obj = computeExpression(obj, expr, options);
    expr = null;
  }

  assert(isArray(obj), `arguments must resolve to array for ${operator}.`);

  // accumulator must override the root accordingly. we pass the full context as is.
  return callAccumulator(obj as Any[], expr, options);
}
