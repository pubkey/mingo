import type { Context, ProcessingMode } from "./core";
import type { Iterator } from "./lazy";
import type { WindowOperatorInput } from "./operators/window/_internal";

export type Any = unknown;
export type AnyObject = Record<string, Any>;
export type ArrayOrObject = AnyObject | Any[];

// Generic callback
export interface Callback<R = Any, T = Any> {
  (...args: T[]): R;
}

// Generic predicate
export interface Predicate<T = Any> {
  (...args: T[]): boolean;
}

// Generic comparator callback
export interface Comparator<T = Any> {
  (left: T, right: T): number;
}

/**
 * Custom function to hash values to improve faster comparaisons
 */
export type HashFunction = (x: Any) => number;

type CommonTypes =
  | "null"
  | "undefined"
  | "string"
  | "date"
  | "array"
  | "object";

// Javascript native types
export type JsType =
  | CommonTypes
  | "boolean"
  | "number"
  | "string"
  | "regexp"
  | "function";

// MongoDB BSON types
export type BsonType =
  | CommonTypes
  | "bool"
  | "int"
  | "long"
  | "double"
  | "decimal"
  | "regex";

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
}

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

export type Operator =
  | AccumulatorOperator
  | ExpressionOperator
  | PipelineOperator
  | ProjectionOperator
  | QueryOperator
  | WindowOperator;

export type OperatorName = `$${string}`;
export type AccumulatorOps = Record<OperatorName, AccumulatorOperator>;
export type ExpressionOps = Record<OperatorName, ExpressionOperator>;
export type ProjectionOps = Record<OperatorName, ProjectionOperator>;
export type QueryOps = Record<OperatorName, QueryOperator>;
export type PipelineOps = Record<OperatorName, PipelineOperator>;
export type WindowOps = Record<OperatorName, WindowOperator>;
