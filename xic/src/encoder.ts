/**
 * XIC Encoder: the compression pipeline.
 *
 * Steps:
 * 1. Analyze dataset - split into tiles, cluster similar images
 * 2. Build dictionary - extract common patches, build frequency models
 * 3. Choose base images - pick representative keyframes
 * 4. Encode others - reference base images, apply patches + dictionary reuse
 */

import { buildDictionary, findClosestEntry, lookupTile } from "./dictionary";
import { findBestKeyframe, selectKeyframes } from "./keyframes";
import {
  diffComplexity,
  splitIntoTiles,
  tileDifference,
  tileKey,
  xorTiles
} from "./tiles";
import {
  BaseImage,
  DEFAULT_OPTIONS,
  GlobalDictionary,
  ImageMetadata,
  Patch,
  PatchImage,
  RawImage,
  TileRef,
  XICArchive,
  XICOptions
} from "./types";

/** Encode a collection of images into an XIC archive */
export function encode(
  images: RawImage[],
  userOptions?: Partial<XICOptions>
): XICArchive {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };

  if (images.length === 0) {
    return {
      version: 1,
      dictionary: {
        tileSize: options.tileSize,
        entries: [],
        hashIndex: new Map()
      },
      baseImages: [],
      patchImages: [],
      metadata: [],
      options
    };
  }

  // Step 1 & 2: Build global dictionary
  const dictionary = buildDictionary(images, options);

  // Step 3: Select keyframes
  const keyframeIds = selectKeyframes(images, options);

  // Step 4: Encode base images
  const baseImages: BaseImage[] = [];
  for (const kfId of keyframeIds) {
    baseImages.push(encodeBaseImage(images[kfId], kfId, dictionary));
  }

  // Step 5: Encode non-keyframe images as patches
  const patchImages: PatchImage[] = [];
  for (let i = 0; i < images.length; i++) {
    if (keyframeIds.includes(i)) continue;

    const bestKeyframe = findBestKeyframe(
      i,
      keyframeIds,
      images,
      options.tileSize
    );
    const patchImage = encodePatchImage(
      images[i],
      i,
      bestKeyframe,
      images,
      keyframeIds,
      dictionary,
      options
    );
    patchImages.push(patchImage);
  }

  // Build metadata
  const metadata: ImageMetadata[] = images.map((img, i) => ({
    imageId: i,
    name: img.name,
    originalWidth: img.width,
    originalHeight: img.height,
    isBase: keyframeIds.includes(i),
    dependencies: keyframeIds.includes(i)
      ? []
      : getDependencies(patchImages.find(p => p.imageId === i)!)
  }));

  return {
    version: 1,
    dictionary,
    baseImages,
    patchImages,
    metadata,
    options
  };
}

/** Encode a keyframe image: each tile is either a dict ref or inline */
function encodeBaseImage(
  image: RawImage,
  imageId: number,
  dictionary: GlobalDictionary
): BaseImage {
  const tiles = splitIntoTiles(image, dictionary.tileSize);
  const tileRefs: TileRef[] = [];

  for (const tile of tiles) {
    const dictId = lookupTile(dictionary, tile.data);
    if (dictId >= 0) {
      tileRefs.push({ type: "dict", entryId: dictId });
    } else {
      // Try to find a close match and store as diff
      const closest = findClosestEntry(
        dictionary,
        tile.data,
        30 // generous threshold for base images
      );
      if (closest && closest.difference > 0) {
        const diff = xorTiles(
          tile.data,
          dictionary.entries[closest.entryId].data
        );
        const complexity = diffComplexity(diff);
        // Only use diff if it's actually smaller than inline
        if (complexity < tile.data.length * 0.5) {
          tileRefs.push({
            type: "diff",
            baseEntryId: closest.entryId,
            diff
          });
          continue;
        }
      }
      tileRefs.push({ type: "inline", data: tile.data });
    }
  }

  return {
    imageId,
    dimensions: { width: image.width, height: image.height },
    tiles: tileRefs
  };
}

/** Encode a non-keyframe image as patches against a base image and dictionary */
function encodePatchImage(
  image: RawImage,
  imageId: number,
  primaryBaseId: number,
  allImages: RawImage[],
  keyframeIds: number[],
  dictionary: GlobalDictionary,
  options: XICOptions
): PatchImage {
  const tileSize = dictionary.tileSize;
  const tiles = splitIntoTiles(image, tileSize);
  const baseTiles = splitIntoTiles(allImages[primaryBaseId], tileSize);
  const patches: Patch[] = [];

  // Build a map of base image tiles for fast lookup
  const baseTileMap = new Map<string, Uint8Array>();
  for (const bt of baseTiles) {
    baseTileMap.set(tileKey(bt.position), bt.data);
  }

  for (const tile of tiles) {
    const pos = tile.position;
    const key = tileKey(pos);

    // Strategy 1: Exact dictionary match
    const dictId = lookupTile(dictionary, tile.data);
    if (dictId >= 0) {
      patches.push({ type: "dict_ref", targetTile: pos, entryId: dictId });
      continue;
    }

    // Strategy 2: Same tile position in base image - store diff
    const baseTile = baseTileMap.get(key);
    if (baseTile) {
      const diff = tileDifference(tile.data, baseTile);
      if (diff === 0) {
        // Identical to base - copy
        patches.push({
          type: "block_copy",
          targetTile: pos,
          sourceImageId: primaryBaseId,
          sourceTile: pos
        });
        continue;
      }
      if (diff <= options.similarityThreshold * 2) {
        // Close enough - store as diff
        const xorDiff = xorTiles(tile.data, baseTile);
        patches.push({
          type: "diff",
          targetTile: pos,
          refSource: { type: "image", imageId: primaryBaseId, tile: pos },
          diffData: xorDiff
        });
        continue;
      }
    }

    // Strategy 3: Cross-image matching - search other tiles in base image
    if (options.crossImageMatching) {
      let bestMatch: {
        pos: typeof pos;
        diff: number;
        data: Uint8Array;
      } | null = null;
      for (const bt of baseTiles) {
        const d = tileDifference(tile.data, bt.data);
        if (d < (bestMatch?.diff ?? options.similarityThreshold * 3)) {
          bestMatch = { pos: bt.position, diff: d, data: bt.data };
        }
      }
      if (bestMatch && bestMatch.diff <= options.similarityThreshold * 2) {
        if (bestMatch.diff === 0) {
          patches.push({
            type: "block_copy",
            targetTile: pos,
            sourceImageId: primaryBaseId,
            sourceTile: bestMatch.pos
          });
        } else {
          const xorDiff = xorTiles(tile.data, bestMatch.data);
          patches.push({
            type: "diff",
            targetTile: pos,
            refSource: {
              type: "image",
              imageId: primaryBaseId,
              tile: bestMatch.pos
            },
            diffData: xorDiff
          });
        }
        continue;
      }
    }

    // Strategy 4: Closest dictionary entry + diff
    const closest = findClosestEntry(dictionary, tile.data, 50);
    if (closest) {
      const xorDiff = xorTiles(
        tile.data,
        dictionary.entries[closest.entryId].data
      );
      patches.push({
        type: "diff",
        targetTile: pos,
        refSource: { type: "dict", entryId: closest.entryId },
        diffData: xorDiff
      });
      continue;
    }

    // Strategy 5: Fallback - store as diff from zero (essentially inline via dict ref 0 trick)
    // We use a dict_ref to entry 0 with a diff if dict is non-empty, else block_copy from self
    patches.push({
      type: "diff",
      targetTile: pos,
      refSource: { type: "dict", entryId: 0 },
      diffData:
        dictionary.entries.length > 0
          ? xorTiles(tile.data, dictionary.entries[0].data)
          : tile.data
    });
  }

  return {
    imageId,
    dimensions: { width: image.width, height: image.height },
    primaryBaseId,
    patches
  };
}

/** Extract dependency image IDs from a patch image */
function getDependencies(patchImage: PatchImage): number[] {
  const deps = new Set<number>();
  deps.add(patchImage.primaryBaseId);

  for (const patch of patchImage.patches) {
    if (patch.type === "block_copy") {
      deps.add(patch.sourceImageId);
    } else if (patch.type === "diff" && patch.refSource.type === "image") {
      deps.add(patch.refSource.imageId);
    } else if (patch.type === "transform") {
      deps.add(patch.sourceImageId);
    }
  }

  return [...deps];
}
