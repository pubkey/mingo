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
