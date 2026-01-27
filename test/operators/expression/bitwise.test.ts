import { runTest } from "../../support";

runTest("operators/expression/boolean", {
  $bitAnd: [
    ["not array", Error("expects array as argument")],
    [[1, "invalid"], Error("must resolve to integers")],
    [[1, "invalid"], null, { failOnError: false }],
    [[], -1],
    [[2, null], null],
    [[0, 127], 0],
    [[2, 3], 2],
    [[3, 5], 1]
  ],
  $bitNot: [
    [null, null],
    ["bad", Error("resolve to integer")],
    [0, -1],
    [2, -3],
    [3, -4]
  ],
  $bitOr: [
    [[], 0],
    [[2, null], null],
    [[0, 127], 127],
    [[2, 3], 3],
    [[3, 5], 7]
  ],
  $bitXor: [
    [[], 0],
    [[2, null], null],
    [[0, 127], 127],
    [[2, 3], 1],
    [[3, 5], 6]
  ]
});
