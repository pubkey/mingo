import { runTest } from "../../support";

const skipError = { failOnError: false };

runTest("operators/expression/arithmetic", {
  $abs: [
    [null, null],
    [-1, 1],
    [1, 1],
    [NaN, NaN],
    ["invalid", Error()],
    ["invalid", null, skipError]
  ],
  $add: [
    ["invalid", Error()],
    [null, null, skipError],
    [[null, 0], null],
    // error: multiple dates
    [[1, new Date(), new Date()], Error("must only have one date")],
    [[], 0],
    [[10, 2], 12],
    [[-1, 5], 4],
    [[-3, -7], -10],
    [[new Date("2017-10-10"), 2592e5], new Date("2017-10-13")],
    [[-3, "10"], Error()],
    [[-3, "10"], null, skipError]
  ],
  $ceil: [
    [NaN, NaN],
    [null, null],
    ["invalid", Error()],
    ["invalid", null, skipError],
    [1, 1],
    [7.8, 8],
    [-2.8, -2]
  ],
  $divide: [
    ["invalid", Error()],
    [[80, null], null],
    [[80, "nan"], Error()],
    [[80, "nan"], null, skipError],
    [[80, 4], 20],
    [[1.5, 3], 0.5],
    [[40, 8], 5],
    [[40, 0], Error()],
    [[40, 0], null, skipError],
    [[40, "string"], Error()],
    [[40, "string"], null, skipError]
  ],
  $exp: [
    ["invalid", Error()],
    ["invalid", Error(), skipError],
    [{ $exp: 0 }, 1],
    [{ $round: [{ $exp: 2 }, 10] }, 7.3890560989], // applied rounding to survive different v8 versions
    [{ $round: [{ $exp: -2 }, 10] }, 0.1353352832],
    [{ $exp: NaN }, NaN],
    [{ $exp: undefined }, null]
  ],
  $floor: [
    ["invalid", Error()],
    ["invalid", null, skipError],
    [NaN, NaN],
    [undefined, null],
    [1, 1],
    [7.8, 7],
    [-2.8, -3]
  ],
  $ln: [
    ["invalid", Error()],
    ["invalid", null, skipError],
    [NaN, NaN],
    [undefined, null],
    [1, 0],
    [Math.E, 1],
    [10, 2.302585092994046]
  ],
  $log: [
    ["invalid", Error()],
    ["invalid", null, skipError],
    [[NaN, 1], NaN],
    [[undefined, 2], null],
    [[100, 10], 2],
    [[100, Math.E], 4.605170185988092]
  ],
  $log10: [
    ["invalid", Error()],
    ["invalid", null, skipError],
    [NaN, NaN],
    [undefined, null],
    [1, 0],
    [10, 1],
    [100, 2],
    [1000, 3]
  ],
  $mod: [
    ["invalid", Error()],
    [["invalid", 9], Error()],
    [[], Error()],
    [["invalid", 9], null, skipError],
    [[80, 7], 3],
    [[40, 4], 0]
  ],
  $multiply: [
    ["invalid", Error()],
    [["invalid", 9], Error()],
    [["invalid", 9, null], null],
    [["invalid", 9], null, skipError],
    [[1, 9, null], null], // null if any operand is null
    [[], 1],
    [[5, 10], 50],
    [[-2, 4], -8],
    [[-3, -3], 9]
  ],
  $pow: [
    ["invalid", Error()],
    [["invalid", 9], Error()],
    [["invalid", 9], null, skipError],
    [["invalid", null], null],
    [[0, -1], Error()],
    [[5, 0], 1],
    [[5, 2], 25],
    [[5, -2], 0.04],
    [[-5, 0.5], NaN]
  ],
  $round: [
    ["invalid", Error()],
    ["invalid", Error()],
    [["invalid", 9], Error()],
    [["invalid", 9], null, skipError],
    [[0.123, -21], Error("precision must be in range")],
    [[10.5], 10],
    [[10.5, 0], 10],
    [[11.5, 0], 12],
    [[12.5, 0], 12],
    [[13.5, 0], 14],
    // rounded to the first decimal place
    [[19.25, 1], 19.2],
    [[28.73, 1], 28.7],
    [[34.32, 1], 34.3],
    [[-45.39, 1], -45.4],
    // rounded using the first digit to the left of the decimal
    [[19.25, -1], 10],
    [[28.73, -1], 20],
    [[34.32, -1], 30],
    [[-45.39, -1], -50],
    [[-1234567.8912, -3], -1.235e6],
    [[1234, -2], 1200],
    // rounded to the whole integer
    [[19.25], 19],
    [[28.73], 29],
    [[34.32], 34],
    [[-45.39], -45],
    [[10.4], 10],
    [[10.6], 11],
    [[10.7], 11],
    [[11.4], 11],
    [[11.9], 12],
    [[19.25, 0], 19],
    [[28.73, 0], 29],
    [[34.32, 0], 34],
    [[-45.39, 0], -45],
    [[1.6016, 3], 1.602],
    [[1.6015, 3], 1.601],
    [[10.4, 0], 10],
    [[10.6, 0], 11],
    [[10.7, 0], 11],
    [[11.4, 0], 11],
    [[11.9, 0], 12]
  ],
  $sigmoid: [
    ["invalid", Error()],
    ["invalid", null, skipError],
    [undefined, null],
    [null, null],
    [{ input: "$invalid", onNull: 10 }, 10],
    [1, 0.7310585786],
    [5, 0.9933071491],
    [13, 0.9999977397],
    [21, 0.9999999992],
    // input is null
    [{ input: null, onNull: 0 }, 0],
    [{ input: null }, null]
  ],
  $sqrt: [
    ["invalid", Error()],
    ["invalid", null, skipError],
    [-1, Error()],
    [-1, null, skipError],
    [null, null],
    [NaN, NaN],
    [25, 5],
    [30, 5.477225575051661]
  ],
  $subtract: [
    ["invalid", Error()],
    [["invalid", 9], Error()],
    [["invalid", 9], null, skipError],
    [[null, 9], null],
    [[-1, -1], 0],
    [[-1, 2], -3],
    [[2, -1], 3],
    // <date> - <date>
    [
      [new Date("2000-10-10T00:00:00Z"), new Date("2000-10-09T23:00:00Z")],
      36e5
    ],
    // <date> - <number>
    [
      [new Date("2000-10-10T00:00:00Z"), 36e5],
      new Date("2000-10-09T23:00:00Z")
    ],
    // <number> - <date> is invalid
    [
      [36e5, new Date("2000-10-10T00:00:00Z")],
      Error("cannot subtract date from number")
    ]
  ],
  $trunc: [
    ["invalid", Error()],
    ["invalid", Error(), skipError],
    [["invalid", 9], Error()],
    [["invalid", 9], null, skipError],
    [[NaN, 0], NaN],
    [[null, 0], null],
    [[NaN, 1], NaN],
    [[null, 1], null],
    [[Infinity, 1], Infinity],
    [[-Infinity, 1], -Infinity],
    [[0, 0], 0],
    // truncate to the first decimal place
    [[19.25, 1], 19.2],
    [[28.73, 1], 28.7],
    [[34.32, 1], 34.3],
    [[-45.39, 1], -45.3],
    // truncated to the first place
    [[19.25, -1], 10],
    [[28.73, -1], 20],
    [[34.32, -1], 30],
    [[-45.39, -1], -40],
    // truncate to the whole integer
    [[19.25], 19],
    [[28.73], 28],
    [[34.32], 34],
    [[-45.39], -45],
    [[19.25, 0], 19],
    [[28.73, 0], 28],
    [[34.32, 0], 34],
    [[-45.39, 0], -45]
  ]
});
