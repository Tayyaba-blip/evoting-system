/**
 * faceService.js
 * Server-side face descriptor comparison.
 * face-api.js descriptors are 128-float arrays.
 * We use Euclidean distance — threshold 0.5 is standard.
 */

/**
 * Euclidean distance between two 128-float descriptor arrays.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
const euclideanDistance = (a, b) => {
  if (!a || !b || a.length !== b.length) return 1;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
};

/**
 * Compare a stored descriptor against a live one.
 * @param {number[]} storedDescriptor  - from MongoDB (stored at signup)
 * @param {number[]} liveDescriptor    - from the login/voting request body
 * @param {number}   threshold         - default 0.5 (lower = stricter)
 * @returns {{ match: boolean, distance: number, confidence: string }}
 */
const compareFaceDescriptors = (storedDescriptor, liveDescriptor, threshold = 0.5) => {
  if (!storedDescriptor || !liveDescriptor) {
    return { match: false, distance: 1, confidence: '0%' };
  }

  // Accept both plain arrays and JSON strings
  const stored = Array.isArray(storedDescriptor)
    ? storedDescriptor
    : JSON.parse(storedDescriptor);

  const live = Array.isArray(liveDescriptor)
    ? liveDescriptor
    : JSON.parse(liveDescriptor);

  const distance   = euclideanDistance(stored, live);
  const match      = distance <= threshold;
  const confidence = `${Math.max(0, Math.round((1 - distance) * 100))}%`;

  return { match, distance: parseFloat(distance.toFixed(4)), confidence };
};

module.exports = { compareFaceDescriptors };