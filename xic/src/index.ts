/**
 * XIC - Cross-Image Compression Format
 *
 * A format designed for folders of images that builds a shared
 * "compression brain" all images reference, enabling cross-image reuse.
 *
 * Usage:
 *   import { encode, decodeAll, decodeSingle, serialize, deserialize } from './xic';
 *
 *   // Compress a collection of images
 *   const archive = encode(images, { tileSize: 16 });
 *
 *   // Serialize to binary
 *   const binary = serialize(archive);
 *
 *   // Deserialize from binary
 *   const restored = deserialize(binary);
 *
 *   // Decompress all images
 *   const decoded = decodeAll(restored);
 *
 *   // Decompress a single image by ID
 *   const single = decodeSingle(restored, 5);
 */

export { decodeAll, decodeSingle } from "./decoder";
export { buildDictionary, findClosestEntry, lookupTile } from "./dictionary";
export { encode } from "./encoder";
export { hammingDistance, hashTileData, perceptualHash } from "./hash";
export { findBestKeyframe, selectKeyframes } from "./keyframes";
export { deserialize, serialize } from "./serializer";
export type { CompressionStats } from "./stats";
export { getStats } from "./stats";
export {
  assembleTiles,
  splitIntoTiles,
  tileDifference,
  tileKey,
  xorTiles
} from "./tiles";
export type {
  BaseImage,
  DictionaryEntry,
  Dimensions,
  GlobalDictionary,
  ImageMetadata,
  Patch,
  PatchImage,
  RawImage,
  Tile,
  TilePosition,
  TileRef,
  XICArchive,
  XICOptions
} from "./types";
export { DEFAULT_OPTIONS } from "./types";
