import * as support from "../../../support";

support.runTest(support.testPath(__filename), {
  $isArray: [
    [[], Error()],
    [[1, 2], Error()],
    [["hello"], false],
    [[[]], true],
    [[["hello"]], true],
    ["bad", false],
    ["$arr", true, { obj: { arr: [] } }],
    [["$arr"], true, { obj: { arr: [] } }],
    [["$arr"], false, { obj: { arr: 1 } }]
  ]
});
