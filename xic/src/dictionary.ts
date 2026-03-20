/**
 * Global Dictionary: the heart of XIC.
 *
 * Stores common visual building blocks (tile-sized patterns) that
 * are shared across all images in the dataset. Each image can
 * reference entries instead of storing redundant pixel data.
 */

import { hammingDistance, hashTileData, perceptualHash } from "./hash";
import { splitIntoTiles, tileDifference } from "./tiles";
import {
  DictionaryEntry,
  GlobalDictionary,
  RawImage,
  Tile,
  XICOptions
} from "./types";

/** Build a global dictionary from a set of images */
export function buildDictionary(
  images: RawImage[],
  options: XICOptions
): GlobalDictionary {
  const { tileSize, similarityThreshold, maxDictionarySize } = options;

  // Phase 1: Extract all tiles from all images
  const allTiles: Tile[] = [];
  for (const image of images) {
    const tiles = splitIntoTiles(image, tileSize);
    allTiles.push(...tiles);
  }

  // Phase 2: Count exact duplicates using hash
  const hashCounts = new Map<string, { tile: Tile; count: number }>();
  for (const tile of allTiles) {
    const hash = hashTileData(tile.data);
    const existing = hashCounts.get(hash);
    if (existing) {
      existing.count++;
    } else {
      hashCounts.set(hash, { tile, count: 1 });
    }
  }

  // Phase 3: Sort by frequency (most common first) and pick top entries
  const sorted = [...hashCounts.entries()]
    .filter(([, v]) => v.count > 1) // only include tiles that appear more than once
    .sort((a, b) => b[1].count - a[1].count);

  const entries: DictionaryEntry[] = [];
  const hashIndex = new Map<string, number>();

  for (const [hash, { tile, count }] of sorted) {
    if (entries.length >= maxDictionarySize) break;

    const id = entries.length;
    entries.push({
      id,
      data: tile.data,
      hash,
      refCount: count
    });
    hashIndex.set(hash, id);
  }

  // Phase 4: Merge near-duplicates using perceptual hashing
  // Build a perceptual hash index for fuzzy matching
  if (entries.length < maxDictionarySize) {
    const pHashes = entries.map(e => perceptualHash(e.data, tileSize));

    // Find tiles that aren't exact matches but are perceptually similar
    for (const [hash, { tile, count }] of hashCounts) {
      if (hashIndex.has(hash)) continue; // already in dictionary
      if (count < 2) continue;
      if (entries.length >= maxDictionarySize) break;

      const pH = perceptualHash(tile.data, tileSize);
      let foundSimilar = false;

      for (let i = 0; i < pHashes.length; i++) {
        if (hammingDistance(pH, pHashes[i]) <= 3) {
          // Close enough to existing entry, check actual pixel diff
          const diff = tileDifference(tile.data, entries[i].data);
          if (diff <= similarityThreshold) {
            // Merge: increment ref count of existing entry
            entries[i].refCount += count;
            hashIndex.set(hash, entries[i].id);
            foundSimilar = true;
            break;
          }
        }
      }

      if (!foundSimilar) {
        // Add as new entry
        const id = entries.length;
        entries.push({ id, data: tile.data, hash, refCount: count });
        hashIndex.set(hash, id);
        pHashes.push(pH);
      }
    }
  }

  return { tileSize, entries, hashIndex };
}

/** Look up a tile in the dictionary. Returns entry ID or -1 if not found. */
export function lookupTile(
  dictionary: GlobalDictionary,
  tileData: Uint8Array
): number {
  const hash = hashTileData(tileData);
  const id = dictionary.hashIndex.get(hash);
  return id !== undefined ? id : -1;
}

/**
 * Find the closest dictionary entry for a tile using perceptual hashing.
 * Returns { entryId, difference } or null if nothing is close enough.
 */
export function findClosestEntry(
  dictionary: GlobalDictionary,
  tileData: Uint8Array,
  maxDifference: number
): { entryId: number; difference: number } | null {
  // First try exact match
  const exactId = lookupTile(dictionary, tileData);
  if (exactId >= 0) return { entryId: exactId, difference: 0 };

  // Perceptual search
  const pH = perceptualHash(tileData, dictionary.tileSize);
  let bestId = -1;
  let bestDiff = Infinity;

  for (const entry of dictionary.entries) {
    const ePH = perceptualHash(entry.data, dictionary.tileSize);
    if (hammingDistance(pH, ePH) > 8) continue; // skip very different tiles

    const diff = tileDifference(tileData, entry.data);
    if (diff < bestDiff && diff <= maxDifference) {
      bestDiff = diff;
      bestId = entry.id;
    }
  }

  return bestId >= 0 ? { entryId: bestId, difference: bestDiff } : null;
}
