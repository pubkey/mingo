import { expect } from "vitest";

import { Any, AnyObject } from "../../../src/types";
import { runTestPipeline } from "../../support";

const output: Record<string, AnyObject[]> = {
  first: [],
  second: []
};
const result = [
  { _id: "Dante", books: ["The Banquet", "Divine Comedy", "Eclogues"] },
  { _id: "Homer", books: ["The Odyssey", "Iliad"] }
];

runTestPipeline("operators/pipeline/out", [
  {
    message: "can apply $out operator with resolver",
    pipeline: [
      { $group: { _id: "$author", books: { $push: "$title" } } },
      { $out: "first" }
    ],
    options: {
      collectionResolver: (s: string) => output[s]
    },
    input: [
      { _id: 8751, title: "The Banquet", author: "Dante", copies: 2 },
      { _id: 8752, title: "Divine Comedy", author: "Dante", copies: 1 },
      { _id: 8645, title: "Eclogues", author: "Dante", copies: 2 },
      { _id: 7000, title: "The Odyssey", author: "Homer", copies: 10 },
      { _id: 7020, title: "Iliad", author: "Homer", copies: 10 }
    ],
    expected: (actual: Any) => {
      expect(actual).toEqual(result);
      expect(output.first).toEqual(result);
    }
  },
  {
    message: "can apply $out operator with reference",
    pipeline: [
      { $group: { _id: "$author", books: { $push: "$title" } } },
      { $out: output.second }
    ],
    input: [
      { _id: 8751, title: "The Banquet", author: "Dante", copies: 2 },
      { _id: 8752, title: "Divine Comedy", author: "Dante", copies: 1 },
      { _id: 8645, title: "Eclogues", author: "Dante", copies: 2 },
      { _id: 7000, title: "The Odyssey", author: "Homer", copies: 10 },
      { _id: 7020, title: "Iliad", author: "Homer", copies: 10 }
    ],
    expected: (actual: Any) => {
      expect(actual).toEqual(result);
      expect(output.second).toEqual(result);
    }
  }
]);
