/**
 * Compression statistics for XIC archives.
 */

import { serialize } from "./serializer";
import { XICArchive } from "./types";

export interface CompressionStats {
  /** Number of images in the archive */
  imageCount: number;
  /** Number of keyframe (base) images */
  keyframeCount: number;
  /** Number of patch-encoded images */
  patchImageCount: number;
  /** Total raw size (uncompressed RGBA) in bytes */
  rawSize: number;
  /** Compressed archive size in bytes */
  compressedSize: number;
  /** Compression ratio (raw / compressed) */
  compressionRatio: number;
  /** Dictionary size (number of entries) */
  dictionaryEntries: number;
  /** Dictionary data size in bytes */
  dictionarySize: number;
  /** Patch type breakdown */
  patchTypes: Record<string, number>;
}

/** Compute compression statistics for an archive */
export function getStats(archive: XICArchive): CompressionStats {
  const imageCount = archive.metadata.length;
  const keyframeCount = archive.baseImages.length;
  const patchImageCount = archive.patchImages.length;

  // Compute raw size from metadata
  let rawSize = 0;
  for (const meta of archive.metadata) {
    rawSize += meta.originalWidth * meta.originalHeight * 4; // RGBA
  }

  // Compute compressed size
  const compressed = serialize(archive);
  const compressedSize = compressed.length;

  // Dictionary stats
  const dictionaryEntries = archive.dictionary.entries.length;
  let dictionarySize = 0;
  for (const entry of archive.dictionary.entries) {
    dictionarySize += entry.data.length;
  }

  // Patch type breakdown
  const patchTypes: Record<string, number> = {};
  for (const pi of archive.patchImages) {
    for (const patch of pi.patches) {
      patchTypes[patch.type] = (patchTypes[patch.type] || 0) + 1;
    }
  }

  return {
    imageCount,
    keyframeCount,
    patchImageCount,
    rawSize,
    compressedSize,
    compressionRatio: rawSize / compressedSize,
    dictionaryEntries,
    dictionarySize,
    patchTypes
  };
}
