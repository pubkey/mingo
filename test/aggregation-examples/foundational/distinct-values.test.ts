import { aggregate } from "../../../src";

/**
 * You want to query a collection of persons where each document contains data on one or more languages spoken by the person.
 * The query result should be an alphabetically sorted list of unique languages that a developer can subsequently use to populate a list of values in a user interface's "drop-down" widget.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/foundational/distinct-values.html}
 */
describe("Distinct List Of Values", () => {
  // Insert records into the persons collection
  const persons = [
    {
      firstname: "Elise",
      lastname: "Smith",
      vocation: "ENGINEER",
      language: "English"
    },
    {
      firstname: "Olive",
      lastname: "Ranieri",
      vocation: "ENGINEER",
      language: ["Italian", "English"]
    },
    {
      firstname: "Toni",
      lastname: "Jones",
      vocation: "POLITICIAN",
      language: ["English", "Welsh"]
    },
    {
      firstname: "Bert",
      lastname: "Gooding",
      vocation: "FLORIST",
      language: "English"
    },
    {
      firstname: "Sophie",
      lastname: "Celements",
      vocation: "ENGINEER",
      language: ["Gaelic", "English"]
    },
    {
      firstname: "Carl",
      lastname: "Simmons",
      vocation: "ENGINEER",
      language: "English"
    },
    {
      firstname: "Diego",
      lastname: "Lopez",
      vocation: "CHEF",
      language: "Spanish"
    },
    {
      firstname: "Helmut",
      lastname: "Schneider",
      vocation: "NURSE",
      language: "German"
    },
    {
      firstname: "Valerie",
      lastname: "Dubois",
      vocation: "SCIENTIST",
      language: "French"
    }
  ];

  it("returns seven unique language names should be returned sorted in alphabetical order", () => {
    const pipeline = [
      // Unpack each language field which may be an array or a single value
      {
        $unwind: {
          path: "$language"
        }
      },

      // Group by language
      {
        $group: {
          _id: "$language"
        }
      },

      // Sort languages alphabetically
      {
        $sort: {
          _id: 1
        }
      },

      // Change _id field's name to 'language'
      {
        $set: {
          language: "$_id",
          _id: "$$REMOVE"
        }
      }
    ];

    expect(aggregate(persons, pipeline)).toEqual([
      { language: "English" },
      { language: "French" },
      { language: "Gaelic" },
      { language: "German" },
      { language: "Italian" },
      { language: "Spanish" },
      { language: "Welsh" }
    ]);
  });
});
