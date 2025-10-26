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
