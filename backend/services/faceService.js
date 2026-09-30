/**
 * faceService.js
 * Server-side face descriptor comparison.
 * face-api.js descriptors are 128-float arrays.
 * We use Euclidean distance for comparison.
 */

const euclideanDistance = (a, b) => {
  if (!a || !b || a.length !== b.length) return 1;

  let sum = 0;

  for (let i = 0; i < a.length; i++) {
    sum += (Number(a[i]) - Number(b[i])) ** 2;
  }

  return Math.sqrt(sum);
};

/**
 * Convert different descriptor formats into a normal number array.
 *
 * Supports:
 * 1. Normal arrays
 * 2. JSON strings
 * 3. Objects with numeric keys
 * 4. Typed arrays such as Float32Array
 */
const normalizeDescriptor = (descriptor) => {
  if (!descriptor) return null;

  // Normal JavaScript array
  if (Array.isArray(descriptor)) {
    return descriptor.map(Number);
  }

  // Typed array such as Float32Array
  if (ArrayBuffer.isView(descriptor)) {
    return Array.from(descriptor, Number);
  }

  // JSON string
  if (typeof descriptor === 'string') {
    try {
      const parsed = JSON.parse(descriptor);
      return normalizeDescriptor(parsed);
    } catch (err) {
      console.error(
        '[faceService] Failed to parse descriptor string:',
        err.message
      );
      return null;
    }
  }

  // Object with numeric keys:
  // { 0: -0.07, 1: 0.08, 2: 0.01, ... }
  if (typeof descriptor === 'object') {
    const keys = Object.keys(descriptor);

    const numericKeys = keys
      .filter((key) => /^\d+$/.test(key))
      .sort((a, b) => Number(a) - Number(b));

    if (numericKeys.length > 0) {
      return numericKeys.map((key) => Number(descriptor[key]));
    }
  }

  return null;
};

/**
 * Compare a stored descriptor against a live descriptor.
 */
const compareFaceDescriptors = (
  storedDescriptor,
  liveDescriptor,
  threshold = 0.5
) => {
  const stored = normalizeDescriptor(storedDescriptor);
  const live = normalizeDescriptor(liveDescriptor);

  if (!stored || !live) {
    console.error('[faceService] Invalid face descriptor format');

    return {
      match: false,
      distance: 1,
      confidence: '0%',
    };
  }

  if (stored.length !== 128 || live.length !== 128) {
    console.error(
      '[faceService] Invalid descriptor length:',
      {
        stored: stored.length,
        live: live.length,
      }
    );

    return {
      match: false,
      distance: 1,
      confidence: '0%',
    };
  }

  const distance = euclideanDistance(stored, live);

  const match = distance <= threshold;

  const confidence =
    `${Math.max(0, Math.round((1 - distance) * 100))}%`;

  return {
    match,
    distance: parseFloat(distance.toFixed(4)),
    confidence,
  };
};

module.exports = {
  compareFaceDescriptors,
};