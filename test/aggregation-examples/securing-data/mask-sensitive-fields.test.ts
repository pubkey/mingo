import { aggregate } from "../../../src";
import { ISODate } from "../../support";

/**
 * You want to perform irreversible masking on the sensitive fields of a collection of credit card payments,
 * ready to provide the output data set to a 3rd party for analysis, without exposing sensitive information to the 3rd party.
 *
 * The specific changes that you need to make to the payments' fields are:
 *
 *  - Partially obfuscate the card holder's name.
 *  - Obfuscate the first 12 digits of the card's number, retaining only the final 4 digits.
 *  - Adjust the card's expiry date-time by adding or subtracting a random amount up to a maximum of 30 days (~1 month).
 *  - Replace the card's 3 digit security code with a random set of 3 digits.
 *  - Adjust the transaction's amount by adding or subtracting a random amount up to a maximum of 10% of the original amount.
 *  - Change the reported field's boolean value to the opposite value for roughly 20% of the records.
 *  - If the embedded customer_info sub-document's category field is set to RESTRICTED, exclude the whole customer_info sub-document.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/securing-data/mask-sensitive-fields.html}
 */
describe("Mask Sensitive Fields", () => {
  const payments = [
    {
      card_name: "Mrs. Jane A. Doe",
      card_num: "1234567890123456",
      card_expiry: ISODate("2023-08-31T23:59:59Z"),
      card_sec_code: "123",
      card_type: "CREDIT",
      transaction_id: "eb1bd77836e8713656d9bf2debba8900",
      transaction_date: ISODate("2021-01-13T09:32:07Z"),
      transaction_amount: 501.98,
      reported: false,
      customer_info: {
        category: "RESTRICTED",
        rating: 89,
        risk: 3
      }
    },
    {
      card_name: "Jim Smith",
      card_num: "9876543210987654",
      card_expiry: ISODate("2022-12-31T23:59:59Z"),
      card_sec_code: "987",
      card_type: "DEBIT",
      transaction_id: "634c416a6fbcf060bb0ba90c4ad94f60",
      transaction_date: ISODate("2020-11-24T19:25:57Z"),
      transaction_amount: 64.01,
      reported: true,
      customer_info: {
        category: "NORMAL",
        rating: 78,
        risk: 55
      }
    }
  ];
  const pipeline = [
    // Replace a subset of fields with new values
    {
      $set: {
        // Extract the last word from the name , eg: 'Doe' from 'Mrs. Jane A. Doe'
        card_name: { $regexFind: { input: "$card_name", regex: /(\S+)$/ } },

        // Mask card num 1st part retaining last 4 chars, eg: '1234567890123456' -> 'XXXXXXXXXXXX3456'
        card_num: {
          $concat: ["XXXXXXXXXXXX", { $substrCP: ["$card_num", 12, 4] }]
        },

        // Add/subtract a random time amount of a maximum of 30 days (~1 month) each-way
        card_expiry: {
          $add: [
            "$card_expiry",
            {
              $floor: {
                $multiply: [
                  { $subtract: [{ $rand: {} }, 0.5] },
                  2 * 30 * 24 * 60 * 60 * 1000
                ]
              }
            }
          ]
        },

        // Replace each digit with random digit, eg: '133' -> '472'
        card_sec_code: {
          $concat: [
            { $toString: { $floor: { $multiply: [{ $rand: {} }, 10] } } },
            { $toString: { $floor: { $multiply: [{ $rand: {} }, 10] } } },
            { $toString: { $floor: { $multiply: [{ $rand: {} }, 10] } } }
          ]
        },

        // Add/subtract a random percent of the amount's value up to 10% maximum each-way
        transaction_amount: {
          $add: [
            "$transaction_amount",
            {
              $multiply: [
                { $subtract: [{ $rand: {} }, 0.5] },
                0.2,
                "$transaction_amount"
              ]
            }
          ]
        },

        // Retain field's bool value 80% of time on average, setting to the opposite value 20% of time
        reported: {
          $cond: {
            if: { $lte: [{ $rand: {} }, 0.8] },
            then: "$reported",
            else: { $not: ["$reported"] }
          }
        },

        // Exclude sub-doc if the sub-doc's category field's value is 'RESTRICTED'
        customer_info: {
          $cond: {
            if: { $eq: ["$customer_info.category", "RESTRICTED"] },
            then: "$$REMOVE",
            else: "$customer_info"
          }
        },

        // Mark _id field to excluded from results
        _id: "$$REMOVE"
      }
    },

    // Take regex matched last word from the card name and prefix it with hardcoded value
    {
      $set: {
        card_name: {
          $concat: ["Mx. Xxx ", { $ifNull: ["$card_name.match", "Anonymous"] }]
        }
      }
    }
  ];

  it("return documents corresponding to the original two source documents, but this time with many of their fields redacted and obfuscated, plus the customer_info embedded document omitted for one record due to it having been marked as RESTRICTED", () => {
    const result = aggregate(payments, pipeline);
    expect(result).toHaveLength(2);

    expect(result[0]["card_num"]).toEqual("XXXXXXXXXXXX3456");
    expect(result[0]["card_sec_code"]).not.toEqual("123");

    expect(result[1]["card_num"]).toEqual("XXXXXXXXXXXX7654");
    expect(result[1]["card_sec_code"]).not.toEqual("987");
  });
});
