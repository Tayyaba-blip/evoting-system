// import * as faceapi from 'face-api.js';

// let modelsLoaded = false;

// export const loadModels = async () => {
//   if (modelsLoaded) return;
//   const MODEL_URL = '/models';
//   try {
//     await Promise.all([
//       faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
//       faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
//       faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
//     ]);
//     modelsLoaded = true;
//     console.log('✅ Face API models loaded');
//   } catch (err) {
//     console.error('❌ Failed to load face models:', err);
//     throw new Error('Face recognition models could not be loaded. Place model files in /public/models/');
//   }
// };

// export const detectFace = async (videoOrCanvas) => {
//   try {
//     const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
//     const detection = await faceapi
//       .detectSingleFace(videoOrCanvas, options)
//       .withFaceLandmarks()
//       .withFaceDescriptor();
//     return detection || null;
//   } catch (err) {
//     return null;
//   }
// };

// export const getDescriptor = async (videoEl) => {
//   const detection = await detectFace(videoEl);
//   if (!detection) return null;
//   return Array.from(detection.descriptor);
// };

// export const compareDescriptors = (stored, live, threshold = 0.5) => {
//   if (!stored || !live || stored.length !== live.length) return { match: false, distance: Infinity };
//   const a = new Float32Array(stored);
//   const b = new Float32Array(live);
//   const distance = faceapi.euclideanDistance(a, b);
//   return { match: distance < threshold, distance: parseFloat(distance.toFixed(4)) };
// };

// export const drawDetections = async (videoEl, canvasEl) => {
//   if (!videoEl || !canvasEl) return;
//   const dims = faceapi.matchDimensions(canvasEl, videoEl, true);
//   const detection = await detectFace(videoEl);
//   canvasEl.getContext('2d').clearRect(0, 0, canvasEl.width, canvasEl.height);
//   if (detection) {
//     const resized = faceapi.resizeResults(detection, dims);
//     faceapi.draw.drawDetections(canvasEl, resized);
//     faceapi.draw.drawFaceLandmarks(canvasEl, resized);
//   }
//   return !!detection;
// };

import * as faceapi from 'face-api.js';

// Path where face-api.js model files live in public/
const MODEL_URL = '/models';

let modelsLoaded = false;

/**
 * Load all required face-api.js models once.
 * Safe to call multiple times — skips if already loaded.
 */
export const loadFaceModels = async () => {
  if (modelsLoaded) return;
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log('[faceUtils] Models loaded ✅');
  } catch (err) {
    console.error('[faceUtils] Failed to load models:', err);
    throw new Error('Failed to load face recognition models. Make sure model files are in /public/models/');
  }
};

/**
 * Detect a single face in a video element and return its 128-float descriptor.
 * Returns null if no face is detected.
 * @param {HTMLVideoElement} videoEl
 * @returns {Float32Array | null}
 */
export const getFaceDescriptor = async (videoEl) => {
  if (!videoEl) return null;
  const detection = await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection ? detection.descriptor : null;
};

/**
 * Compare a live descriptor against a stored one.
 * Uses Euclidean distance — threshold 0.5 is standard for face-api.js.
 * @param {number[] | Float32Array} stored  - stored descriptor from MongoDB
 * @param {Float32Array | number[]} live    - live descriptor from camera
 * @param {number} threshold                - lower = stricter (default 0.5)
 * @returns {{ match: boolean, distance: number }}
 */
export const compareFaceDescriptors = (stored, live, threshold = 0.5) => {
  if (!stored || !live) return { match: false, distance: 1 };
  const a = new Float32Array(stored);
  const b = new Float32Array(live);
  const distance = faceapi.euclideanDistance(a, b);
  return { match: distance <= threshold, distance: parseFloat(distance.toFixed(4)) };
};

/**
 * Draw face detection box on a canvas overlay.
 * @param {HTMLVideoElement} videoEl
 * @param {HTMLCanvasElement} canvasEl
 * @param {object | null} detection - faceapi detection result
 */
export const drawDetectionBox = (videoEl, canvasEl, detection) => {
  if (!canvasEl || !videoEl) return;
  const dims = faceapi.matchDimensions(canvasEl, videoEl, true);
  faceapi.draw.drawDetections(canvasEl, faceapi.resizeResults(detection, dims));
};