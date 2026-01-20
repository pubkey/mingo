import { describe, expect, it } from "vitest";

import { aggregate } from "../../../src";

/**
 * Your organisation wants to know the best targets for a new marketing campaign based on a social network database similar to Twitter.
 * You want to search the collection of social network users, each holding a user's name and the names of other people who follow them.
 * You will execute an aggregation pipeline that walks each user record's followed_by array to determine which user has the largest network reach.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/trend-analysis/largest-graph-network.html}
 */
describe("Largest Graph Network", () => {
  const users = [
    { name: "Paul", followed_by: [] },
    { name: "Toni", followed_by: ["Paul"] },
    { name: "Janet", followed_by: ["Paul", "Toni"] },
    { name: "David", followed_by: ["Janet", "Paul", "Toni"] },
    { name: "Fiona", followed_by: ["David", "Paul"] },
    { name: "Bob", followed_by: ["Janet"] },
    { name: "Carl", followed_by: ["Fiona"] },
    { name: "Sarah", followed_by: ["Carl", "Paul"] },
    { name: "Carol", followed_by: ["Helen", "Sarah"] },
    { name: "Helen", followed_by: ["Paul"] }
  ];

  const pipeline = [
    // For each social network user, graph traverse their 'followed_by' list of people
    {
      $graphLookup: {
        from: users,
        startWith: "$followed_by",
        connectFromField: "followed_by",
        connectToField: "name",
        depthField: "depth",
        as: "extended_network"
      }
    },

    // Add new accumulating fields
    {
      $set: {
        // Count the extended connection reach
        network_reach: {
          $size: "$extended_network"
        },

        // Gather the list of the extended connections' names
        extended_connections: {
          $map: {
            input: "$extended_network",
            as: "connection",
            in: "$$connection.name" // Just get name field from each array element
          }
        }
      }
    },

    // Omit unwanted fields
    { $unset: ["_id", "followed_by", "extended_network"] },

    // Sort by person with greatest network reach first, in descending order
    {
      $sort: {
        network_reach: -1
      }
    },
    // ensure stable array fields
    {
      $addFields: {
        extended_connections: {
          $sortArray: { input: "$extended_connections", sortBy: { _id: 1 } }
        }
      }
    }
  ];

  it("return ten documents should be returned, corresponding to the original ten source social network users, with each one including a count of the user's network reach, and the names of their extended connections, sorted by the user with the most extensive network reach first", () => {
    expect(aggregate(users, pipeline)).toEqual([
      {
        name: "Carol",
        network_reach: 8,
        extended_connections: [
          "Carl",
          "David",
          "Fiona",
          "Helen",
          "Janet",
          "Paul",
          "Sarah",
          "Toni"
        ]
      },
      {
        name: "Sarah",
        network_reach: 6,
        extended_connections: [
          "Carl",
          "David",
          "Fiona",
          "Janet",
          "Paul",
          "Toni"
        ]
      },
      {
        name: "Carl",
        network_reach: 5,
        extended_connections: ["David", "Fiona", "Janet", "Paul", "Toni"]
      },
      {
        name: "Fiona",
        network_reach: 4,
        extended_connections: ["David", "Janet", "Paul", "Toni"]
      },
      {
        name: "David",
        network_reach: 3,
        extended_connections: ["Janet", "Paul", "Toni"]
      },
      {
        name: "Bob",
        network_reach: 3,
        extended_connections: ["Janet", "Paul", "Toni"]
      },
      {
        name: "Janet",
        network_reach: 2,
        extended_connections: ["Paul", "Toni"]
      },
      {
        name: "Toni",
        network_reach: 1,
        extended_connections: ["Paul"]
      },
      {
        name: "Helen",
        network_reach: 1,
        extended_connections: ["Paul"]
      },
      { name: "Paul", network_reach: 0, extended_connections: [] }
    ]);
  });
});
