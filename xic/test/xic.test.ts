import { describe, expect, it } from "vitest";

import type { RawImage } from "../src/index";
import {
  assembleTiles,
  buildDictionary,
  decodeAll,
  decodeSingle,
  DEFAULT_OPTIONS,
  deserialize,
  encode,
  getStats,
  hammingDistance,
  hashTileData,
  lookupTile,
  perceptualHash,
  selectKeyframes,
  serialize,
  splitIntoTiles,
  tileDifference,
  tileKey,
  xorTiles
} from "../src/index";

// ─── Helpers ──────────────────────────────────────────────────────────

/** Create a solid-color RGBA image */
function solidImage(
  id: number,
  width: number,
  height: number,
  r: number,
  g: number,
  b: number,
  a = 255
): RawImage {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = a;
  }
  return { id, width, height, data, name: `image_${id}` };
}

/** Create a gradient image */
function gradientImage(id: number, width: number, height: number): RawImage {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      data[i] = Math.floor((x / width) * 255);
      data[i + 1] = Math.floor((y / height) * 255);
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }
  return { id, width, height, data, name: `gradient_${id}` };
}

/** Create an image with a checkerboard pattern */
function checkerImage(
  id: number,
  width: number,
  height: number,
  blockSize: number
): RawImage {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const isWhite =
        (Math.floor(x / blockSize) + Math.floor(y / blockSize)) % 2 === 0;
      const v = isWhite ? 255 : 0;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  return { id, width, height, data, name: `checker_${id}` };
}

/** Compare two images pixel by pixel, return max per-channel difference */
function maxPixelDiff(a: RawImage, b: RawImage): number {
  expect(a.width).toBe(b.width);
  expect(a.height).toBe(b.height);
  let maxDiff = 0;
  for (let i = 0; i < a.data.length; i++) {
    maxDiff = Math.max(maxDiff, Math.abs(a.data[i] - b.data[i]));
  }
  return maxDiff;
}

// ─── Tile Tests ───────────────────────────────────────────────────────

describe("Tiles", () => {
  it("should split and reassemble an image losslessly", () => {
    const img = gradientImage(0, 64, 64);
    const tiles = splitIntoTiles(img, 16);

    // 64/16 = 4 tiles per dimension = 16 tiles total
    expect(tiles.length).toBe(16);

    const tileMap = new Map<string, Uint8Array>();
    for (const tile of tiles) {
      tileMap.set(tileKey(tile.position), tile.data);
    }

    const reassembled = assembleTiles(tileMap, { width: 64, height: 64 }, 16);

    expect(reassembled).toEqual(img.data);
  });

  it("should handle non-tile-aligned dimensions", () => {
    const img = gradientImage(0, 50, 30);
    const tiles = splitIntoTiles(img, 16);

    // ceil(50/16) = 4 cols, ceil(30/16) = 2 rows = 8 tiles
    expect(tiles.length).toBe(8);

    const tileMap = new Map<string, Uint8Array>();
    for (const tile of tiles) {
      tileMap.set(tileKey(tile.position), tile.data);
    }

    const reassembled = assembleTiles(tileMap, { width: 50, height: 30 }, 16);

    expect(reassembled).toEqual(img.data);
  });

  it("should compute tile difference correctly", () => {
    const a = new Uint8Array(16 * 16 * 4).fill(100);
    const b = new Uint8Array(16 * 16 * 4).fill(110);
    expect(tileDifference(a, b)).toBe(10);

    const c = new Uint8Array(16 * 16 * 4).fill(100);
    expect(tileDifference(a, c)).toBe(0);
  });

  it("should XOR tiles correctly", () => {
    const a = new Uint8Array([10, 20, 30, 40]);
    const b = new Uint8Array([15, 25, 35, 45]);
    const xored = xorTiles(a, b);
    // XOR back should recover original
    const recovered = xorTiles(b, xored);
    expect(recovered).toEqual(a);
  });
});

// ─── Hash Tests ───────────────────────────────────────────────────────

describe("Hashing", () => {
  it("should produce consistent hashes", () => {
    const data = new Uint8Array(16 * 16 * 4).fill(42);
    expect(hashTileData(data)).toBe(hashTileData(data));
  });

  it("should produce different hashes for different data", () => {
    const a = new Uint8Array(16 * 16 * 4).fill(42);
    const b = new Uint8Array(16 * 16 * 4).fill(43);
    expect(hashTileData(a)).not.toBe(hashTileData(b));
  });

  it("should compute perceptual hash", () => {
    const data = new Uint8Array(16 * 16 * 4).fill(128);
    const pH = perceptualHash(data, 16);
    expect(typeof pH).toBe("string");
    expect(pH.length).toBeGreaterThan(0);
  });

  it("should compute hamming distance", () => {
    expect(hammingDistance("0000", "0000")).toBe(0);
    expect(hammingDistance("ffff", "0000")).toBe(16);
    expect(hammingDistance("f", "0")).toBe(4); // 1111 vs 0000
  });
});

// ─── Dictionary Tests ─────────────────────────────────────────────────

describe("Dictionary", () => {
  it("should build a dictionary from identical images", () => {
    // 5 identical solid red images - should have very few dict entries
    const images = Array.from({ length: 5 }, (_, i) =>
      solidImage(i, 32, 32, 255, 0, 0)
    );

    const dict = buildDictionary(images, DEFAULT_OPTIONS);
    // All tiles are identical, so dictionary should have exactly 1 entry
    expect(dict.entries.length).toBe(1);
    expect(dict.entries[0].refCount).toBe(5 * 4); // 5 images, each 2x2 tiles (32/16)
  });

  it("should look up tiles in dictionary", () => {
    const images = [solidImage(0, 32, 32, 255, 0, 0)];
    const dict = buildDictionary(images, {
      ...DEFAULT_OPTIONS
      // Need at least 2 refs normally, but let's use multiple images
    });

    // With only 1 image, tiles only appear once, so may not be in dict
    // Let's use 2 identical images
    const images2 = [
      solidImage(0, 32, 32, 255, 0, 0),
      solidImage(1, 32, 32, 255, 0, 0)
    ];
    const dict2 = buildDictionary(images2, DEFAULT_OPTIONS);

    const redTile = new Uint8Array(16 * 16 * 4);
    for (let i = 0; i < 16 * 16; i++) {
      redTile[i * 4] = 255;
      redTile[i * 4 + 1] = 0;
      redTile[i * 4 + 2] = 0;
      redTile[i * 4 + 3] = 255;
    }

    const id = lookupTile(dict2, redTile);
    expect(id).toBeGreaterThanOrEqual(0);
  });
});

// ─── Keyframe Tests ───────────────────────────────────────────────────

describe("Keyframes", () => {
  it("should select at least one keyframe", () => {
    const images = [gradientImage(0, 32, 32)];
    const kf = selectKeyframes(images, DEFAULT_OPTIONS);
    expect(kf.length).toBeGreaterThanOrEqual(1);
  });

  it("should select proportional keyframes", () => {
    const images = Array.from({ length: 20 }, (_, i) =>
      gradientImage(i, 32, 32)
    );
    const kf = selectKeyframes(images, {
      ...DEFAULT_OPTIONS,
      keyframeRatio: 0.25
    });
    // 25% of 20 = 5
    expect(kf.length).toBe(5);
  });

  it("should return empty for no images", () => {
    expect(selectKeyframes([], DEFAULT_OPTIONS)).toEqual([]);
  });
});

// ─── Full Pipeline Tests ──────────────────────────────────────────────

describe("Encode/Decode Pipeline", () => {
  it("should handle empty image set", () => {
    const archive = encode([]);
    expect(archive.metadata.length).toBe(0);
    const decoded = decodeAll(archive);
    expect(decoded.length).toBe(0);
  });

  it("should losslessly roundtrip identical solid images", () => {
    const images = [
      solidImage(0, 32, 32, 255, 0, 0),
      solidImage(1, 32, 32, 255, 0, 0),
      solidImage(2, 32, 32, 255, 0, 0)
    ];

    const archive = encode(images);
    const decoded = decodeAll(archive);

    expect(decoded.length).toBe(3);
    for (let i = 0; i < images.length; i++) {
      expect(maxPixelDiff(images[i], decoded[i])).toBe(0);
    }
  });

  it("should roundtrip different solid color images", () => {
    const images = [
      solidImage(0, 32, 32, 255, 0, 0),
      solidImage(1, 32, 32, 0, 255, 0),
      solidImage(2, 32, 32, 0, 0, 255)
    ];

    const archive = encode(images);
    const decoded = decodeAll(archive);

    expect(decoded.length).toBe(3);
    for (let i = 0; i < images.length; i++) {
      expect(maxPixelDiff(images[i], decoded[i])).toBe(0);
    }
  });

  it("should roundtrip gradient images", () => {
    const images = [
      gradientImage(0, 32, 32),
      gradientImage(1, 32, 32),
      gradientImage(2, 48, 48)
    ];

    const archive = encode(images);
    const decoded = decodeAll(archive);

    expect(decoded.length).toBe(3);
    // First two are identical, should be lossless
    expect(maxPixelDiff(images[0], decoded[0])).toBe(0);
    expect(maxPixelDiff(images[1], decoded[1])).toBe(0);
    expect(maxPixelDiff(images[2], decoded[2])).toBe(0);
  });

  it("should roundtrip checkerboard patterns", () => {
    const images = [
      checkerImage(0, 64, 64, 16),
      checkerImage(1, 64, 64, 16),
      checkerImage(2, 64, 64, 8)
    ];

    const archive = encode(images);
    const decoded = decodeAll(archive);

    expect(decoded.length).toBe(3);
    for (let i = 0; i < images.length; i++) {
      expect(maxPixelDiff(images[i], decoded[i])).toBe(0);
    }
  });

  it("should decode a single image by ID", () => {
    const images = [
      solidImage(0, 32, 32, 255, 0, 0),
      solidImage(1, 32, 32, 0, 255, 0),
      solidImage(2, 32, 32, 0, 0, 255)
    ];

    const archive = encode(images);

    for (let i = 0; i < images.length; i++) {
      const single = decodeSingle(archive, i);
      expect(maxPixelDiff(images[i], single)).toBe(0);
    }
  });

  it("should preserve image names", () => {
    const images = [
      { ...solidImage(0, 32, 32, 255, 0, 0), name: "red.png" },
      { ...solidImage(1, 32, 32, 0, 255, 0), name: "green.png" }
    ];

    const archive = encode(images);
    const decoded = decodeAll(archive);

    expect(decoded[0].name).toBe("red.png");
    expect(decoded[1].name).toBe("green.png");
  });

  it("should achieve compression on duplicate images", () => {
    // 10 identical images should compress well
    const images = Array.from({ length: 10 }, (_, i) =>
      solidImage(i, 64, 64, 100, 150, 200)
    );

    const archive = encode(images);
    const stats = getStats(archive);

    expect(stats.compressionRatio).toBeGreaterThan(1);
    expect(stats.dictionaryEntries).toBeGreaterThan(0);
    expect(stats.imageCount).toBe(10);
  });

  it("should handle many similar images with slight variations", () => {
    const images: RawImage[] = [];
    for (let i = 0; i < 10; i++) {
      const img = solidImage(i, 32, 32, 100 + i, 150, 200);
      images.push(img);
    }

    const archive = encode(images);
    const decoded = decodeAll(archive);

    expect(decoded.length).toBe(10);
    for (let i = 0; i < images.length; i++) {
      expect(maxPixelDiff(images[i], decoded[i])).toBe(0);
    }
  });
});

// ─── Serialization Tests ──────────────────────────────────────────────

describe("Serialization", () => {
  it("should serialize and deserialize an archive", () => {
    const images = [
      solidImage(0, 32, 32, 255, 0, 0),
      solidImage(1, 32, 32, 0, 255, 0)
    ];

    const archive = encode(images);
    const binary = serialize(archive);
    const restored = deserialize(binary);

    // Verify structure matches
    expect(restored.version).toBe(archive.version);
    expect(restored.dictionary.entries.length).toBe(
      archive.dictionary.entries.length
    );
    expect(restored.baseImages.length).toBe(archive.baseImages.length);
    expect(restored.patchImages.length).toBe(archive.patchImages.length);
    expect(restored.metadata.length).toBe(archive.metadata.length);
    expect(restored.options.tileSize).toBe(archive.options.tileSize);
  });

  it("should produce identical decoded images after serialize/deserialize", () => {
    const images = [
      solidImage(0, 32, 32, 255, 0, 0),
      gradientImage(1, 32, 32),
      checkerImage(2, 32, 32, 8)
    ];

    const archive = encode(images);
    const binary = serialize(archive);
    const restored = deserialize(binary);
    const decoded = decodeAll(restored);

    expect(decoded.length).toBe(3);
    for (let i = 0; i < images.length; i++) {
      expect(maxPixelDiff(images[i], decoded[i])).toBe(0);
    }
  });

  it("should reject invalid magic number", () => {
    const bad = new Uint8Array(100);
    expect(() => deserialize(bad)).toThrow("Invalid XIC file");
  });
});

// ─── Stats Tests ──────────────────────────────────────────────────────

describe("Stats", () => {
  it("should compute correct raw size", () => {
    const images = [
      solidImage(0, 32, 32, 255, 0, 0),
      solidImage(1, 64, 64, 0, 255, 0)
    ];

    const archive = encode(images);
    const stats = getStats(archive);

    expect(stats.rawSize).toBe(32 * 32 * 4 + 64 * 64 * 4);
    expect(stats.imageCount).toBe(2);
    expect(stats.keyframeCount + stats.patchImageCount).toBe(2);
  });
});

// ─── Cross-Image Reuse Tests ──────────────────────────────────────────

describe("Cross-Image Reuse", () => {
  it("should reuse tiles across images with shared regions", () => {
    // Create images that share a common region
    const base = solidImage(0, 64, 64, 100, 100, 100);
    const variant = solidImage(1, 64, 64, 100, 100, 100);
    // Modify just one tile of the variant
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = (y * 64 + x) * 4;
        variant.data[i] = 200;
      }
    }

    const images = [base, variant];
    const archive = encode(images);
    const decoded = decodeAll(archive);

    expect(maxPixelDiff(images[0], decoded[0])).toBe(0);
    expect(maxPixelDiff(images[1], decoded[1])).toBe(0);
  });

  it("should handle burst photos (near-identical images)", () => {
    // Simulate burst: same base with small pixel noise
    const images: RawImage[] = [];
    for (let i = 0; i < 5; i++) {
      const img = gradientImage(i, 32, 32);
      // Add deterministic "noise" based on image index
      for (let j = 0; j < img.data.length; j += 4) {
        img.data[j] = Math.min(255, img.data[j] + ((i * 3) % 5));
      }
      images.push(img);
    }

    const archive = encode(images);
    const decoded = decodeAll(archive);

    expect(decoded.length).toBe(5);
    for (let i = 0; i < images.length; i++) {
      expect(maxPixelDiff(images[i], decoded[i])).toBe(0);
    }
  });
});

// ─── Edge Cases ───────────────────────────────────────────────────────

describe("Edge Cases", () => {
  it("should handle a single small image", () => {
    const images = [solidImage(0, 8, 8, 255, 0, 0)];
    const archive = encode(images, { tileSize: 16 });
    const decoded = decodeAll(archive);
    expect(decoded.length).toBe(1);
    expect(maxPixelDiff(images[0], decoded[0])).toBe(0);
  });

  it("should handle 1x1 image", () => {
    const img: RawImage = {
      id: 0,
      width: 1,
      height: 1,
      data: new Uint8Array([255, 128, 64, 255])
    };
    const archive = encode([img]);
    const decoded = decodeAll(archive);
    expect(decoded.length).toBe(1);
    expect(decoded[0].data[0]).toBe(255);
    expect(decoded[0].data[1]).toBe(128);
    expect(decoded[0].data[2]).toBe(64);
    expect(decoded[0].data[3]).toBe(255);
  });

  it("should handle custom options", () => {
    const images = [
      solidImage(0, 64, 64, 255, 0, 0),
      solidImage(1, 64, 64, 0, 255, 0)
    ];
    const archive = encode(images, {
      tileSize: 8,
      similarityThreshold: 16,
      maxDictionarySize: 100,
      keyframeRatio: 0.5
    });

    expect(archive.options.tileSize).toBe(8);
    expect(archive.options.similarityThreshold).toBe(16);

    const decoded = decodeAll(archive);
    for (let i = 0; i < images.length; i++) {
      expect(maxPixelDiff(images[i], decoded[i])).toBe(0);
    }
  });
});
