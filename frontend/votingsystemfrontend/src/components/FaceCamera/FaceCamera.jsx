import { useEffect, useRef, useState } from 'react';
import { loadModels, getDescriptor, drawDetections } from '../../utils/faceUtils';
import styles from './FaceCamera.module.css';

const FaceCamera = ({ onCapture, mode = 'capture', label = 'Position your face in the frame', showOverlay = true }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [faceVisible, setFaceVisible] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        setStatus('loading');
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStatus('ready');
          startDetectionLoop();
        }
      } catch (err) {
        if (mounted) {
          setError(err.message.includes('models') ? 'Face models not found. Check /public/models/ folder.' : 'Camera access denied. Please allow camera permissions.');
          setStatus('error');
        }
      }
    };
    init();
    return () => {
      mounted = false;
      stopCamera();
    };
  }, []);

  const startDetectionLoop = () => {
    const loop = async () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const detected = await drawDetections(videoRef.current, canvasRef.current);
        setFaceVisible(!!detected);
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  };

  const stopCamera = () => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const handleCapture = async () => {
    if (!videoRef.current || !faceVisible) return;
    setCapturing(true);
    try {
      const descriptor = await getDescriptor(videoRef.current);
      if (!descriptor) { setError('No face detected. Please look directly at the camera.'); setCapturing(false); return; }
      setCaptured(true);
      onCapture?.(descriptor);
    } catch (err) {
      setError('Capture failed. Please try again.');
    }
    setCapturing(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}</div>

      <div className={`${styles.cameraBox} ${faceVisible ? styles.faceDetected : ''} ${captured ? styles.captureSuccess : ''}`}>
        {status === 'loading' && (
          <div className={styles.overlay}>
            <div className={styles.spinner} />
            <p>Initializing camera & AI models...</p>
          </div>
        )}
        {status === 'error' && (
          <div className={styles.overlay}>
            <span className={styles.errorIcon}>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <video ref={videoRef} className={styles.video} muted playsInline autoPlay />
        <canvas ref={canvasRef} className={styles.canvas} />

        {showOverlay && status === 'ready' && (
          <div className={styles.faceOverlay}>
            <div className={`${styles.faceFrame} ${faceVisible ? styles.frameDetected : ''}`} />
          </div>
        )}

        {status === 'ready' && (
          <div className={styles.statusBar}>
            <div className={`${styles.statusDot} ${faceVisible ? styles.dotGreen : styles.dotRed}`} />
            <span>{faceVisible ? 'Face detected' : 'No face detected'}</span>
          </div>
        )}

        {captured && (
          <div className={styles.successBanner}>
            ✅ Face captured successfully!
          </div>
        )}
      </div>

      {mode === 'capture' && status === 'ready' && !captured && (
        <button
          className={`${styles.captureBtn} ${!faceVisible ? styles.disabled : ''}`}
          onClick={handleCapture}
          disabled={!faceVisible || capturing}
        >
          {capturing ? (
            <><div className={styles.btnSpinner} /> Processing...</>
          ) : (
            <><span>📸</span> {faceVisible ? 'Capture Face' : 'Position face first'}</>
          )}
        </button>
      )}
    </div>
  );
};

export default FaceCamera;