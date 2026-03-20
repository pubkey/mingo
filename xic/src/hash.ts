/**
 * Fast hashing for tile data used in dictionary lookups and deduplication.
 * Uses FNV-1a for speed on binary data.
 */

/** FNV-1a hash of a Uint8Array, returned as hex string */
export function hashTileData(data: Uint8Array): string {
  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash ^= data[i];
    hash = (hash * 0x01000193) | 0;
  }
  // Convert to unsigned 32-bit, then hex
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Perceptual hash: downsample tile to 8x8, compute average luminance,
 * return 64-bit hash as hex string. Useful for finding "similar" tiles.
 */
export function perceptualHash(data: Uint8Array, tileSize: number): string {
  // Downsample to 8x8 grayscale
  const small = new Float64Array(64);
  const blockW = tileSize / 8;
  const blockH = tileSize / 8;

  for (let sy = 0; sy < 8; sy++) {
    for (let sx = 0; sx < 8; sx++) {
      let sum = 0;
      let count = 0;
      const startY = Math.floor(sy * blockH);
      const endY = Math.floor((sy + 1) * blockH);
      const startX = Math.floor(sx * blockW);
      const endX = Math.floor((sx + 1) * blockW);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * tileSize + x) * 4;
          // Luminance from RGB
          sum +=
            0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          count++;
        }
      }
      small[sy * 8 + sx] = count > 0 ? sum / count : 0;
    }
  }

  // Compute average
  let avg = 0;
  for (let i = 0; i < 64; i++) avg += small[i];
  avg /= 64;

  // Build hash: each bit = above/below average
  let hash = "";
  for (let i = 0; i < 64; i += 4) {
    let nibble = 0;
    for (let j = 0; j < 4 && i + j < 64; j++) {
      if (small[i + j] >= avg) nibble |= 1 << j;
    }
    hash += nibble.toString(16);
  }

  return hash;
}

/** Hamming distance between two hex hash strings */
export function hammingDistance(a: string, b: string): number {
  let dist = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const va = parseInt(a[i], 16);
    const vb = parseInt(b[i], 16);
    let xor = va ^ vb;
    while (xor) {
      dist += xor & 1;
      xor >>= 1;
    }
  }
  return dist;
}
