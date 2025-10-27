import { aggregate } from "../../../src";

/**
 * You want to provide a {@link https://en.wikipedia.org/wiki/Faceted_search | faceted search} capability on your retail website to enable customers to refine their product search by selecting specific characteristics against the product results listed in the web page.
 * It is beneficial to classify the products by different dimensions, where each dimension, or facet, corresponds to a particular field in a product record (e.g. product rating, product price).
 * Each facet should be broken down into sub-ranges so that a customer can select a specific sub-range (4 - 5 stars) for a particular facet (e.g. rating).
 * The aggregation pipeline will analyse the products collection by each facet's field (rating and price) to determine each facet's spread of values.
 *
 * See {@link https://www.practical-mongodb-aggregations.com/examples/trend-analysis/faceted-classifications.html}
 *
 */
describe("Faceted Classification", () => {
  const products = [
    {
      name: "Asus Laptop",
      category: "ELECTRONICS",
      description: "Good value laptop for students",
      price: 431.43,
      rating: 4.2
    },
    {
      name: "The Day Of The Triffids",
      category: "BOOKS",
      description: "Classic post-apocalyptic novel",
      price: 5.01,
      rating: 4.8
    },
    {
      name: "Morphy Richardds Food Mixer",
      category: "KITCHENWARE",
      description: "Luxury mixer turning good cakes into great",
      price: 63.13,
      rating: 3.8
    },
    {
      name: "Karcher Hose Set",
      category: "GARDEN",
      description: "Hose + nosels + winder for tidy storage",
      price: 22.13,
      rating: 4.3
    },
    {
      name: "Oak Coffee Table",
      category: "HOME",
      description: "size is 2m x 0.5m x 0.4m",
      price: 22.13,
      rating: 3.8
    },
    {
      name: "Lenovo Laptop",
      category: "ELECTRONICS",
      description: "High spec good for gaming",
      price: 1299.99,
      rating: 4.1
    },
    {
      name: "One Day in the Life of Ivan Denisovich",
      category: "BOOKS",
      description: "Brutal life in a labour camp",
      price: 4.29,
      rating: 4.9
    },
    {
      name: "Russell Hobbs Chrome Kettle",
      category: "KITCHENWARE",
      description: "Nice looking budget kettle",
      price: 15.76,
      rating: 3.9
    },
    // second set
    {
      name: "Tiffany Gold Chain",
      category: "JEWELERY",
      description: "Looks great for any age and gender",
      price: 582.22,
      rating: 4.0
    },
    {
      name: "Raleigh Racer 21st Century Classic",
      category: "BICYCLES",
      description: "Modern update to a classic 70s bike design",
      price: 523.0,
      rating: 4.5
    },
    {
      name: "Diesel Flare Jeans",
      category: "CLOTHES",
      description: "Top end casual look",
      price: 129.89,
      rating: 4.3
    },
    {
      name: "Jazz Silk Scarf",
      category: "CLOTHES",
      description: "Style for the winder months",
      price: 28.39,
      rating: 3.7
    },
    {
      name: "Dell XPS 13 Laptop",
      category: "ELECTRONICS",
      description: "Developer edition",
      price: 1399.89,
      rating: 4.4
    },
    {
      name: "NY Baseball Cap",
      category: "CLOTHES",
      description: "Blue & white",
      price: 18.99,
      rating: 4.0
    },
    {
      name: "Tots Flower Pots",
      category: "GARDEN",
      description: "Set of three",
      price: 9.78,
      rating: 4.1
    },
    {
      name: "Picky Pencil Sharpener",
      category: "Stationery",
      description: "Ultra budget",
      price: 0.67,
      rating: 1.2
    }
  ];

  const pipeline = [
    // Group products by 2 facets: 1) by price ranges, 2) by rating ranges
    {
      $facet: {
        // Group by price ranges
        by_price: [
          // Group into 3 ranges: inexpensive small price range to expensive large price range
          {
            $bucketAuto: {
              groupBy: "$price",
              buckets: 3,
              granularity: "1-2-5",
              output: {
                count: { $sum: 1 },
                products: { $push: "$name" }
              }
            }
          },

          // Tag range info as "price_range"
          {
            $set: {
              price_range: "$_id"
            }
          },

          // Omit unwanted fields
          { $unset: ["_id"] }
        ],

        // Group by rating ranges
        by_rating: [
          // Group products evenly across 5 rating ranges from low to high
          {
            $bucketAuto: {
              groupBy: "$rating",
              buckets: 5,
              output: {
                count: { $sum: 1 },
                products: { $push: "$name" }
              }
            }
          },

          // Tag range info as "rating_range"
          {
            $set: {
              rating_range: "$_id"
            }
          },

          // Omit unwanted fields
          { $unset: ["_id"] }
        ]
      }
    }
  ];

  it("returns a document which contains 2 facets (keyed off by_price and by_rating respectively), where each facet shows its sub-ranges of values and the products belonging to each sub-range", () => {
    const result = aggregate(products, pipeline);
    expect(result).not.toEqual([
      {
        by_price: [
          {
            count: 6,
            price_range: {
              max: 20,
              min: 0.5
            },
            products: [
              "Picky Pencil Sharpener",
              "One Day in the Life of Ivan Denisovich",
              "The Day Of The Triffids",
              "Tots Flower Pots",
              "Russell Hobbs Chrome Kettle",
              "NY Baseball Cap"
            ]
          },
          {
            count: 5,
            price_range: {
              max: 200,
              min: 20
            },
            products: [
              "Karcher Hose Set",
              "Oak Coffee Table",
              "Jazz Silk Scarf",
              "Morphy Richardds Food Mixer",
              "Diesel Flare Jeans"
            ]
          },
          {
            count: 5,
            price_range: {
              max: 2000,
              min: 200
            },
            products: [
              "Asus Laptop",
              "Raleigh Racer 21st Century Classic",
              "Tiffany Gold Chain",
              "Lenovo Laptop",
              "Dell XPS 13 Laptop"
            ]
          }
        ],
        by_rating: [
          {
            count: 4,
            products: [
              "Picky Pencil Sharpener",
              "Jazz Silk Scarf",
              "Morphy Richardds Food Mixer",
              "Oak Coffee Table"
            ],
            rating_range: {
              max: 3.9,
              min: 1.2
            }
          },
          {
            count: 3,
            products: [
              "Russell Hobbs Chrome Kettle",
              "Tiffany Gold Chain",
              "NY Baseball Cap"
            ],
            rating_range: {
              max: 4.1,
              min: 3.9
            }
          },
          {
            count: 3,
            products: ["Lenovo Laptop", "Tots Flower Pots", "Asus Laptop"],
            rating_range: {
              max: 4.3,
              min: 4.1
            }
          },
          {
            count: 3,
            products: [
              "Karcher Hose Set",
              "Diesel Flare Jeans",
              "Dell XPS 13 Laptop"
            ],
            rating_range: {
              max: 4.5,
              min: 4.3
            }
          },
          {
            count: 3,
            products: [
              "Raleigh Racer 21st Century Classic",
              "The Day Of The Triffids",
              "One Day in the Life of Ivan Denisovich"
            ],
            rating_range: {
              max: 4.9,
              min: 4.5
            }
          }
        ]
      }
    ]);
  });
});
