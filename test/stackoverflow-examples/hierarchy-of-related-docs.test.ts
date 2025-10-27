import { aggregate } from "../../src";

// https://stackoverflow.com/a/79180123
describe("Hierarchy of related documents", () => {
  it("passes", () => {
    const input = [
      {
        _id: "gotham_hotel",
        category: "hotel",
        partOf: {
          k: "street",
          v: ["kings_street_street"]
        }
      },
      {
        _id: "kings_street_street",
        category: "street",
        partOf: {
          k: "pincode",
          v: ["m24ah_pincode"]
        }
      },
      {
        _id: "m24ah_pincode",
        category: "pincode",
        partOf: {
          k: "city",
          v: ["manchester_city"]
        }
      },
      {
        _id: "manchester_city",
        category: "city",
        partOf: {
          k: "country",
          v: ["england_country"]
        }
      },
      {
        _id: "england_country",
        category: "country",
        partOf: {
          k: "continent",
          v: ["europe_continent"]
        }
      },
      {
        _id: "europe_continent",
        category: "continent",
        partOf: {
          k: "region",
          v: ["north_region"]
        }
      },
      {
        _id: "north_region",
        category: "region",
        contains: {
          continent: ["europe_continent", "antarctica_continent"]
        },
        partOf: null
      }
    ];

    const result = aggregate(input, [
      {
        $match: {
          _id: "gotham_hotel"
        }
      },
      {
        $graphLookup: {
          from: input,
          startWith: "$partOf.v",
          connectFromField: "partOf.v",
          connectToField: "_id",
          as: "partOf",
          depthField: "level"
        }
      },
      {
        $set: {
          partOf: {
            $sortArray: {
              input: "$partOf",
              sortBy: {
                level: -1
              }
            }
          }
        }
      },
      {
        $set: {
          partOf: {
            $reduce: {
              input: "$partOf",
              initialValue: {
                level: -1,
                presentPartOf: [],
                prevPartOf: []
              },
              in: {
                $let: {
                  vars: {
                    prev: {
                      $cond: [
                        {
                          $eq: ["$$value.level", "$$this.level"]
                        },
                        "$$value.prevPartOf",
                        "$$value.presentPartOf"
                      ]
                    },
                    current: {
                      $cond: [
                        {
                          $eq: ["$$value.level", "$$this.level"]
                        },
                        "$$value.presentPartOf",
                        []
                      ]
                    }
                  },
                  in: {
                    level: "$$this.level",
                    prevPartOf: "$$prev",
                    presentPartOf: {
                      $concatArrays: [
                        "$$current",
                        [
                          {
                            $mergeObjects: [
                              "$$this",
                              {
                                partOf: {
                                  $filter: {
                                    input: "$$prev",
                                    as: "e",
                                    cond: {
                                      $in: ["$$e._id", "$$this.partOf.v"]
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
        $set: {
          partOf: "$partOf.presentPartOf"
        }
      }
    ]);

    expect(result).toEqual([
      {
        _id: "gotham_hotel",
        category: "hotel",
        partOf: [
          {
            _id: "kings_street_street",
            category: "street",
            level: 0,
            partOf: [
              {
                _id: "m24ah_pincode",
                category: "pincode",
                level: 1,
                partOf: [
                  {
                    _id: "manchester_city",
                    category: "city",
                    level: 2,
                    partOf: [
                      {
                        _id: "england_country",
                        category: "country",
                        level: 3,
                        partOf: [
                          {
                            _id: "europe_continent",
                            category: "continent",
                            level: 4,
                            partOf: [
                              {
                                _id: "north_region",
                                category: "region",
                                contains: {
                                  continent: [
                                    "europe_continent",
                                    "antarctica_continent"
                                  ]
                                },
                                level: 5,
                                partOf: []
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);
  });
});
