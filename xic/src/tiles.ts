/**
 * Tile operations: splitting images into tiles and reassembling.
 */

import { Dimensions, RawImage, Tile, TilePosition } from "./types";

/** Split an image into a grid of tiles */
export function splitIntoTiles(image: RawImage, tileSize: number): Tile[] {
  const tiles: Tile[] = [];
  const cols = Math.ceil(image.width / tileSize);
  const rows = Math.ceil(image.height / tileSize);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tileData = new Uint8Array(tileSize * tileSize * 4);

      for (let y = 0; y < tileSize; y++) {
        for (let x = 0; x < tileSize; x++) {
          const imgX = col * tileSize + x;
          const imgY = row * tileSize + y;
          const tileIdx = (y * tileSize + x) * 4;

          if (imgX < image.width && imgY < image.height) {
            const imgIdx = (imgY * image.width + imgX) * 4;
            tileData[tileIdx] = image.data[imgIdx];
            tileData[tileIdx + 1] = image.data[imgIdx + 1];
            tileData[tileIdx + 2] = image.data[imgIdx + 2];
            tileData[tileIdx + 3] = image.data[imgIdx + 3];
          }
          // else: stays 0 (transparent black padding)
        }
      }

      tiles.push({ position: { row, col }, data: tileData });
    }
  }

  return tiles;
}

/** Reassemble tiles into image pixel data */
export function assembleTiles(
  tiles: Map<string, Uint8Array>,
  dimensions: Dimensions,
  tileSize: number
): Uint8Array {
  const data = new Uint8Array(dimensions.width * dimensions.height * 4);
  const cols = Math.ceil(dimensions.width / tileSize);
  const rows = Math.ceil(dimensions.height / tileSize);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const key = tileKey({ row, col });
      const tileData = tiles.get(key);
      if (!tileData) continue;

      for (let y = 0; y < tileSize; y++) {
        for (let x = 0; x < tileSize; x++) {
          const imgX = col * tileSize + x;
          const imgY = row * tileSize + y;
          if (imgX >= dimensions.width || imgY >= dimensions.height) continue;

          const imgIdx = (imgY * dimensions.width + imgX) * 4;
          const tileIdx = (y * tileSize + x) * 4;
          data[imgIdx] = tileData[tileIdx];
          data[imgIdx + 1] = tileData[tileIdx + 1];
          data[imgIdx + 2] = tileData[tileIdx + 2];
          data[imgIdx + 3] = tileData[tileIdx + 3];
        }
      }
    }
  }

  return data;
}

/** Create a string key for a tile position (for Map usage) */
export function tileKey(pos: TilePosition): string {
  return `${pos.row}:${pos.col}`;
}

/** Compute mean absolute difference between two tile data arrays */
export function tileDifference(a: Uint8Array, b: Uint8Array): number {
  if (a.length !== b.length) {
    throw new Error("Tile data length mismatch");
  }
  let totalDiff = 0;
  for (let i = 0; i < a.length; i++) {
    totalDiff += Math.abs(a[i] - b[i]);
  }
  return totalDiff / a.length;
}

/** XOR two tile data arrays to produce a diff */
export function xorTiles(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i];
  }
  return result;
}

/** Check if a diff is entirely zero (tiles are identical) */
export function isZeroDiff(diff: Uint8Array): boolean {
  for (let i = 0; i < diff.length; i++) {
    if (diff[i] !== 0) return false;
  }
  return true;
}

/** Count non-zero bytes in a diff (measure of difference complexity) */
export function diffComplexity(diff: Uint8Array): number {
  let count = 0;
  for (let i = 0; i < diff.length; i++) {
    if (diff[i] !== 0) count++;
  }
  return count;
}
