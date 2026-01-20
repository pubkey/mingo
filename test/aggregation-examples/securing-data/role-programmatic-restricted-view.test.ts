import { describe, expect, it } from "vitest";

import { aggregate } from "../../../src";
import { ISODate } from "../../support";

/**
 * At a medical establishment, the central IT system holds patient data that you need to surface
 * to different applications (and their users) according to the application's role: Receptionist, Nurse, and Doctor.
 *
 * Consequently, you will provide a read-only view of patient data, but the view will filter out specific sensitive fields depending on the application's role.
 * For example, the Receptionist's application should not be able to access the patient's current weight and medication.
 * However, the Doctor's application needs this information to enable them to perform their job.
 */
describe("Role Programmatic Restricted View", () => {
  const patients = [
    {
      id: "D40230",
      first_name: "Chelsea",
      last_Name: "Chow",
      birth_date: ISODate("1984-11-07T10:12:00Z"),
      weight: 145,
      medication: ["Insulin", "Methotrexate"]
    },
    {
      id: "R83165",
      first_name: "Pharrell",
      last_Name: "Phillips",
      birth_date: ISODate("1993-05-30T19:44:00Z"),
      weight: 137,
      medication: ["Fluoxetine"]
    },
    {
      id: "X24046",
      first_name: "Billy",
      last_Name: "Boaty",
      birth_date: ISODate("1976-02-07T23:58:00Z"),
      weight: 223,
      medication: []
    },
    {
      id: "P53212",
      first_name: "Yazz",
      last_Name: "Yodeler",
      birth_date: ISODate("1999-12-25T12:51:00Z"),
      weight: 156,
      medication: ["Tylenol", "Naproxen"]
    }
  ];

  const pipeline = [
    {
      $set: {
        // Exclude weight if user does not have right role
        weight: {
          $cond: {
            if: {
              $eq: [
                {
                  $setIntersection: ["$$USER_ROLES.role", ["Doctor", "Nurse"]]
                },
                []
              ]
            },
            then: "$$REMOVE",
            else: "$weight"
          }
        },

        // Exclude weight if user does not have right role
        medication: {
          $cond: {
            if: {
              $eq: [{ $setIntersection: ["$$USER_ROLES.role", ["Doctor"]] }, []]
            },
            then: "$$REMOVE",
            else: "$medication"
          }
        },

        // Always exclude _id
        _id: "$$REMOVE"
      }
    }
  ];

  it("returns view for the front-desk (Receptionist) includes patient data in the results but omits each patient's weight and medication fields because the user's role does not have sufficient privileges to access those fields.", () => {
    const options = {
      variables: { USER_ROLES: { role: ["Receptionist"] } }
    };
    expect(aggregate(patients, pipeline, options)).toEqual([
      {
        id: "D40230",
        first_name: "Chelsea",
        last_Name: "Chow",
        birth_date: ISODate("1984-11-07T10:12:00.000Z")
      },
      {
        id: "R83165",
        first_name: "Pharrell",
        last_Name: "Phillips",
        birth_date: ISODate("1993-05-30T19:44:00.000Z")
      },
      {
        id: "X24046",
        first_name: "Billy",
        last_Name: "Boaty",
        birth_date: ISODate("1976-02-07T23:58:00.000Z")
      },
      {
        id: "P53212",
        first_name: "Yazz",
        last_Name: "Yodeler",
        birth_date: ISODate("1999-12-25T12:51:00.000Z")
      }
    ]);
  });

  it("returns view for the nurse-station (Nurse) includes patient data in the results similar to the previous user, but with the weight field also shown for each record.", () => {
    const options = {
      variables: { USER_ROLES: { role: ["Nurse"] } }
    };
    expect(aggregate(patients, pipeline, options)).toEqual([
      {
        id: "D40230",
        first_name: "Chelsea",
        last_Name: "Chow",
        birth_date: ISODate("1984-11-07T10:12:00.000Z"),
        weight: 145
      },
      {
        id: "R83165",
        first_name: "Pharrell",
        last_Name: "Phillips",
        birth_date: ISODate("1993-05-30T19:44:00.000Z"),
        weight: 137
      },
      {
        id: "X24046",
        first_name: "Billy",
        last_Name: "Boaty",
        birth_date: ISODate("1976-02-07T23:58:00.000Z"),
        weight: 223
      },
      {
        id: "P53212",
        first_name: "Yazz",
        last_Name: "Yodeler",
        birth_date: ISODate("1999-12-25T12:51:00.000Z"),
        weight: 156
      }
    ]);
  });

  it("returns view for the exam-room (Doctor) includes each patient's entire data in the results, including the weight and medication fields, due to the user having sufficient privileges to access those fields.", () => {
    const options = {
      variables: { USER_ROLES: { role: ["Doctor"] } }
    };
    expect(aggregate(patients, pipeline, options)).toEqual([
      {
        id: "D40230",
        first_name: "Chelsea",
        last_Name: "Chow",
        birth_date: ISODate("1984-11-07T10:12:00.000Z"),
        weight: 145,
        medication: ["Insulin", "Methotrexate"]
      },
      {
        id: "R83165",
        first_name: "Pharrell",
        last_Name: "Phillips",
        birth_date: ISODate("1993-05-30T19:44:00.000Z"),
        weight: 137,
        medication: ["Fluoxetine"]
      },
      {
        id: "X24046",
        first_name: "Billy",
        last_Name: "Boaty",
        birth_date: ISODate("1976-02-07T23:58:00.000Z"),
        weight: 223,
        medication: []
      },
      {
        id: "P53212",
        first_name: "Yazz",
        last_Name: "Yodeler",
        birth_date: ISODate("1999-12-25T12:51:00.000Z"),
        weight: 156,
        medication: ["Tylenol", "Naproxen"]
      }
    ]);
  });
});
