import { runTest, testPath } from "../../../support";

runTest(testPath(__filename), {
  $range: [
    [[0], Error("expects array(3) of numbers")],
    [[0], Error("expects array(3) of numbers"), { failOnError: false }],
    [[0, "1"], Error("expressions must resolve to numbers")],
    [[0, "1"], null, { failOnError: false }],
    [
      [0, 10, 2],
      [0, 2, 4, 6, 8]
    ],
    [
      [10, 0, -2],
      [10, 8, 6, 4, 2]
    ],
    [[0, 10, -2], []],
    [
      [0, 5],
      [0, 1, 2, 3, 4]
    ]
  ]
});
