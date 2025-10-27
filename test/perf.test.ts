/* eslint-disable-next-line */
import { performance } from "perf_hooks";

import { AnyObject, Callback } from "../src/types";
import { aggregate, Aggregator } from "../src";

/* eslint-disable no-console */

const items: AnyObject[] = [];
for (let i = 0; i < 100_000; i++) {
  const books: AnyObject[] = [];
  const authors: AnyObject[] = [];
  for (let j = 0; j < 10; j++) {
    books.push({
      id: j,
      title: `book ${j}`
    });
    authors.push({
      id: j,
      name: `author ${j}`
    });
  }
  items.push({
    _id: i,
    name: `item ${i}`,
    active: true,
    books,
    authors
  });
}
describe("perf", () => {
  describe("aggregation", () => {
    it("elapsed time should be less than a 30 seconds", () => {
      console.time("AGGREGATE_PERF");
      aggregate(items, [
        {
          $match: {
            active: true
          }
        },
        {
          $project: {
            booksSize: {
              $size: "$books"
            },
            authorsSize: {
              $size: "$authors"
            }
          }
        },
        {
          $group: {
            _id: void 0,
            maxBooksCount: {
              $max: "$booksSize"
            },
            allBooksSum: {
              $sum: "$booksSize"
            },
            avgBooksCount: {
              $avg: "$booksSize"
            },
            maxAuthorsCount: {
              $max: "$authorsSize"
            },
            allAuthorsSum: {
              $sum: "$authorsSize"
            },
            avgAuthorsCount: {
              $avg: "$authorsSize"
            }
          }
        }
      ]);
      console.timeEnd("AGGREGATE_PERF");
    });
  });

  describe("sorting", () => {
    function makeid(length: number) {
      const text: string[] = [];
      const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < length; i++) {
        text.push(possible.charAt(Math.floor(Math.random() * possible.length)));
      }
      return text.join("");
    }

    const arrayToSort: string[] = [];
    for (let i = 0; i < 5000; i++) {
      arrayToSort.push(makeid(128));
    }

    const mingoSortLocale = new Aggregator([{ $sort: { number: 1 } }], {
      collation: { locale: "en", strength: 1 }
    });
    const mingoSort = new Aggregator([
      {
        $sort: {
          number: 1
        }
      }
    ]);

    const MINGO_SORT = "MINGO SORT";
    const MINGO_SORT_LOCALE = "MINGO SORT WITH LOCALE";
    const NATIVE_SORT = "NATIVE SORT";
    const NATIVE_SORT_LOCALE = "NATIVE SORT WITH LOCALE";

    it("should complete in less than 1 sec", () => {
      const measure = (
        cb: Callback<void, string[]>,
        data: string[],
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
      expect(
        measure(arr => mingoSort.run(arr), [...arrayToSort], MINGO_SORT)
      ).toBeLessThan(500);

      // with locale
      expect(
        measure(
          arr => mingoSortLocale.run(arr),
          [...arrayToSort],
          MINGO_SORT_LOCALE
        )
      ).toBeLessThan(500);

      // NATIVE code
      expect(
        measure(arr => arr.sort(), [...arrayToSort], NATIVE_SORT)
      ).toBeLessThan(500);

      // with locale
      expect(
        measure(
          arr => {
            arr.sort((a: string, b: string) => {
              const r = a.localeCompare(b, "en", {
                sensitivity: "base"
              });
              if (r < 0) return -1;
              if (r > 0) return 1;
              return 0;
            });
          },
          [...arrayToSort],
          NATIVE_SORT_LOCALE
        )
      ).toBeLessThan(500);
    });
  });
});

/* eslint-enable no-console */
