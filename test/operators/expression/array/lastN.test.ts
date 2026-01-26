import { runTest, testPath } from "../../../support";

runTest(testPath(__filename), {
  $lastN: [
    ["invalid", Error("expects object")],
    [{ input: null, n: 2 }, null],
    [{ input: "not array", n: 2 }, Error("resolve to array")],
    [{ input: "not array", n: 2 }, null, { failOnError: false }],
    [{ input: [1, 2, 3], n: -2 }, Error("resolve to positive integer")],
    [{ input: [1, 2, 3], n: -2 }, null, { failOnError: false }],
    [{ input: [1, 2, 3], n: 2 }, [2, 3]]
  ]
});
