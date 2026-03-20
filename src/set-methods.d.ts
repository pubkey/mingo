/**
 * Type declarations for native Set methods (ES2025).
 * Internalized here so consumers of the library do not need to add
 * "esnext.collection" to their own tsconfig lib.
 */
interface Set<T> {
  intersection(other: ReadonlySetLike<T>): Set<T>;
  difference(other: ReadonlySetLike<T>): Set<T>;
  isSubsetOf(other: ReadonlySetLike<T>): boolean;
}

interface ReadonlySetLike<T> {
  has(value: T): boolean;
  keys(): IterableIterator<T>;
  readonly size: number;
}
