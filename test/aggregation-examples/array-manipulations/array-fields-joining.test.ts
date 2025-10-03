import { aggregate, ISODate } from "../../support";

/**
 * You are developing a new dating website using a database to hold the profiles of all registered users.
 * For each user profile, you will persist a set of the user's specified hobbies, each with a description
 * of how the user says they conduct their pursuit. Each user's profile also captures what they prefer to
 * do depending on their mood (e.g., "happy", "sad", "chilling", etc.). When you show the user profiles on
 * the website to a person searching for a date, you want to describe how each candidate user conducts their
 * hobbies for each mood to help the person spot their ideal match.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-fields-joining.html}
 */
describe("Array Fields Joining", () => {
  const users = [
    {
      firstName: "Alice",
      lastName: "Jones",
      dateOfBirth: ISODate("1985-07-21T00:00:00Z"),
      hobbies: {
        music: "Playing the guitar",
        reading: "Science Fiction books",
        gaming: "Video games, especially RPGs",
        sports: "Long-distance running",
        traveling: "Visiting exotic places",
        cooking: "Trying out new recipes"
      },
      moodFavourites: {
        sad: ["music"],
        happy: ["sports"],
        chilling: ["music", "cooking"]
      }
    },
    {
      firstName: "Sam",
      lastName: "Brown",
      dateOfBirth: ISODate("1993-12-01T00:00:00Z"),
      hobbies: {
        cycling: "Mountain biking",
        writing: "Poetry and short stories",
        knitting: "Knitting scarves and hats",
        hiking: "Hiking in the mountains",
        volunteering: "Helping at the local animal shelter",
        music: "Listening to Jazz",
        photography: "Nature photography",
        gardening: "Growing herbs and vegetables",
        yoga: "Practicing Hatha Yoga",
        cinema: "Watching classic movies"
      },
      moodFavourites: {
        happy: ["gardening", "cycling"],
        sad: ["knitting"]
      }
    }
  ];

  // Macro function to generate a complex expression to get the array values of
  // named fields in a sub-document where each field's name is only known at runtime
  function getValuesOfNamedFieldsAsArray(obj: string, fieldnames: string) {
    return {
      $map: {
        input: {
          $filter: {
            input: { $objectToArray: obj },
            as: "currElem",
            cond: { $in: ["$$currElem.k", fieldnames] }
          }
        },
        in: "$$this.v"
      }
    };
  }

  const pipeline = [
    // Set a field with activities each user likes doing according to their mood
    {
      $set: {
        moodActivities: {
          $arrayToObject: {
            $map: {
              input: { $objectToArray: "$moodFavourites" },
              in: {
                k: "$$this.k",
                v: getValuesOfNamedFieldsAsArray("$hobbies", "$$this.v")
              }
            }
          }
        }
      }
    },

    // Remove unwanted fields
    { $unset: ["_id", "hobbies", "moodFavourites"] }
  ];

  it("returns two document each showing a new moodActivities array field containing descriptions of how a user conducts their preferred hobby for each mood", () => {
    expect(aggregate(users, pipeline)).toEqual([
      {
        firstName: "Alice",
        lastName: "Jones",
        dateOfBirth: ISODate("1985-07-21T00:00:00.000Z"),
        moodActivities: {
          sad: ["Playing the guitar"],
          happy: ["Long-distance running"],
          chilling: ["Playing the guitar", "Trying out new recipes"]
        }
      },
      {
        firstName: "Sam",
        lastName: "Brown",
        dateOfBirth: ISODate("1993-12-01T00:00:00.000Z"),
        moodActivities: {
          happy: ["Mountain biking", "Growing herbs and vegetables"],
          sad: ["Knitting scarves and hats"]
        }
      }
    ]);
  });
});
