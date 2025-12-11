/* eslint-disable-next-line */
import { performance } from "perf_hooks";

import { AnyObject, Callback, Options } from "../src/types";
import { aggregate } from "../src";
import { $sort } from "../src/operators/pipeline";
import { Lazy } from "../src/lazy";
import { DEFAULT_OPTS, makeRandomString } from "./support";

/* eslint-disable no-console */

const items: AnyObject[] = [];
for (let i = 0; i < 100_000; i++) {
  const books: AnyObject[] = [];
  const authors: AnyObject[] = [];
  for (let j = 0; j < 10; j++) {
    books.push({ id: j, title: `book ${j}` });
    authors.push({ id: j, name: `author ${j}` });
  }
  items.push({ _id: i, name: `item ${i}`, active: true, books, authors });
}
describe("perf", () => {
  describe("aggregation", () => {
    it("elapsed time should be less than a 30 seconds", () => {
      console.time("AGGREGATE_PERF");
      aggregate(items, [
        { $match: { active: true } },
        {
          $project: {
            booksSize: { $size: "$books" },
            authorsSize: { $size: "$authors" }
          }
        },
        {
          $group: {
            _id: void 0,
            maxBooksCount: { $max: "$booksSize" },
            allBooksSum: { $sum: "$booksSize" },
            avgBooksCount: { $avg: "$booksSize" },
            maxAuthorsCount: { $max: "$authorsSize" },
            allAuthorsSum: { $sum: "$authorsSize" },
            avgAuthorsCount: { $avg: "$authorsSize" }
          }
        }
      ]);
      console.timeEnd("AGGREGATE_PERF");
    });
  });

  describe("sorting", () => {
    const INPUT_SIZE = 10000;

    const arrayToSort: string[] = [
      // "cad3caf63bc448",
      // "12de91add975de0",
      // "aa6950e27fb518"
    ];
    for (let i = 0; i < INPUT_SIZE; i++) {
      arrayToSort.push(makeRandomString(10));
    }

    const MINGO_SORT = "MINGO SORT";
    const MINGO_SORT_LOCALE = "MINGO SORT WITH LOCALE";
    const NATIVE_SORT = "NATIVE SORT";
    const NATIVE_SORT_LOCALE = "NATIVE SORT WITH LOCALE";

    it("should complete in less than 500ms", () => {
      const doSort = (
        cb: Callback<void, unknown[]>,
        data: unknown[],
        label: string
      ) => {
        console.time(label);
        const start = performance.now();
        const res = cb(data);
        const end = performance.now();
        console.timeEnd(label);
        return res;
      };

      // MINGO sort - ~7x slower than natve
      const mingoSort = doSort(
        arr => $sort(Lazy(arr), { k: 1 }, DEFAULT_OPTS).collect(),
        arrayToSort.slice(),
        MINGO_SORT
      );

      // with locale -  ~10x faster than native locale
      const mingoSortLocale = doSort(
        arr =>
          $sort(
            Lazy(arr),
            { k: 1 },
            Object.assign({}, DEFAULT_OPTS, {
              collation: { locale: "en", strength: 1 }
            }) as Options
          ).collect(),
        arrayToSort.slice(),
        MINGO_SORT_LOCALE
      );

      // NATIVE code - fastest
      const nativeSort = doSort(
        arr => arr.sort(),
        arrayToSort.slice(),
        NATIVE_SORT
      );

      // with locale - slowest
      const nativeSortLocale = doSort(
        (arr: string[]) => {
          return arr.sort((a, b) =>
            a.localeCompare(b, "en", { sensitivity: "base" })
          );
        },
        arrayToSort.slice(),
        NATIVE_SORT_LOCALE
      );

      expect(mingoSort).toEqual(nativeSort);
      expect(mingoSortLocale).toEqual(nativeSortLocale);
    });
  });
});

/* eslint-enable no-console */
