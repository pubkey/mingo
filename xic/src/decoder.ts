/**
 * XIC Decoder: reconstruct images from an XIC archive.
 *
 * Supports:
 * - Full dataset decompression
 * - Random-access single image decompression
 * - Dependency resolution for graph-based references
 */

import { assembleTiles, tileKey, xorTiles } from "./tiles";
import {
  BaseImage,
  GlobalDictionary,
  Patch,
  PatchImage,
  RawImage,
  TileRef,
  XICArchive
} from "./types";

/** Decode all images from an XIC archive */
export function decodeAll(archive: XICArchive): RawImage[] {
  const results: RawImage[] = [];
  const cache = new Map<number, RawImage>();

  // Decode base images first (they have no dependencies)
  for (const base of archive.baseImages) {
    const img = decodeBaseImage(base, archive.dictionary);
    cache.set(base.imageId, img);
    results.push(img);
  }

  // Decode patch images (resolve dependencies)
  // Sort by dependency depth to ensure we decode dependencies first
  const sorted = topologicalSort(archive.patchImages, archive.metadata);

  for (const patchImage of sorted) {
    const img = decodePatchImage(patchImage, archive.dictionary, cache);
    cache.set(patchImage.imageId, img);
    results.push(img);
  }

  // Sort by original image ID
  results.sort((a, b) => a.id - b.id);

  // Restore names from metadata
  for (const meta of archive.metadata) {
    const img = results.find(r => r.id === meta.imageId);
    if (img && meta.name) {
      img.name = meta.name;
    }
  }

  return results;
}

/** Decode a single image by ID (with dependency resolution) */
export function decodeSingle(archive: XICArchive, imageId: number): RawImage {
  const cache = new Map<number, RawImage>();
  return decodeImageRecursive(archive, imageId, cache);
}

function decodeImageRecursive(
  archive: XICArchive,
  imageId: number,
  cache: Map<number, RawImage>
): RawImage {
  if (cache.has(imageId)) return cache.get(imageId)!;

  // Check if it's a base image
  const base = archive.baseImages.find(b => b.imageId === imageId);
  if (base) {
    const img = decodeBaseImage(base, archive.dictionary);
    cache.set(imageId, img);
    return img;
  }

  // It's a patch image - resolve dependencies first
  const patchImage = archive.patchImages.find(p => p.imageId === imageId);
  if (!patchImage) {
    throw new Error(`Image ${imageId} not found in archive`);
  }

  const meta = archive.metadata.find(m => m.imageId === imageId);
  if (meta) {
    for (const depId of meta.dependencies) {
      decodeImageRecursive(archive, depId, cache);
    }
  }

  const img = decodePatchImage(patchImage, archive.dictionary, cache);
  cache.set(imageId, img);
  return img;
}

/** Decode a base image from tile references */
function decodeBaseImage(
  base: BaseImage,
  dictionary: GlobalDictionary
): RawImage {
  const { tileSize } = dictionary;
  const cols = Math.ceil(base.dimensions.width / tileSize);
  const tileMap = new Map<string, Uint8Array>();

  for (let i = 0; i < base.tiles.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const key = tileKey({ row, col });
    const tileRef = base.tiles[i];

    tileMap.set(key, resolveTileRef(tileRef, dictionary));
  }

  const data = assembleTiles(tileMap, base.dimensions, tileSize);

  return {
    id: base.imageId,
    width: base.dimensions.width,
    height: base.dimensions.height,
    data
  };
}

/** Resolve a TileRef to actual pixel data */
function resolveTileRef(
  ref: TileRef,
  dictionary: GlobalDictionary
): Uint8Array {
  switch (ref.type) {
    case "dict":
      return dictionary.entries[ref.entryId].data;
    case "inline":
      return ref.data;
    case "diff": {
      const baseData = dictionary.entries[ref.baseEntryId].data;
      return xorTiles(baseData, ref.diff);
    }
  }
}

/** Decode a patch image using its patches and resolved dependencies */
function decodePatchImage(
  patchImage: PatchImage,
  dictionary: GlobalDictionary,
  cache: Map<number, RawImage>
): RawImage {
  const { tileSize } = dictionary;
  const tileMap = new Map<string, Uint8Array>();

  for (const patch of patchImage.patches) {
    const key = tileKey(patch.targetTile);
    tileMap.set(key, resolvePatch(patch, dictionary, cache, tileSize));
  }

  const data = assembleTiles(tileMap, patchImage.dimensions, tileSize);

  return {
    id: patchImage.imageId,
    width: patchImage.dimensions.width,
    height: patchImage.dimensions.height,
    data
  };
}

/** Resolve a patch to actual pixel data */
function resolvePatch(
  patch: Patch,
  dictionary: GlobalDictionary,
  cache: Map<number, RawImage>,
  tileSize: number
): Uint8Array {
  switch (patch.type) {
    case "dict_ref":
      return dictionary.entries[patch.entryId].data;

    case "block_copy": {
      const sourceImg = cache.get(patch.sourceImageId);
      if (!sourceImg) {
        throw new Error(`Source image ${patch.sourceImageId} not decoded yet`);
      }
      return extractTile(
        sourceImg,
        patch.sourceTile.row,
        patch.sourceTile.col,
        tileSize
      );
    }

    case "diff": {
      let refData: Uint8Array;
      if (patch.refSource.type === "dict") {
        refData = dictionary.entries[patch.refSource.entryId].data;
      } else {
        const sourceImg = cache.get(patch.refSource.imageId);
        if (!sourceImg) {
          throw new Error(
            `Source image ${patch.refSource.imageId} not decoded yet`
          );
        }
        refData = extractTile(
          sourceImg,
          patch.refSource.tile.row,
          patch.refSource.tile.col,
          tileSize
        );
      }
      return xorTiles(refData, patch.diffData);
    }

    case "transform": {
      // For now, transform patches fall back to block copy
      // (full affine transform support would be a future enhancement)
      const sourceImg = cache.get(patch.sourceImageId);
      if (!sourceImg) {
        throw new Error(`Source image ${patch.sourceImageId} not decoded yet`);
      }
      return extractTile(
        sourceImg,
        patch.sourceTile.row,
        patch.sourceTile.col,
        tileSize
      );
    }
  }
}

/** Extract a tile from a decoded image */
function extractTile(
  image: RawImage,
  row: number,
  col: number,
  tileSize: number
): Uint8Array {
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
    }
  }

  return tileData;
}

/** Topological sort of patch images by dependency order */
function topologicalSort(
  patchImages: PatchImage[],
  metadata: { imageId: number; dependencies: number[] }[]
): PatchImage[] {
  const metaMap = new Map(metadata.map(m => [m.imageId, m]));
  const visited = new Set<number>();
  const order: number[] = [];

  function visit(imageId: number) {
    if (visited.has(imageId)) return;
    visited.add(imageId);
    const meta = metaMap.get(imageId);
    if (meta) {
      for (const dep of meta.dependencies) {
        visit(dep);
      }
    }
    order.push(imageId);
  }

  for (const pi of patchImages) {
    visit(pi.imageId);
  }

  const patchMap = new Map(patchImages.map(p => [p.imageId, p]));
  return order.filter(id => patchMap.has(id)).map(id => patchMap.get(id)!);
}
