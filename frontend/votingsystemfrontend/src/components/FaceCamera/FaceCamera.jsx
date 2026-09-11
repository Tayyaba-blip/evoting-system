// import { useEffect, useRef, useState } from 'react';
// import { loadModels, getDescriptor, drawDetections } from '../../utils/faceUtils';
// import styles from './FaceCamera.module.css';

// const FaceCamera = ({ onCapture, mode = 'capture', label = 'Position your face in the frame', showOverlay = true }) => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);
//   const animRef = useRef(null);
//   const [status, setStatus] = useState('loading');
//   const [faceVisible, setFaceVisible] = useState(false);
//   const [capturing, setCapturing] = useState(false);
//   const [captured, setCaptured] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     let mounted = true;
//     const init = async () => {
//       try {
//         setStatus('loading');
//         await loadModels();
//         const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
//         if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
//         streamRef.current = stream;
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           await videoRef.current.play();
//           setStatus('ready');
//           startDetectionLoop();
//         }
//       } catch (err) {
//         if (mounted) {
//           setError(err.message.includes('models') ? 'Face models not found. Check /public/models/ folder.' : 'Camera access denied. Please allow camera permissions.');
//           setStatus('error');
//         }
//       }
//     };
//     init();
//     return () => {
//       mounted = false;
//       stopCamera();
//     };
//   }, []);

//   const startDetectionLoop = () => {
//     const loop = async () => {
//       if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
//         const detected = await drawDetections(videoRef.current, canvasRef.current);
//         setFaceVisible(!!detected);
//       }
//       animRef.current = requestAnimationFrame(loop);
//     };
//     animRef.current = requestAnimationFrame(loop);
//   };

//   const stopCamera = () => {
//     cancelAnimationFrame(animRef.current);
//     streamRef.current?.getTracks().forEach(t => t.stop());
//   };

//   const handleCapture = async () => {
//     if (!videoRef.current || !faceVisible) return;
//     setCapturing(true);
//     try {
//       const descriptor = await getDescriptor(videoRef.current);
//       if (!descriptor) { setError('No face detected. Please look directly at the camera.'); setCapturing(false); return; }
//       setCaptured(true);
//       onCapture?.(descriptor);
//     } catch (err) {
//       setError('Capture failed. Please try again.');
//     }
//     setCapturing(false);
//   };

//   return (
//     <div className={styles.container}>
//       <div className={styles.label}>{label}</div>

//       <div className={`${styles.cameraBox} ${faceVisible ? styles.faceDetected : ''} ${captured ? styles.captureSuccess : ''}`}>
//         {status === 'loading' && (
//           <div className={styles.overlay}>
//             <div className={styles.spinner} />
//             <p>Initializing camera & AI models...</p>
//           </div>
//         )}
//         {status === 'error' && (
//           <div className={styles.overlay}>
//             <span className={styles.errorIcon}>⚠️</span>
//             <p>{error}</p>
//           </div>
//         )}

//         <video ref={videoRef} className={styles.video} muted playsInline autoPlay />
//         <canvas ref={canvasRef} className={styles.canvas} />

//         {showOverlay && status === 'ready' && (
//           <div className={styles.faceOverlay}>
//             <div className={`${styles.faceFrame} ${faceVisible ? styles.frameDetected : ''}`} />
//           </div>
//         )}

//         {status === 'ready' && (
//           <div className={styles.statusBar}>
//             <div className={`${styles.statusDot} ${faceVisible ? styles.dotGreen : styles.dotRed}`} />
//             <span>{faceVisible ? 'Face detected' : 'No face detected'}</span>
//           </div>
//         )}

//         {captured && (
//           <div className={styles.successBanner}>
//             ✅ Face captured successfully!
//           </div>
//         )}
//       </div>

//       {mode === 'capture' && status === 'ready' && !captured && (
//         <button
//           className={`${styles.captureBtn} ${!faceVisible ? styles.disabled : ''}`}
//           onClick={handleCapture}
//           disabled={!faceVisible || capturing}
//         >
//           {capturing ? (
//             <><div className={styles.btnSpinner} /> Processing...</>
//           ) : (
//             <><span>📸</span> {faceVisible ? 'Capture Face' : 'Position face first'}</>
//           )}
//         </button>
//       )}
//     </div>
//   );
// };

// export default FaceCamera;

import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { loadFaceModels, getFaceDescriptor, compareFaceDescriptors } from '../../utils/faceUtils';
import styles from './FaceCamera.module.css';

/**
 * FaceCamera — multi-mode face recognition component
 *
 * Props:
 *  mode             'capture'  | 'verify'   | 'continuous'
 *  storedDescriptor number[]   — stored descriptor from DB (needed for verify/continuous)
 *  onCapture        fn(Float32Array) — called when descriptor is captured (capture mode)
 *  onMatch          fn(boolean)      — called with match result (verify/continuous mode)
 *  onNoFace         fn()             — called when no face is detected for > 3s (continuous)
 *  label            string           — optional instruction label
 *  compact          boolean          — smaller layout for dashboard/voting page
 *
 * Modes:
 *  'capture'    — used on Signup: captures face descriptor and returns it via onCapture
 *  'verify'     — used on Login: single-shot compare, calls onMatch(true/false)
 *  'continuous' — used on VoterDashboard/VotingPage: keeps checking every 2s,
 *                 calls onMatch every interval, calls onNoFace if no face for 3s
 */
const FaceCamera = ({
  mode = 'continuous',
  storedDescriptor = null,
  onCapture = null,
  onMatch = null,
  onNoFace = null,
  label = '',
  compact = false,
}) => {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const intervalRef = useRef(null);
  const noFaceCountRef = useRef(0);

  const [status, setStatus]         = useState('loading'); // loading | ready | detecting | match | nomatch | captured | error | noface
  const [message, setMessage]       = useState('Loading face recognition...');
  const [captured, setCaptured]     = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const TARGET_CAPTURES = 1; // how many captures needed in capture mode

  // ── Start camera ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('[FaceCamera] Camera error:', err);
      setStatus('error');
      setMessage('Camera access denied. Please allow camera permissions and refresh.');
    }
  }, []);

  // ── Stop camera + interval ─────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // ── Draw detections on canvas overlay ────────────────────────────────────
  const drawBox = useCallback((detection) => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video || !detection) return;
    const dims = faceapi.matchDimensions(canvas, video, true);
    const resized = faceapi.resizeResults(detection, dims);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw box
    const box = resized.detection.box;
    const isMatch = status === 'match';
    ctx.strokeStyle = isMatch ? '#22c55e' : status === 'nomatch' ? '#ef4444' : '#facc15';
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    // Corner accents
    const len = 20;
    ctx.strokeStyle = isMatch ? '#22c55e' : '#ffffff';
    ctx.lineWidth = 4;
    // Top-left
    ctx.beginPath(); ctx.moveTo(box.x, box.y + len); ctx.lineTo(box.x, box.y); ctx.lineTo(box.x + len, box.y); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(box.x + box.width - len, box.y); ctx.lineTo(box.x + box.width, box.y); ctx.lineTo(box.x + box.width, box.y + len); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(box.x, box.y + box.height - len); ctx.lineTo(box.x, box.y + box.height); ctx.lineTo(box.x + len, box.y + box.height); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(box.x + box.width - len, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height - len); ctx.stroke();
  }, [status]);

  // ── Single detect frame ───────────────────────────────────────────────────
  const detectFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    // ── No face detected ────────────────────────────────────────────────────
    if (!detection) {
      noFaceCountRef.current += 1;
      setStatus('noface');
      setMessage('No face detected — please look at the camera');

      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

      // After 3 consecutive misses (~3s at 1s interval) call onNoFace
      if (noFaceCountRef.current >= 3 && onNoFace) onNoFace();
      return;
    }

    noFaceCountRef.current = 0;
    drawBox(detection);

    // ── CAPTURE mode ────────────────────────────────────────────────────────
    if (mode === 'capture') {
      setStatus('captured');
      setMessage('✅ Face captured successfully!');
      setCaptured(true);
      setCaptureCount((c) => c + 1);
      if (onCapture) onCapture(detection.descriptor);
      // Stop the continuous interval after capture
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }

    // ── VERIFY / CONTINUOUS mode ────────────────────────────────────────────
if (mode !== 'capture' && (!storedDescriptor || storedDescriptor.length === 0)) {
  // No stored descriptor — never auto-pass; fail closed
      setStatus('nomatch');
      setMessage('⚠️ No registered face on file.');
      if (onMatch) onMatch(false);
      return;
    }

    setStatus('detecting');
    setMessage('Verifying identity...');

    const { match, distance } = compareFaceDescriptors(storedDescriptor, detection.descriptor);

    if (match) {
      setStatus('match');
      setMessage(`✅ Identity verified (${(( 1 - distance) * 100).toFixed(0)}% match)`);
      if (onMatch) onMatch(true);
    } else {
      setStatus('nomatch');
      setMessage(`⚠️ Face not recognised (${(distance * 100).toFixed(0)}% distance)`);
      if (onMatch) onMatch(false);
    }
  }, [mode, storedDescriptor, onCapture, onMatch, onNoFace, drawBox]);

  // ── Boot: load models → start camera → start interval ────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setStatus('loading');
        setMessage('Loading face recognition models...');
        await loadFaceModels();
        if (!mounted) return;

        setMessage('Starting camera...');
        await startCamera();
        if (!mounted) return;

        setStatus('ready');
        setMessage('Position your face in the frame');

        // In capture mode: detect once per second until captured
        // In verify mode: detect once then stop
        // In continuous: keep detecting every 1.5s
        const interval = mode === 'verify' ? 500 : 1500;
        intervalRef.current = setInterval(() => {
          if (mounted) detectFrame();
        }, interval);

      } catch (err) {
        if (mounted) {
          setStatus('error');
          setMessage(err.message || 'Failed to initialise face recognition.');
        }
      }
    };

    init();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Manual re-capture button ──────────────────────────────────────────────
  const handleRecapture = () => {
    setCaptured(false);
    setStatus('ready');
    setMessage('Position your face in the frame');
    // Restart interval
    if (!intervalRef.current) {
      intervalRef.current = setInterval(detectFrame, 1000);
    }
  };

  // ── Status colour ─────────────────────────────────────────────────────────
  const statusColor = {
    loading:   '#6b7280',
    ready:     '#6b7280',
    detecting: '#facc15',
    match:     '#22c55e',
    nomatch:   '#ef4444',
    captured:  '#22c55e',
    noface:    '#f97316',
    error:     '#ef4444',
  }[status] || '#6b7280';

  return (
    <div className={`${styles.wrapper} ${compact ? styles.compact : ''}`}>
      {/* Camera viewport */}
      <div className={styles.viewport}>
        <video
          ref={videoRef}
          className={styles.video}
          muted
          playsInline
          autoPlay
        />
        <canvas ref={canvasRef} className={styles.canvas} />

        {/* Status overlay */}
        <div className={styles.statusBar} style={{ background: `${statusColor}22`, borderColor: statusColor }}>
          <span className={styles.statusDot} style={{ background: statusColor }} />
          <span className={styles.statusText}>{message}</span>
        </div>

        {/* Scanning animation — only when detecting/ready */}
        {(status === 'ready' || status === 'detecting') && (
          <div className={styles.scanLine} />
        )}
      </div>

      {/* Label */}
      {label && <p className={styles.label}>{label}</p>}

      {/* Capture mode: recapture button */}
      {mode === 'capture' && captured && (
        <button className={styles.recaptureBtn} onClick={handleRecapture}>
          🔄 Retake
        </button>
      )}

      {/* Capture mode: capture button (manual trigger) */}
      {mode === 'capture' && !captured && status === 'ready' && (
        <button className={styles.captureBtn} onClick={detectFrame}>
          📸 Capture Face
        </button>
      )}
    </div>
  );
};

export default FaceCamera;