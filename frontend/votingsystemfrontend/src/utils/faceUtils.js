import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return;
  const MODEL_URL = '/models';
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log('✅ Face API models loaded');
  } catch (err) {
    console.error('❌ Failed to load face models:', err);
    throw new Error('Face recognition models could not be loaded. Place model files in /public/models/');
  }
};

export const detectFace = async (videoOrCanvas) => {
  try {
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
    const detection = await faceapi
      .detectSingleFace(videoOrCanvas, options)
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection || null;
  } catch (err) {
    return null;
  }
};

export const getDescriptor = async (videoEl) => {
  const detection = await detectFace(videoEl);
  if (!detection) return null;
  return Array.from(detection.descriptor);
};

export const compareDescriptors = (stored, live, threshold = 0.5) => {
  if (!stored || !live || stored.length !== live.length) return { match: false, distance: Infinity };
  const a = new Float32Array(stored);
  const b = new Float32Array(live);
  const distance = faceapi.euclideanDistance(a, b);
  return { match: distance < threshold, distance: parseFloat(distance.toFixed(4)) };
};

export const drawDetections = async (videoEl, canvasEl) => {
  if (!videoEl || !canvasEl) return;
  const dims = faceapi.matchDimensions(canvasEl, videoEl, true);
  const detection = await detectFace(videoEl);
  canvasEl.getContext('2d').clearRect(0, 0, canvasEl.width, canvasEl.height);
  if (detection) {
    const resized = faceapi.resizeResults(detection, dims);
    faceapi.draw.drawDetections(canvasEl, resized);
    faceapi.draw.drawFaceLandmarks(canvasEl, resized);
  }
  return !!detection;
};