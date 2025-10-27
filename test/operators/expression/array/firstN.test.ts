import { aggregate } from "../../../../src";
import { testPath } from "../../../support";

describe(testPath(__filename), () => {
  it("passes: using $firstN as an array operator", () => {
    const res = aggregate(
      [
        { playerId: 1, score: [1, 2, 3] },
        { playerId: 2, score: [12, 90, 7, 89, 8] },
        { playerId: 3, score: [null] },
        { playerId: 4, score: [] },
        { playerId: 5, score: [1293, null, 3489, 9] },
        { playerId: 6, score: ["12.1", 2, 2090845886852, 23] }
      ],
      [{ $addFields: { firstScores: { $firstN: { n: 3, input: "$score" } } } }]
    );
    expect(res).toEqual([
      {
        playerId: 1,
        score: [1, 2, 3],
        firstScores: [1, 2, 3]
      },
      {
        playerId: 2,
        score: [12, 90, 7, 89, 8],
        firstScores: [12, 90, 7]
      },
      {
        playerId: 3,
        score: [null],
        firstScores: [null]
      },
      {
        playerId: 4,
        score: [],
        firstScores: []
      },
      {
        playerId: 5,
        score: [1293, null, 3489, 9],
        firstScores: [1293, null, 3489]
      },
      {
        playerId: 6,
        score: ["12.1", 2, 2090845886852, 23],
        firstScores: ["12.1", 2, 2090845886852]
      }
    ]);
  });
});
