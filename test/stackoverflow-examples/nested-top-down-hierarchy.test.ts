import { aggregate } from "../../src";

// https://stackoverflow.com/a/79174521
describe("nested top-down hierarchy", () => {
  it("passes", () => {
    const relations = [
      {
        _id: "p_commerce_metrics_dtst_v1",
        category: "dataset",
        dependentOn: {
          metrics: ["net_booking_count_v1"]
        }
      },
      // Doc 2:
      {
        _id: "net_booking_count_v1",
        category: "metric",
        dependentOn: {
          metrics: ["cancelled_booking_count_v1", "gross_booking_count_v1"]
        }
      },
      // Doc 3:
      {
        _id: "cancelled_booking_count_v1",
        category: "metric",
        dependentOn: {
          measures: ["hb_cancel_measure_v1"]
        }
      },
      // Doc 4:
      {
        _id: "gross_booking_count_v1",
        category: "metric",
        dependentOn: {
          measures: ["hb_booking_measure_v1"]
        }
      },
      // Doc 5 (Not dependentOn any other document _id. Dead End):
      {
        _id: "hb_cancel_measure_v1",
        category: "measure",
        usedBy: {
          metrics: ["cancelled_booking_count_v1", "more_metrics"]
        }
      },
      // Doc 6 (Not dependentOn any other document _id. Dead End):
      {
        _id: "hb_booking_measure_v1",
        category: "measure",
        usedBy: {
          metrics: ["gross_booking_count_v1", "more_metrics"]
        }
      }
    ];

    const result = aggregate(relations, [
      {
        $match: {
          _id: "p_commerce_metrics_dtst_v1"
        }
      },
      {
        $graphLookup: {
          from: relations,
          startWith: "$dependentOn.metrics",
          connectFromField: "dependentOn.metrics",
          connectToField: "_id",
          depthField: "depth",
          as: "dependentOnMetrics"
        }
      },
      {
        $set: {
          dependentOn: {
            metrics: {
              $setUnion: [
                {
                  $ifNull: ["$dependentOn.metrics", []]
                },
                {
                  $reduce: {
                    input: "$dependentOnMetrics.dependentOn.metrics",
                    initialValue: [],
                    in: {
                      $setUnion: ["$$value", "$$this"]
                    }
                  }
                }
              ]
            },
            measures: {
              $setUnion: [
                {
                  $ifNull: ["$dependentOn.measures", []]
                },
                {
                  $reduce: {
                    input: "$dependentOnMetrics.dependentOn.measures",
                    initialValue: [],
                    in: {
                      $setUnion: ["$$value", "$$this"]
                    }
                  }
                }
              ]
            }
          }
        }
      },
      {
        $unset: "dependentOnMetrics"
      }
    ]);

    expect(result).toEqual([
      {
        _id: "p_commerce_metrics_dtst_v1",
        category: "dataset",
        dependentOn: {
          measures: ["hb_cancel_measure_v1", "hb_booking_measure_v1"],
          metrics: [
            "net_booking_count_v1",
            "cancelled_booking_count_v1",
            "gross_booking_count_v1"
          ]
        }
      }
    ]);
  });
});
