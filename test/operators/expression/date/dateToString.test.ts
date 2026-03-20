import { isDST } from "../../../../src/operators/expression/date/_internal";
import { runTest, testPath } from "../../../support";

const date = new Date("2014-01-01T08:15:39.736Z");

runTest(testPath(__filename), {
  $dateToString: [
    [
      {
        date: new Date("2021-01-28T13:05:30.257Z"),
        format: "%Y/%m/%d %H:%M:%S.%L%z isoDayOfWeek=%u isoWeek=%V"
      },
      "2021/01/28 13:05:30.257+0000 isoDayOfWeek=4 isoWeek=04"
    ],

    // edge case for weeks when first day of month is not a Sunday.
    [
      {
        date: new Date("2021-01-01T12:05:30.257Z"),
        format: "isoDayOfWeek=%u, week=%U, isoWeek=%V"
      },
      "isoDayOfWeek=5, week=00, isoWeek=53"
    ],

    // yearMonthDayUTC
    [{ format: "%Y-%m-%d", date }, "2014-01-01"],

    // timewithOffsetNY
    [
      {
        format: "%H:%M:%S:%L%z",
        date,
        timezone: "America/New_York"
      },
      isDST(date) ? "04:15:39:736-0400" : "03:15:39:736-0500"
    ],

    // timewithOffset430
    [
      { format: "%H:%M:%S:%L%z", date, timezone: "+04:30" },
      "12:45:39:736+0430"
    ],

    // minutesOffsetNY
    [
      { format: "%Z", date, timezone: "America/New_York" },
      isDST(date) ? "-240" : "-300"
    ],

    // minutesOffset430
    [{ format: "%Z", date, timezone: "+04:30" }, "270"],

    // abbreviated_month
    [{ format: "%b", date, timezone: "+04:30" }, "Jan"],

    // full_month
    [{ format: "%B", date, timezone: "+04:30" }, "January"],

    // day_of_year
    [{ format: "%j", date }, "001"],
    [{ format: "%j", date: new Date("2023-02-08T12:00:00Z") }, "039"],

    // day of week (0-6) - wednesday (3)
    [{ format: "%w", date }, "3"],

    // isoDayOfWeek on Sunday (%u returns 7 for Sunday via || 7 branch)
    [
      {
        date: new Date("2021-01-03T12:00:00Z"), // 2021-01-03 is a Sunday
        format: "%u"
      },
      "7"
    ],

    // onNull: return onNull when date is null
    [{ date: null, onNull: "N/A" }, "N/A"],

    // format with no format specifiers returns the string as-is
    [{ date, format: "plain text no specifiers" }, "plain text no specifiers"],

    // timezone "UTC" triggers parseTimezone fallback (non-Olson, non-offset format)
    [{ format: "%H:%M:%S%z", date, timezone: "UTC" }, "08:15:39+0000"],

    // default format (no format specified) uses DATE_FORMAT: "%Y-%m-%dT%H:%M:%S.%LZ"
    [
      { date: new Date("2021-01-01T12:00:00.000Z") },
      "2021-01-01T12:00:00.000Z"
    ],

    // isoWeek overflow: Dec 31, 2018 belongs to ISO week 1 of 2019
    [
      {
        date: new Date("2018-12-31T12:00:00Z"),
        format: "isoWeek=%V"
      },
      "isoWeek=01"
    ],

    // weekOfYear (%U) on a Sunday (getUTCDay() == 0) returns result + 1
    [
      {
        date: new Date("2021-01-03T12:00:00Z"), // Sunday
        format: "week=%U"
      },
      "week=54"
    ]
  ]
});
