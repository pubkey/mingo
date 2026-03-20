/**
 * Keyframe (Base Image) Selection
 *
 * Similar to video I-frames: some images are stored fully compressed
 * and serve as references for other images. Selection is based on
 * clustering images by visual similarity and picking representatives.
 */

import { hammingDistance, perceptualHash } from "./hash";
import { splitIntoTiles } from "./tiles";
import { RawImage, XICOptions } from "./types";

/** Compute a fingerprint for an entire image (concat of tile perceptual hashes) */
function imageFingerprint(image: RawImage, tileSize: number): string[] {
  const tiles = splitIntoTiles(image, tileSize);
  return tiles.map(t => perceptualHash(t.data, tileSize));
}

/** Compute distance between two image fingerprints */
function fingerprintDistance(a: string[], b: string[]): number {
  const len = Math.min(a.length, b.length);
  if (len === 0) return Infinity;
  let totalDist = 0;
  for (let i = 0; i < len; i++) {
    totalDist += hammingDistance(a[i], b[i]);
  }
  return totalDist / len;
}

/**
 * Select keyframe images using a greedy farthest-point strategy.
 * Returns the IDs of images chosen as keyframes.
 */
export function selectKeyframes(
  images: RawImage[],
  options: XICOptions
): number[] {
  if (images.length === 0) return [];
  if (images.length === 1) return [0];

  const numKeyframes = Math.max(
    1,
    Math.ceil(images.length * options.keyframeRatio)
  );

  // Compute fingerprints
  const fingerprints = images.map(img =>
    imageFingerprint(img, options.tileSize)
  );

  // Greedy farthest-point sampling
  const selected: number[] = [0]; // start with first image
  const minDistToSelected = new Float64Array(images.length).fill(Infinity);

  while (selected.length < numKeyframes && selected.length < images.length) {
    // Update min distances to the last selected keyframe
    const lastSelected = selected[selected.length - 1];
    for (let i = 0; i < images.length; i++) {
      if (selected.includes(i)) continue;
      const dist = fingerprintDistance(
        fingerprints[i],
        fingerprints[lastSelected]
      );
      minDistToSelected[i] = Math.min(minDistToSelected[i], dist);
    }

    // Pick the image farthest from any selected keyframe
    let farthestIdx = -1;
    let farthestDist = -1;
    for (let i = 0; i < images.length; i++) {
      if (selected.includes(i)) continue;
      if (minDistToSelected[i] > farthestDist) {
        farthestDist = minDistToSelected[i];
        farthestIdx = i;
      }
    }

    if (farthestIdx >= 0) {
      selected.push(farthestIdx);
    } else {
      break;
    }
  }

  return selected;
}

/**
 * For a given non-keyframe image, find the best matching keyframe
 * (the one with smallest fingerprint distance).
 */
export function findBestKeyframe(
  imageId: number,
  keyframeIds: number[],
  images: RawImage[],
  tileSize: number
): number {
  if (keyframeIds.length === 0) {
    throw new Error("No keyframes available");
  }

  const fp = imageFingerprint(images[imageId], tileSize);
  let bestId = keyframeIds[0];
  let bestDist = Infinity;

  for (const kfId of keyframeIds) {
    const kfFp = imageFingerprint(images[kfId], tileSize);
    const dist = fingerprintDistance(fp, kfFp);
    if (dist < bestDist) {
      bestDist = dist;
      bestId = kfId;
    }
  }

  return bestId;
}
