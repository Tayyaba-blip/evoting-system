import { useEffect, useRef, useState, useCallback } from 'react';
import { loadModels, getDescriptor, compareDescriptors, drawDetections } from '../utils/faceUtils';

const useFaceRecognition = ({ storedDescriptor, onMismatch, onMatch, intervalMs = 3000, threshold = 0.5 }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const countdownRef = useRef(null);

  const [faceMatch, setFaceMatch] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    loadModels().then(() => setModelsReady(true)).catch(console.error);
    return () => stopCamera();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    clearInterval(checkIntervalRef.current);
    clearInterval(countdownRef.current);
    setCameraActive(false);
  }, []);

  const triggerCountdown = useCallback(() => {
    if (countdownRef.current) return;
    let count = 15;
    setCountdown(count);
    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCountdown(null);
        onMismatch?.();
      }
    }, 1000);
  }, [onMismatch]);

  const clearCountdown = useCallback(() => {
    clearInterval(countdownRef.current);
    countdownRef.current = null;
    setCountdown(null);
  }, []);

  useEffect(() => {
    if (!modelsReady || !cameraActive || !storedDescriptor) return;

    checkIntervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;
      const detected = await drawDetections(videoRef.current, canvasRef.current);
      setFaceDetected(!!detected);

      if (!detected) { triggerCountdown(); return; }
      const liveDescriptor = await getDescriptor(videoRef.current);
      if (!liveDescriptor) { triggerCountdown(); return; }

      const result = compareDescriptors(storedDescriptor, liveDescriptor, threshold);
      setFaceMatch(result.match);

      if (result.match) {
        clearCountdown();
        onMatch?.();
      } else {
        triggerCountdown();
      }
    }, intervalMs);

    return () => clearInterval(checkIntervalRef.current);
  }, [modelsReady, cameraActive, storedDescriptor, intervalMs, threshold, triggerCountdown, clearCountdown, onMatch]);

  const captureDescriptor = useCallback(async () => {
    if (!videoRef.current || !modelsReady) return null;
    return await getDescriptor(videoRef.current);
  }, [modelsReady]);

  return { videoRef, canvasRef, faceMatch, countdown, modelsReady, cameraActive, faceDetected, startCamera, stopCamera, captureDescriptor };
};

export default useFaceRecognition;