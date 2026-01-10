import * as support from "../../../support";

support.runTest(support.testPath(__filename), {
  $arrayElemAt: [
    [[], Error()],
    [[[], "2"], Error()],
    [[[], "2"], null, { failOnError: false }],
    [[[1, 2, 3], 0], 1],
    [[[1, 2, 3], -2], 2],
    [[[1, 2, 3], 15], undefined]
  ]
});
