import { runTest, testPath } from "../../support";

runTest(testPath(__filename), {
  $min: [
    [[], null],
    [[3, null, 2, 1], 1],
    [["as", 0], 0],
    [[1, "as"], 1]
  ]
});
