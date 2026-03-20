/**
 * XIC File Format Serialization/Deserialization
 *
 * Binary format layout:
 * [Header][GlobalDictionary][BaseImages][PatchImages][MetadataIndex]
 *
 * All multi-byte integers are little-endian.
 */

import {
  BaseImage,
  DictionaryEntry,
  GlobalDictionary,
  ImageMetadata,
  Patch,
  PatchImage,
  TileRef,
  XICArchive,
  XICOptions
} from "./types";

const MAGIC = 0x58494300; // "XIC\0"
const FORMAT_VERSION = 1;

/** Serialize an XIC archive to a binary buffer */
export function serialize(archive: XICArchive): Uint8Array {
  const writer = new BinaryWriter();

  // Header
  writer.writeUint32(MAGIC);
  writer.writeUint32(FORMAT_VERSION);
  writer.writeUint32(archive.metadata.length); // image count

  // Options
  writeOptions(writer, archive.options);

  // Dictionary
  writeDictionary(writer, archive.dictionary);

  // Base images
  writer.writeUint32(archive.baseImages.length);
  for (const base of archive.baseImages) {
    writeBaseImage(writer, base);
  }

  // Patch images
  writer.writeUint32(archive.patchImages.length);
  for (const patch of archive.patchImages) {
    writePatchImage(writer, patch);
  }

  // Metadata
  writer.writeUint32(archive.metadata.length);
  for (const meta of archive.metadata) {
    writeMetadata(writer, meta);
  }

  return writer.toUint8Array();
}

/** Deserialize a binary buffer into an XIC archive */
export function deserialize(buffer: Uint8Array): XICArchive {
  const reader = new BinaryReader(buffer);

  // Header
  const magic = reader.readUint32();
  if (magic !== MAGIC) {
    throw new Error(
      `Invalid XIC file: bad magic number 0x${magic.toString(16)}`
    );
  }
  const version = reader.readUint32();
  if (version !== FORMAT_VERSION) {
    throw new Error(`Unsupported XIC version: ${version}`);
  }
  const imageCount = reader.readUint32();

  // Options
  const options = readOptions(reader);

  // Dictionary
  const dictionary = readDictionary(reader);

  // Base images
  const baseCount = reader.readUint32();
  const baseImages: BaseImage[] = [];
  for (let i = 0; i < baseCount; i++) {
    baseImages.push(readBaseImage(reader));
  }

  // Patch images
  const patchCount = reader.readUint32();
  const patchImages: PatchImage[] = [];
  for (let i = 0; i < patchCount; i++) {
    patchImages.push(readPatchImage(reader));
  }

  // Metadata
  const metaCount = reader.readUint32();
  const metadata: ImageMetadata[] = [];
  for (let i = 0; i < metaCount; i++) {
    metadata.push(readMetadata(reader));
  }

  return { version, dictionary, baseImages, patchImages, metadata, options };
}

// ─── Options ──────────────────────────────────────────────────────────

function writeOptions(w: BinaryWriter, opts: XICOptions) {
  w.writeUint32(opts.tileSize);
  w.writeUint32(opts.similarityThreshold);
  w.writeUint32(opts.maxDictionarySize);
  w.writeFloat64(opts.keyframeRatio);
  w.writeUint8(opts.crossImageMatching ? 1 : 0);
}

function readOptions(r: BinaryReader): XICOptions {
  return {
    tileSize: r.readUint32(),
    similarityThreshold: r.readUint32(),
    maxDictionarySize: r.readUint32(),
    keyframeRatio: r.readFloat64(),
    crossImageMatching: r.readUint8() === 1
  };
}

// ─── Dictionary ───────────────────────────────────────────────────────

function writeDictionary(w: BinaryWriter, dict: GlobalDictionary) {
  w.writeUint32(dict.tileSize);
  w.writeUint32(dict.entries.length);
  for (const entry of dict.entries) {
    w.writeUint32(entry.id);
    w.writeString(entry.hash);
    w.writeUint32(entry.refCount);
    w.writeBytes(entry.data);
  }
}

function readDictionary(r: BinaryReader): GlobalDictionary {
  const tileSize = r.readUint32();
  const count = r.readUint32();
  const entries: DictionaryEntry[] = [];
  const hashIndex = new Map<string, number>();

  for (let i = 0; i < count; i++) {
    const id = r.readUint32();
    const hash = r.readString();
    const refCount = r.readUint32();
    const data = r.readBytes();
    entries.push({ id, data, hash, refCount });
    hashIndex.set(hash, id);
  }

  return { tileSize, entries, hashIndex };
}

// ─── Base Images ──────────────────────────────────────────────────────

function writeBaseImage(w: BinaryWriter, base: BaseImage) {
  w.writeUint32(base.imageId);
  w.writeUint32(base.dimensions.width);
  w.writeUint32(base.dimensions.height);
  w.writeUint32(base.tiles.length);
  for (const tileRef of base.tiles) {
    writeTileRef(w, tileRef);
  }
}

function readBaseImage(r: BinaryReader): BaseImage {
  const imageId = r.readUint32();
  const width = r.readUint32();
  const height = r.readUint32();
  const tileCount = r.readUint32();
  const tiles: TileRef[] = [];
  for (let i = 0; i < tileCount; i++) {
    tiles.push(readTileRef(r));
  }
  return { imageId, dimensions: { width, height }, tiles };
}

function writeTileRef(w: BinaryWriter, ref: TileRef) {
  switch (ref.type) {
    case "dict":
      w.writeUint8(0);
      w.writeUint32(ref.entryId);
      break;
    case "inline":
      w.writeUint8(1);
      w.writeBytes(ref.data);
      break;
    case "diff":
      w.writeUint8(2);
      w.writeUint32(ref.baseEntryId);
      w.writeBytes(ref.diff);
      break;
  }
}

function readTileRef(r: BinaryReader): TileRef {
  const type = r.readUint8();
  switch (type) {
    case 0:
      return { type: "dict", entryId: r.readUint32() };
    case 1:
      return { type: "inline", data: r.readBytes() };
    case 2:
      return { type: "diff", baseEntryId: r.readUint32(), diff: r.readBytes() };
    default:
      throw new Error(`Unknown TileRef type: ${type}`);
  }
}

// ─── Patch Images ─────────────────────────────────────────────────────

function writePatchImage(w: BinaryWriter, pi: PatchImage) {
  w.writeUint32(pi.imageId);
  w.writeUint32(pi.dimensions.width);
  w.writeUint32(pi.dimensions.height);
  w.writeUint32(pi.primaryBaseId);
  w.writeUint32(pi.patches.length);
  for (const patch of pi.patches) {
    writePatch(w, patch);
  }
}

function readPatchImage(r: BinaryReader): PatchImage {
  const imageId = r.readUint32();
  const width = r.readUint32();
  const height = r.readUint32();
  const primaryBaseId = r.readUint32();
  const patchCount = r.readUint32();
  const patches: Patch[] = [];
  for (let i = 0; i < patchCount; i++) {
    patches.push(readPatch(r));
  }
  return { imageId, dimensions: { width, height }, primaryBaseId, patches };
}

function writePatch(w: BinaryWriter, patch: Patch) {
  switch (patch.type) {
    case "block_copy":
      w.writeUint8(0);
      w.writeUint32(patch.targetTile.row);
      w.writeUint32(patch.targetTile.col);
      w.writeUint32(patch.sourceImageId);
      w.writeUint32(patch.sourceTile.row);
      w.writeUint32(patch.sourceTile.col);
      break;
    case "dict_ref":
      w.writeUint8(1);
      w.writeUint32(patch.targetTile.row);
      w.writeUint32(patch.targetTile.col);
      w.writeUint32(patch.entryId);
      break;
    case "diff":
      w.writeUint8(2);
      w.writeUint32(patch.targetTile.row);
      w.writeUint32(patch.targetTile.col);
      if (patch.refSource.type === "dict") {
        w.writeUint8(0);
        w.writeUint32(patch.refSource.entryId);
      } else {
        w.writeUint8(1);
        w.writeUint32(patch.refSource.imageId);
        w.writeUint32(patch.refSource.tile.row);
        w.writeUint32(patch.refSource.tile.col);
      }
      w.writeBytes(patch.diffData);
      break;
    case "transform":
      w.writeUint8(3);
      w.writeUint32(patch.targetTile.row);
      w.writeUint32(patch.targetTile.col);
      w.writeUint32(patch.sourceImageId);
      w.writeUint32(patch.sourceTile.row);
      w.writeUint32(patch.sourceTile.col);
      w.writeFloat64(patch.transform[0]);
      w.writeFloat64(patch.transform[1]);
      w.writeFloat64(patch.transform[2]);
      w.writeFloat64(patch.transform[3]);
      break;
  }
}

function readPatch(r: BinaryReader): Patch {
  const type = r.readUint8();
  switch (type) {
    case 0: {
      const targetTile = { row: r.readUint32(), col: r.readUint32() };
      const sourceImageId = r.readUint32();
      const sourceTile = { row: r.readUint32(), col: r.readUint32() };
      return { type: "block_copy", targetTile, sourceImageId, sourceTile };
    }
    case 1: {
      const targetTile = { row: r.readUint32(), col: r.readUint32() };
      const entryId = r.readUint32();
      return { type: "dict_ref", targetTile, entryId };
    }
    case 2: {
      const targetTile = { row: r.readUint32(), col: r.readUint32() };
      const refType = r.readUint8();
      const refSource =
        refType === 0
          ? { type: "dict" as const, entryId: r.readUint32() }
          : {
              type: "image" as const,
              imageId: r.readUint32(),
              tile: { row: r.readUint32(), col: r.readUint32() }
            };
      const diffData = r.readBytes();
      return { type: "diff", targetTile, refSource, diffData };
    }
    case 3: {
      const targetTile = { row: r.readUint32(), col: r.readUint32() };
      const sourceImageId = r.readUint32();
      const sourceTile = { row: r.readUint32(), col: r.readUint32() };
      const transform: [number, number, number, number] = [
        r.readFloat64(),
        r.readFloat64(),
        r.readFloat64(),
        r.readFloat64()
      ];
      return {
        type: "transform",
        targetTile,
        sourceImageId,
        sourceTile,
        transform
      };
    }
    default:
      throw new Error(`Unknown patch type: ${type}`);
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────

function writeMetadata(w: BinaryWriter, meta: ImageMetadata) {
  w.writeUint32(meta.imageId);
  w.writeString(meta.name ?? "");
  w.writeUint32(meta.originalWidth);
  w.writeUint32(meta.originalHeight);
  w.writeUint8(meta.isBase ? 1 : 0);
  w.writeUint32(meta.dependencies.length);
  for (const dep of meta.dependencies) {
    w.writeUint32(dep);
  }
}

function readMetadata(r: BinaryReader): ImageMetadata {
  const imageId = r.readUint32();
  const name = r.readString();
  const originalWidth = r.readUint32();
  const originalHeight = r.readUint32();
  const isBase = r.readUint8() === 1;
  const depCount = r.readUint32();
  const dependencies: number[] = [];
  for (let i = 0; i < depCount; i++) {
    dependencies.push(r.readUint32());
  }
  return {
    imageId,
    name: name || undefined,
    originalWidth,
    originalHeight,
    isBase,
    dependencies
  };
}

// ─── Binary Writer ────────────────────────────────────────────────────

class BinaryWriter {
  private chunks: Uint8Array[] = [];
  private buf = new ArrayBuffer(8);
  private view = new DataView(this.buf);

  writeUint8(value: number) {
    this.chunks.push(new Uint8Array([value]));
  }

  writeUint32(value: number) {
    this.view.setUint32(0, value, true);
    this.chunks.push(new Uint8Array(this.buf.slice(0, 4)));
  }

  writeFloat64(value: number) {
    this.view.setFloat64(0, value, true);
    this.chunks.push(new Uint8Array(this.buf.slice(0, 8)));
  }

  writeString(str: string) {
    const encoded = new TextEncoder().encode(str);
    this.writeUint32(encoded.length);
    this.chunks.push(encoded);
  }

  writeBytes(data: Uint8Array) {
    this.writeUint32(data.length);
    this.chunks.push(new Uint8Array(data));
  }

  toUint8Array(): Uint8Array {
    let totalLength = 0;
    for (const chunk of this.chunks) totalLength += chunk.length;
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of this.chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }
}

// ─── Binary Reader ────────────────────────────────────────────────────

class BinaryReader {
  private view: DataView;
  private offset = 0;

  constructor(buffer: Uint8Array) {
    this.view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength
    );
  }

  readUint8(): number {
    const value = this.view.getUint8(this.offset);
    this.offset += 1;
    return value;
  }

  readUint32(): number {
    const value = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return value;
  }

  readFloat64(): number {
    const value = this.view.getFloat64(this.offset, true);
    this.offset += 8;
    return value;
  }

  readString(): string {
    const length = this.readUint32();
    const bytes = new Uint8Array(
      this.view.buffer,
      this.view.byteOffset + this.offset,
      length
    );
    this.offset += length;
    return new TextDecoder().decode(bytes);
  }

  readBytes(): Uint8Array {
    const length = this.readUint32();
    const data = new Uint8Array(
      this.view.buffer,
      this.view.byteOffset + this.offset,
      length
    );
    this.offset += length;
    return new Uint8Array(data); // copy to avoid referencing the original buffer
  }
}
