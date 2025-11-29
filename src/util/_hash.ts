type FeedHandler = (h: number, v: unknown) => number;

// Scratch buffer for numbers
const numBuf = new ArrayBuffer(8);
const numView = new DataView(numBuf);
const numBytes = new Uint8Array(numBuf);

// MurmurHash3 core (x86_32)
const murmurHash3 = (buf: Uint8Array, seed: number): number => {
  let h = seed >>> 0;
  const c1 = 0xcc9e2d51,
    c2 = 0x1b873593;
  const len = buf.length;
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  let i = 0;
  for (; i + 4 <= len; i += 4) {
    let k = view.getUint32(i, true);
    k = Math.imul(k, c1);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, c2);
    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = Math.imul(h, 5) + 0xe6546b64;
  }

  /* eslint-disable no-fallthrough */
  let k1 = 0;
  switch (len & 3) {
    case 3:
      k1 ^= buf[i + 2] << 16;
    case 2:
      k1 ^= buf[i + 1] << 8;
    case 1:
      k1 ^= buf[i];
      k1 = Math.imul(k1, c1);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, c2);
      h ^= k1;
  }

  h ^= len;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
};

// Indirection helper
const feedBytes = (h: number, bytes: Uint8Array): number =>
  murmurHash3(bytes, h);

// Reusable single‑byte buffer
const singleByte = new Uint8Array(1);
const feedByte = (h: number, b: number): number => {
  singleByte[0] = b;
  return feedBytes(h, singleByte);
};

// String encoding
const enc: TextEncoder | null =
  typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
const encodeString: (s: string) => Uint8Array = enc
  ? (s: string) => enc.encode(s)
  : (s: string) => {
      const buf = new Uint8Array(s.length);
      for (let i = 0; i < s.length; i++) buf[i] = s.charCodeAt(i);
      return buf;
    };

// Number encoding
const encodeNumber = (n: number): Uint8Array => {
  numView.setFloat64(0, n, true);
  return numBytes;
};

// Tag codes (ASCII)
const TAG = {
  null: 48, // '0'
  undefined: 85, // 'U'
  boolean: 66, // 'B'
  number: 78, // 'N'
  string: 83, // 'S'
  bigint: 71, // 'G'
  symbol: 89, // 'Y'
  function: 70, // 'F'
  cycle: 88, // 'X'
  array: 65, // 'A'
  object: 79, // 'O'
  date: 68, // 'D'
  regexp: 82 // 'R'
};

// Handlers with nested feed calls
const feedNull: FeedHandler = h => feedByte(h, TAG.null);
const feedUndefined: FeedHandler = h => feedByte(h, TAG.undefined);

const feedBoolean: FeedHandler = (h, v) =>
  feedByte(feedByte(h, TAG.boolean), (v as boolean) ? 1 : 0);

const feedNumber: FeedHandler = (h, v) =>
  feedBytes(feedByte(h, TAG.number), encodeNumber(v as number));

const feedString: FeedHandler = (h, v) =>
  feedBytes(feedByte(h, TAG.string), encodeString(v as string));

const feedBigInt: FeedHandler = (h, v) => {
  let x = v as bigint;
  h = feedByte(feedByte(h, TAG.bigint), x >= 0n ? 1 : 2);
  if (x < 0n) x = -x;
  if (x === 0n) return feedByte(h, 0);
  while (x > 0n) {
    h = feedByte(h, Number(x & 0xffn));
    x >>= 8n;
  }
  return h;
};

const feedSymbol: FeedHandler = (h, v) =>
  feedString(feedByte(h, TAG.symbol), (v as symbol).description || "");

const feedFunction: FeedHandler = (h, v) => {
  const fn = v as (...args: unknown[]) => unknown;
  h = feedString(feedByte(h, TAG.function), fn.name || "");
  return feedString(feedNumber(h, fn.length), fn.toString());
};

export function hashCode(value: unknown): number {
  const seen: WeakMap<object, number> = new WeakMap();
  let nextId = 1;

  const feedObject: FeedHandler = (h, v) => {
    const obj = v as object;
    const existingId = seen.get(obj);
    if (existingId) {
      return feedNumber(feedByte(h, TAG.cycle), existingId);
    }
    seen.set(obj, nextId++);

    if (Array.isArray(obj)) {
      h = feedByte(h, TAG.array);
      for (let i = 0; i < obj.length; i++) {
        h = feed(feedNumber(h, i), obj[i]);
      }
      return h;
    }

    if (ArrayBuffer.isView(obj) && !(obj instanceof DataView)) {
      const bytes = new Uint8Array(obj.buffer, obj.byteOffset, obj.byteLength);
      return feedBytes(feedByte(h, TAG.array), bytes);
    }

    if (obj instanceof Date) {
      return feedNumber(feedByte(h, TAG.date), obj.getTime());
    }

    if (obj instanceof RegExp) {
      h = feedString(feedByte(h, TAG.regexp), obj.source);
      return feedString(h, obj.flags);
    }

    h = feed(feedByte(h, TAG.object), obj.constructor);
    const keys = Object.keys(obj).sort();
    for (const k of keys) {
      h = feed(feedString(h, k), obj[k]);
    }
    return h;
  };

  const handlers: Record<string, FeedHandler> = {
    null: feedNull,
    undefined: feedUndefined,
    boolean: feedBoolean,
    number: feedNumber,
    string: feedString,
    bigint: feedBigInt,
    symbol: feedSymbol,
    function: feedFunction,
    object: feedObject
  };

  const feed = (h: number, v: unknown): number => {
    const t = v === null ? "null" : typeof v;
    const handler = handlers[t];
    return handler ? handler(h, v) : h;
  };

  return feed(0, value) >>> 0;
}
