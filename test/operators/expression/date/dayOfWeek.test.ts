import { runTest, testPath } from "../../../support";

const fixtures: [number | null, string, string?][] = [
  // [<Results>, <Args>,...]
  // [<result>, date, ?timezone]
  [6, "2016-01-01T00:00:00Z"],
  [3, "2003-01-07T00:00:00Z"],
  [1, "2011-08-14T00:00:00Z"],
  [7, "2011-08-14T00:00:00Z", "America/Chicago"],
  [7, "1998-11-07T00:00:00Z"],
  [6, "1998-11-07T00:00:00Z", "-0400"]
] as const;

runTest(testPath(__filename), {
  $dayOfWeek: [
    ...fixtures.map(([result, date, timezone]) => [
      {
        date: new Date(date),
        timezone
      },
      result
    ]),
    // computeDate line 263: numeric timestamp (seconds since epoch)
    // 1451606400 = 2016-01-01T00:00:00Z → dayOfWeek = 6 (Friday)
    ["$ts", 6, { obj: { ts: 1451606400 } }],
    // computeDate line 267: { date: <number>, timezone } where date is seconds
    [{ date: 1451606400, timezone: "+00:00" }, 6]
  ]
});
