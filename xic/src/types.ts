/**
 * XIC (Cross-Image Compression) Format Types
 *
 * A format designed for folders of images that builds a shared
 * "compression brain" all images reference, enabling cross-image reuse.
 */

/** RGBA pixel data for a single tile/block */
export type PixelData = Uint8Array;

/** Dimensions of an image or tile */
export interface Dimensions {
  width: number;
  height: number;
}

/** A tile position within an image grid */
export interface TilePosition {
  row: number;
  col: number;
}

/** A single tile extracted from an image */
export interface Tile {
  position: TilePosition;
  /** RGBA pixel data, length = tileSize * tileSize * 4 */
  data: Uint8Array;
}

/** Raw image representation used internally */
export interface RawImage {
  id: number;
  width: number;
  height: number;
  /** RGBA pixel data */
  data: Uint8Array;
  /** Optional original filename */
  name?: string;
}

// ─── Global Dictionary ───────────────────────────────────────────────

/** A dictionary entry storing a reusable visual pattern (tile-sized block) */
export interface DictionaryEntry {
  /** Unique ID for this entry */
  id: number;
  /** The tile pixel data (RGBA) */
  data: Uint8Array;
  /** Hash of the data for fast lookup */
  hash: string;
  /** How many times this entry is referenced across all images */
  refCount: number;
}

/** The global dictionary: shared visual building blocks */
export interface GlobalDictionary {
  /** Tile size used (e.g. 32 means 32x32 tiles) */
  tileSize: number;
  /** All dictionary entries */
  entries: DictionaryEntry[];
  /** Fast lookup from hash to entry ID */
  hashIndex: Map<string, number>;
}

// ─── Base Images (Keyframes) ─────────────────────────────────────────

/** A base image (keyframe) stored fully compressed */
export interface BaseImage {
  /** Index in the original image list */
  imageId: number;
  /** Image dimensions */
  dimensions: Dimensions;
  /**
   * Tile grid: each cell is either a dictionary entry ID
   * or inline tile data (for unique tiles).
   */
  tiles: TileRef[];
}

/** Reference to a tile: either a dictionary entry or inline data */
export type TileRef =
  | { type: "dict"; entryId: number }
  | { type: "inline"; data: Uint8Array }
  | { type: "diff"; baseEntryId: number; diff: Uint8Array };

// ─── Patch Streams ───────────────────────────────────────────────────

/** Types of patches for inter-image reuse */
export type Patch = BlockCopyPatch | DictRefPatch | DiffPatch | TransformPatch;

/** Copy a block from another image */
export interface BlockCopyPatch {
  type: "block_copy";
  /** Tile position in target image */
  targetTile: TilePosition;
  /** Source image ID */
  sourceImageId: number;
  /** Tile position in source image */
  sourceTile: TilePosition;
}

/** Reference a dictionary entry */
export interface DictRefPatch {
  type: "dict_ref";
  targetTile: TilePosition;
  entryId: number;
}

/** Store a diff against a reference tile */
export interface DiffPatch {
  type: "diff";
  targetTile: TilePosition;
  /** Reference: either a dict entry or another image's tile */
  refSource:
    | { type: "dict"; entryId: number }
    | { type: "image"; imageId: number; tile: TilePosition };
  /** XOR diff data */
  diffData: Uint8Array;
}

/** Transform-based patch (shift, scale) */
export interface TransformPatch {
  type: "transform";
  targetTile: TilePosition;
  sourceImageId: number;
  sourceTile: TilePosition;
  /** Simple affine: [scaleX, scaleY, translateX, translateY] */
  transform: [number, number, number, number];
}

// ─── Encoded Image ───────────────────────────────────────────────────

/** A non-keyframe image encoded as patches against references */
export interface PatchImage {
  imageId: number;
  dimensions: Dimensions;
  /** The base image this primarily references */
  primaryBaseId: number;
  /** Ordered list of patches to reconstruct this image */
  patches: Patch[];
}

// ─── Metadata ────────────────────────────────────────────────────────

export interface ImageMetadata {
  imageId: number;
  name?: string;
  originalWidth: number;
  originalHeight: number;
  /** Whether this is a base (keyframe) image */
  isBase: boolean;
  /** IDs of images this depends on for reconstruction */
  dependencies: number[];
}

// ─── XIC Archive (top-level) ─────────────────────────────────────────

export interface XICArchive {
  /** Format version */
  version: number;
  /** Global compression dictionary */
  dictionary: GlobalDictionary;
  /** Base images (keyframes) */
  baseImages: BaseImage[];
  /** Patch-encoded images */
  patchImages: PatchImage[];
  /** Metadata index */
  metadata: ImageMetadata[];
  /** Compression options used */
  options: XICOptions;
}

/** Configuration options for XIC compression */
export interface XICOptions {
  /** Tile size in pixels (default: 16) */
  tileSize: number;
  /** Max difference threshold for tiles to be considered "similar" (0-255 per channel, default: 8) */
  similarityThreshold: number;
  /** Maximum number of dictionary entries (default: 4096) */
  maxDictionarySize: number;
  /** Fraction of images to use as keyframes (default: 0.1, meaning ~10%) */
  keyframeRatio: number;
  /** Enable cross-image matching beyond just base images (default: true) */
  crossImageMatching: boolean;
}

export const DEFAULT_OPTIONS: XICOptions = {
  tileSize: 16,
  similarityThreshold: 8,
  maxDictionarySize: 4096,
  keyframeRatio: 0.1,
  crossImageMatching: true
};
