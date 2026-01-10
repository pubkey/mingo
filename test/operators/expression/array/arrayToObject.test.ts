import * as support from "../../../support";

support.runTest(support.testPath(__filename), {
  $arrayToObject: [
    // nil input
    [null, null],
    // invalid input
    [[1, 2, 3], Error("expects an array with exclusively")],
    [
      [
        ["a", 1],
        ["b", 2]
      ],
      { a: 1, b: 2 }
    ],
    [
      [
        { k: "a", v: 1 },
        { k: "b", v: 2 }
      ],
      { a: 1, b: 2 }
    ],
    [[{ k: "a", v: 1 }, ["b", 2]], Error()],
    [[{ k: "a", v: 1 }, ["b", 2]], null, { failOnError: false }],
    [
      {
        $arrayToObject: {
          $literal: [
            { k: "item", v: "abc123" },
            { k: "qty", v: 25 }
          ]
        }
      },
      { item: "abc123", qty: 25 }
    ],
    [
      {
        $arrayToObject: {
          $literal: [
            ["item", "abc123"],
            ["qty", 25]
          ]
        }
      },
      { item: "abc123", qty: 25 }
    ]
  ]
});
