import * as support from "../../../support";

support.runTest(support.testPath(__filename), {
  $filter: [
    ["invalid", null], // no validation for argument structure.
    [{ input: "invalid" }, Error()],
    [{ input: "invalid" }, null, { failOnError: false }],
    [{ input: null }, null],
    [
      {
        input: [
          "string",
          "",
          1,
          0,
          1.5,
          NaN,
          undefined,
          null,
          true,
          false,
          [],
          {}
        ],
        as: "item",
        cond: "$$item"
      },
      ["string", "", 1, 1.5, true, [], {}]
    ]
  ]
});
