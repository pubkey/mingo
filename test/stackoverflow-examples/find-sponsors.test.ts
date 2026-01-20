import { describe, expect, it } from "vitest";

import { aggregate } from "../../src";
import { ObjectId } from "../support";

// https://stackoverflow.com/a/67226903
describe("Find Sponsors", () => {
  it("passes", () => {
    const input = [
      {
        _id: ObjectId("607536219910ef23e80e0bbe"),
        companyname: "Main Company",
        sponsor: ""
      },
      {
        _id: ObjectId("607e16760a9d2c16e06bc252"),
        companyname: "Company 1",
        sponsor: ObjectId("607536219910ef23e80e0bbe")
      },
      {
        _id: ObjectId("607e187b0a9d2c16e06bc253"),
        companyname: "Company 2",
        sponsor: ObjectId("607e16760a9d2c16e06bc252")
      },
      {
        _id: ObjectId("607e1f470a9d2c16e06bc254"),
        companyname: "Company 3",
        sponsor: ObjectId("607e187b0a9d2c16e06bc253")
      }
    ];

    const result = aggregate(input, [
      {
        $match: { sponsor: "" }
      },
      {
        $graphLookup: {
          from: input,
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "sponsor",
          depthField: "level",
          as: "downline"
        }
      },
      {
        $unwind: {
          path: "$downline",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          "downline.level": -1
        }
      },
      {
        $group: {
          _id: "$_id",
          sponsor: { $first: "$sponsor" },
          companyname: { $first: "$companyname" },
          downline: { $push: "$downline" }
        }
      },
      {
        $addFields: {
          downline: {
            $reduce: {
              input: "$downline",
              initialValue: {
                level: -1,
                presentChild: [],
                prevChild: []
              },
              in: {
                $let: {
                  vars: {
                    prev: {
                      $cond: [
                        {
                          $eq: ["$$value.level", "$$this.level"]
                        },
                        "$$value.prevChild",
                        "$$value.presentChild"
                      ]
                    },
                    current: {
                      $cond: [
                        {
                          $eq: ["$$value.level", "$$this.level"]
                        },
                        "$$value.presentChild",
                        []
                      ]
                    }
                  },
                  in: {
                    level: "$$this.level",
                    prevChild: "$$prev",
                    presentChild: {
                      $concatArrays: [
                        "$$current",
                        [
                          {
                            $mergeObjects: [
                              "$$this",
                              {
                                downline: {
                                  $filter: {
                                    input: "$$prev",
                                    as: "e",
                                    cond: {
                                      $eq: ["$$e.sponsor", "$$this._id"]
                                    }
                                  }
                                }
                              }
                            ]
                          }
                        ]
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          downline: "$downline.presentChild"
        }
      }
    ]);

    expect(result).toEqual([
      {
        _id: ObjectId("607536219910ef23e80e0bbe"),
        companyname: "Main Company",
        downline: [
          {
            _id: ObjectId("607e16760a9d2c16e06bc252"),
            companyname: "Company 1",
            downline: [
              {
                _id: ObjectId("607e187b0a9d2c16e06bc253"),
                companyname: "Company 2",
                downline: [
                  {
                    _id: ObjectId("607e1f470a9d2c16e06bc254"),
                    companyname: "Company 3",
                    downline: [],
                    level: 2,
                    sponsor: ObjectId("607e187b0a9d2c16e06bc253")
                  }
                ],
                level: 1,
                sponsor: ObjectId("607e16760a9d2c16e06bc252")
              }
            ],
            level: 0,
            sponsor: ObjectId("607536219910ef23e80e0bbe")
          }
        ],
        sponsor: ""
      }
    ]);
  });
});
