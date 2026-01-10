import { runTest, testPath } from "../../../support";

runTest(testPath(__filename), {
  $size: [
    [null, null],
    ["invalid", Error("expression must resolve to number")],
    ["invalid", null, { failOnError: false }],
    [["a", "b", "c"], 3],
    [[10], 1],
    [[], 0]
  ]
});
