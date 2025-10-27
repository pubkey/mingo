import { aggregate, find } from "../../../src";
import { ISODate } from "../../support";

/**
 * You have a user management system containing data about various people in a database, and you need to ensure a particular client application cannot view the sensitive parts of the data relating to each person.
 * Consequently, you will provide a read-only view of peoples' data. You will use the view (named adults) to redact the personal data and expose this view to the client application as the only way it can access personal information.
 * The view will apply the following two rules to restrict what data can be accessed:
 *
 *  1. Only show people aged 18 and over (by checking each person's dateofbirth field)
 *  2. Exclude each person's social_security_num field from results
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/securing-data/redacted-view.html}
 */
describe("Redacted View", () => {
  const persons = [
    {
      person_id: "6392529400",
      firstname: "Elise",
      lastname: "Smith",
      dateofbirth: ISODate("1972-01-13T09:32:07Z"),
      gender: "FEMALE",
      email: "elise_smith@myemail.com",
      social_security_num: "507-28-9805",
      address: {
        number: 5625,
        street: "Tipa Circle",
        city: "Wojzinmoj"
      }
    },
    {
      person_id: "1723338115",
      firstname: "Olive",
      lastname: "Ranieri",
      dateofbirth: ISODate("1985-05-12T23:14:30Z"),
      gender: "FEMALE",
      email: "oranieri@warmmail.com",
      social_security_num: "618-71-2912",
      address: {
        number: 9303,
        street: "Mele Circle",
        city: "Tobihbo"
      }
    },
    {
      person_id: "8732762874",
      firstname: "Toni",
      lastname: "Jones",
      dateofbirth: ISODate("2014-11-23T16:53:56Z"),
      gender: "FEMALE",
      email: "tj@wheresmyemail.com",
      social_security_num: "001-10-3488",
      address: {
        number: 1,
        street: "High Street",
        city: "Upper Abbeywoodington"
      }
    },
    {
      person_id: "7363629563",
      firstname: "Bert",
      lastname: "Gooding",
      dateofbirth: ISODate("1941-04-07T22:11:52Z"),
      gender: "MALE",
      email: "bgooding@tepidmail.com",
      social_security_num: "230-43-7633",
      address: {
        number: 13,
        street: "Upper Bold Road",
        city: "Redringtonville"
      }
    },
    {
      person_id: "1029648329",
      firstname: "Sophie",
      lastname: "Celements",
      dateofbirth: ISODate("2013-07-06T17:35:45Z"),
      gender: "FEMALE",
      email: "sophe@celements.net",
      social_security_num: "377-30-5364",
      address: {
        number: 5,
        street: "Innings Close",
        city: "Basilbridge"
      }
    }
  ];

  const pipeline = [
    // Filter out any persons aged under 18 ($expr required to reference '$$NOW')
    {
      $match: {
        $expr: {
          $lt: [
            "$dateofbirth",
            { $subtract: ["$$NOW", 568036800000 /*18years*/] }
          ]
        }
      }
    },

    // Exclude fields to be filtered out by the view
    { $unset: ["_id", "social_security_num"] }
  ];

  const data = aggregate(persons, pipeline);

  it("returns three documents, representing the three persons who are over 18 but not showing their social security numbers", () => {
    expect(find(data, {}, {}).all()).toEqual([
      {
        person_id: "6392529400",
        firstname: "Elise",
        lastname: "Smith",
        dateofbirth: ISODate("1972-01-13T09:32:07.000Z"),
        gender: "FEMALE",
        email: "elise_smith@myemail.com",
        address: { number: 5625, street: "Tipa Circle", city: "Wojzinmoj" }
      },
      {
        person_id: "1723338115",
        firstname: "Olive",
        lastname: "Ranieri",
        dateofbirth: ISODate("1985-05-12T23:14:30.000Z"),
        gender: "FEMALE",
        email: "oranieri@warmmail.com",
        address: { number: 9303, street: "Mele Circle", city: "Tobihbo" }
      },
      {
        person_id: "7363629563",
        firstname: "Bert",
        lastname: "Gooding",
        dateofbirth: ISODate("1941-04-07T22:11:52.000Z"),
        gender: "MALE",
        email: "bgooding@tepidmail.com",
        address: {
          number: 13,
          street: "Upper Bold Road",
          city: "Redringtonville"
        }
      }
    ]);
  });

  it("returns two females records only because the male record has been excluded", () => {
    expect(find(data, { gender: "FEMALE" }, {}).all()).toEqual([
      {
        person_id: "6392529400",
        firstname: "Elise",
        lastname: "Smith",
        dateofbirth: ISODate("1972-01-13T09:32:07.000Z"),
        gender: "FEMALE",
        email: "elise_smith@myemail.com",
        address: { number: 5625, street: "Tipa Circle", city: "Wojzinmoj" }
      },
      {
        person_id: "1723338115",
        firstname: "Olive",
        lastname: "Ranieri",
        dateofbirth: ISODate("1985-05-12T23:14:30.000Z"),
        gender: "FEMALE",
        email: "oranieri@warmmail.com",
        address: { number: 9303, street: "Mele Circle", city: "Tobihbo" }
      }
    ]);
  });
});
