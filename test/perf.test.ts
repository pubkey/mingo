/* eslint-disable-next-line */
import { performance } from "perf_hooks";

import { AnyObject, Callback, Options } from "../src/types";
import { aggregate } from "../src";
import { $sort } from "../src/operators/pipeline";
import { Lazy } from "../src/lazy";
import { DEFAULT_OPTS } from "./support";

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
    const TIME_LIMIT_MS = 500;
    const INPUT_SIZE = 10000;
    function makeid(length: number) {
      const size = Math.round(length / 15);
      const text = new Array<string>(size);
      for (let i = 0; i < size; i++) {
        text[i] = Math.floor(Math.random() * 1e17).toString(16);
      }
      return text.join("");
    }

    const arrayToSort: string[] = [];
    for (let i = 0; i < INPUT_SIZE; i++) {
      arrayToSort.push(makeid(128));
    }

    const MINGO_SORT = "MINGO SORT";
    const MINGO_SORT_LOCALE = "MINGO SORT WITH LOCALE";
    const NATIVE_SORT = "NATIVE SORT";
    const NATIVE_SORT_LOCALE = "NATIVE SORT WITH LOCALE";

    it("should complete in less than 500ms", () => {
      const measure = (
        cb: Callback<void, unknown[]>,
        data: unknown[],
        label: string
      ): number => {
        console.time(label);
        const start = performance.now();
        cb(data);
        const end = performance.now();
        console.timeEnd(label);
        return end - start;
      };

      // MINGO sort
      const coll = arrayToSort.map(k => {
        return { k };
      });
      expect(
        measure(
          arr => $sort(Lazy(arr), { k: 1 }, DEFAULT_OPTS).collect(),
          coll,
          MINGO_SORT
        )
      ).toBeLessThan(TIME_LIMIT_MS);

      // with locale
      const coll2 = arrayToSort.map(k => {
        return { k };
      });
      expect(
        measure(
          arr =>
            $sort(
              Lazy(arr),
              { k: 1 },
              Object.assign({}, DEFAULT_OPTS, {
                collation: { locale: "en", strength: 1 }
              }) as Options
            ).collect(),
          coll2,
          MINGO_SORT_LOCALE
        )
      ).toBeLessThan(500);

      // NATIVE code
      expect(
        measure(arr => arr.sort(), arrayToSort.slice(), NATIVE_SORT)
      ).toBeLessThan(TIME_LIMIT_MS);

      // with locale
      expect(
        measure(
          (arr: string[]) => {
            arr.sort((a, b) =>
              a.localeCompare(b, "en", { sensitivity: "base" })
            );
          },
          arrayToSort.slice(),
          NATIVE_SORT_LOCALE
        )
      ).toBeLessThan(TIME_LIMIT_MS);
    });
  });
});

/* eslint-enable no-console */
