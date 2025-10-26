import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { AnyObject } from "../../../types";
import { assert, isDate, isNil } from "../../../util";
import {
  adjustDate,
  dateAdd,
  dateDiffDay,
  dateDiffMonth,
  dateDiffQuarter,
  dateDiffWeek,
  dateDiffYear,
  DayOfWeek,
  DAYS_PER_WEEK,
  isoWeekday,
  parseTimezone,
  TIME_UNITS,
  TimeUnit,
  TIMEUNIT_IN_MILLIS
} from "./_internal";

// 2000-01-01T00:00:00Z - The reference date
const REF_DATE_MILLIS = 946684800000;

/**
 * Determines a distance of 'value' to the lower bound of a bin 'value' falls into. It assumes that
 * there is a set of bins with following bounds .., [-'binSize', 0), [0, 'binSize'), ['binSize', 2*'binSize'), ...
 *
 * binSize - bin size. Must be greater than 0.
 *
 * See {@link https://github.com/mongodb/mongo/blob/master/src/mongo/db/query/datetime/date_time_support.cpp#L1108}
 */
const distanceToBinLowerBound = (value: number, binSize: number): number => {
  let remainder = value % binSize;
  if (remainder < 0) {
    remainder += binSize;
  }
  return remainder;
};

const DATE_DIFF_FN = {
  day: dateDiffDay,
  month: dateDiffMonth,
  quarter: dateDiffQuarter,
  year: dateDiffYear
};

interface InputExpr {
  date: Date;
  unit: TimeUnit;
  binSize?: number;
  timezone?: string;
  startOfWeek?: DayOfWeek;
}

const DAYS_OF_WEEK_RE =
  /(mon(day)?|tue(sday)?|wed(nesday)?|thu(rsday)?|fri(day)?|sat(urday)?|sun(day)?)/i;

/**
 * Truncates a date.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/dateTrunc/}
 *
 * @param obj
 * @param expr
 * @param options
 * @returns
 */
export const $dateTrunc: ExpressionOperator<Date> = (
  obj: AnyObject,
  expr: InputExpr,
  options: Options
): Date => {
  const {
    date,
    unit,
    binSize: optBinSize,
    timezone,
    startOfWeek: optStartOfWeek
  } = computeValue(obj, expr, null, options) as InputExpr;

  // if any of the required input fields except startOfWeek is missing or set to null
  if (isNil(date) || isNil(unit)) return null;

  const startOfWeek = (optStartOfWeek ?? "sun")
    .toLowerCase()
    .substring(0, 3) as DayOfWeek;

  assert(
    isDate(date),
    "$dateTrunc: 'date' must resolve to a valid Date object."
  );
  assert(TIME_UNITS.includes(unit), "$dateTrunc: unit is invalid.");
  assert(
    unit != "week" || DAYS_OF_WEEK_RE.test(startOfWeek),
    `$dateTrunc: startOfWeek '${startOfWeek}' is not a valid.`
  );
  assert(
    isNil(optBinSize) || optBinSize > 0,
    "$dateTrunc requires 'binSize' to be greater than 0, but got value 0."
  );

  // default to 1 if nil.
  const binSize = optBinSize ?? 1;

  // Based on algorithm described in MongoDB.
  // https://github.com/mongodb/mongo/blob/master/src/mongo/db/query/datetime/date_time_support.cpp#L1418
  switch (unit) {
    case "millisecond":
    case "second":
    case "minute":
    case "hour": {
      const binSizeMillis = binSize * TIMEUNIT_IN_MILLIS[unit];
      const shiftedDate = date.getTime() - REF_DATE_MILLIS;
      return new Date(
        date.getTime() - distanceToBinLowerBound(shiftedDate, binSizeMillis)
      );
    }
    default: {
      assert(binSize <= 100000000000, "dateTrunc unsupported binSize value");

      const d = new Date(date);
      const refPointDate = new Date(REF_DATE_MILLIS);
      let distanceFromRefPoint = 0;

      if (unit == "week") {
        const refPointDayOfWeek = isoWeekday(refPointDate, startOfWeek);
        const daysToAdjustBy =
          (DAYS_PER_WEEK - refPointDayOfWeek) % DAYS_PER_WEEK;
        // If the reference point was an arbitrary value, we would need to use 'dateAdd()' function
        // to correctly add a number of days to account for Daylight Saving Time (DST) transitions
        // that may happen between the initial reference point and the resulting date (DST has a
        // different offset from UTC than Standard Time). However, since the reference point is the
        // first of January, 2000 and Daylight Saving Time transitions did not happen in the first
        // half of January in year 2000, it is correct to just add a number of milliseconds in
        // 'daysToAdjustBy' days.
        refPointDate.setTime(
          refPointDate.getTime() + daysToAdjustBy * TIMEUNIT_IN_MILLIS.day
        );
        distanceFromRefPoint = dateDiffWeek(refPointDate, d, startOfWeek);
      } else {
        distanceFromRefPoint = DATE_DIFF_FN[unit](refPointDate, d);
      }

      // Determine a distance of the lower bound of a bin 'date' falls into from the reference point.
      const binLowerBoundFromRefPoint =
        distanceFromRefPoint -
        distanceToBinLowerBound(distanceFromRefPoint, binSize);

      const newDate = dateAdd(
        refPointDate,
        unit,
        binLowerBoundFromRefPoint,
        timezone
      );
      const minuteOffset = parseTimezone(timezone);
      adjustDate(newDate, -minuteOffset);
      return newDate;
    }
  }
};
