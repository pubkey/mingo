import { aggregate, ISODate } from "../../support";

/**
 *
 * An application is ingesting payment documents into a MongoDB collection where each document's payment date field contains a string looking vaguely like a date-time, such as "01-JAN-20 01.01.01.123000000".
 * You want to convert each payment date into a valid BSON date type when aggregating the payments. However, the payment date fields do not contain all the information required for you to determine the exact date-time accurately.
 * Therefore you cannot use just the MongoDB's {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/#date-expression-operators | Date Operator Expressions} directly to perform the text-to-date conversion. Each of these text fields is missing the following information:
 *
 *   - The specific century (1900s?, 2000s, other?)
 *   - The specific time-zone (GMT?, IST?, PST?, other?)
 *   - The specific language that the three-letter month abbreviation represents (is "JAN" in French? in English? other?)
 *
 * You subsequently learn that all the payment records are for the 21st century only, the time-zone used when ingesting the data is UTC, and the language used is English.
 * Armed with this information, you build an aggregation pipeline to transform these text fields into date fields.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/type-convert/convert-incomplete-dates.html}
 */
describe("Convert Incomplete Date Strings", () => {
  const payments = [
    {
      account: "010101",
      paymentDate: "01-JAN-20 01.01.01.123000000",
      amount: 1.01
    },
    {
      account: "020202",
      paymentDate: "02-FEB-20 02.02.02.456000000",
      amount: 2.02
    },
    {
      account: "030303",
      paymentDate: "03-MAR-20 03.03.03.789000000",
      amount: 3.03
    },
    {
      account: "040404",
      paymentDate: "04-APR-20 04.04.04.012000000",
      amount: 4.04
    },
    {
      account: "050505",
      paymentDate: "05-MAY-20 05.05.05.345000000",
      amount: 5.05
    },
    {
      account: "060606",
      paymentDate: "06-JUN-20 06.06.06.678000000",
      amount: 6.06
    },
    {
      account: "070707",
      paymentDate: "07-JUL-20 07.07.07.901000000",
      amount: 7.07
    },
    {
      account: "080808",
      paymentDate: "08-AUG-20 08.08.08.234000000",
      amount: 8.08
    },
    {
      account: "090909",
      paymentDate: "09-SEP-20 09.09.09.567000000",
      amount: 9.09
    },
    {
      account: "101010",
      paymentDate: "10-OCT-20 10.10.10.890000000",
      amount: 10.1
    },
    {
      account: "111111",
      paymentDate: "11-NOV-20 11.11.11.111000000",
      amount: 11.11
    },
    {
      account: "121212",
      paymentDate: "12-DEC-20 12.12.12.999000000",
      amount: 12.12
    }
  ];

  const pipeline = [
    // Change field from a string to a date, filling in the gaps
    {
      $set: {
        paymentDate: {
          $let: {
            vars: {
              txt: "$paymentDate", // Assign "paymentDate" field to variable "txt",
              month: { $substrCP: ["$paymentDate", 3, 3] } // Extract month text
            },
            in: {
              $dateFromString: {
                format: "%d-%m-%Y %H.%M.%S.%L",
                dateString: {
                  $concat: [
                    { $substrCP: ["$$txt", 0, 3] }, // Use 1st 3 chars in string
                    {
                      $switch: {
                        branches: [
                          // Replace month 3 chars with month number
                          { case: { $eq: ["$$month", "JAN"] }, then: "01" },
                          { case: { $eq: ["$$month", "FEB"] }, then: "02" },
                          { case: { $eq: ["$$month", "MAR"] }, then: "03" },
                          { case: { $eq: ["$$month", "APR"] }, then: "04" },
                          { case: { $eq: ["$$month", "MAY"] }, then: "05" },
                          { case: { $eq: ["$$month", "JUN"] }, then: "06" },
                          { case: { $eq: ["$$month", "JUL"] }, then: "07" },
                          { case: { $eq: ["$$month", "AUG"] }, then: "08" },
                          { case: { $eq: ["$$month", "SEP"] }, then: "09" },
                          { case: { $eq: ["$$month", "OCT"] }, then: "10" },
                          { case: { $eq: ["$$month", "NOV"] }, then: "11" },
                          { case: { $eq: ["$$month", "DEC"] }, then: "12" }
                        ],
                        default: "ERROR"
                      }
                    },
                    "-20", // Add hyphen + hardcoded century 2 digits
                    { $substrCP: ["$$txt", 7, 15] } // Use time up to 3 millis (ignore last 6 nanosecs)
                  ]
                }
              }
            }
          }
        }
      }
    },

    // Omit unwanted fields
    { $unset: ["_id"] }
  ];

  it("returns twelve documents should be returned, corresponding to the original twelve source documents, but this time with the paymentDate field converted from text values to proper date typed values", () => {
    expect(aggregate(payments, pipeline)).toEqual([
      {
        account: "010101",
        paymentDate: ISODate("2020-01-01T01:01:01.123Z"),
        amount: 1.01
      },
      {
        account: "020202",
        paymentDate: ISODate("2020-02-02T02:02:02.456Z"),
        amount: 2.02
      },
      {
        account: "030303",
        paymentDate: ISODate("2020-03-03T03:03:03.789Z"),
        amount: 3.03
      },
      {
        account: "040404",
        paymentDate: ISODate("2020-04-04T04:04:04.012Z"),
        amount: 4.04
      },
      {
        account: "050505",
        paymentDate: ISODate("2020-05-05T05:05:05.345Z"),
        amount: 5.05
      },
      {
        account: "060606",
        paymentDate: ISODate("2020-06-06T06:06:06.678Z"),
        amount: 6.06
      },
      {
        account: "070707",
        paymentDate: ISODate("2020-07-07T07:07:07.901Z"),
        amount: 7.07
      },
      {
        account: "080808",
        paymentDate: ISODate("2020-08-08T08:08:08.234Z"),
        amount: 8.08
      },
      {
        account: "090909",
        paymentDate: ISODate("2020-09-09T09:09:09.567Z"),
        amount: 9.09
      },
      {
        account: "101010",
        paymentDate: ISODate("2020-10-10T10:10:10.890Z"),
        amount: 10.1
      },
      {
        account: "111111",
        paymentDate: ISODate("2020-11-11T11:11:11.111Z"),
        amount: 11.11
      },
      {
        account: "121212",
        paymentDate: ISODate("2020-12-12T12:12:12.999Z"),
        amount: 12.12
      }
    ]);
  });
});
