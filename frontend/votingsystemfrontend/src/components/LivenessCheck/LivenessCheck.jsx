import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { loadFaceModels } from '../../utils/faceUtils';
import styles from './LivenessCheck.module.css';

/**
 * LivenessCheck — blink-based liveness detection gate.
 *
 * Uses Eye Aspect Ratio (EAR) on the 68 facial landmarks already
 * provided by face-api.js's FaceLandmark68Net (no extra models needed).
 *
 * Reference: Soukupová & Čech, "Real-Time Eye Blink Detection using
 * Facial Landmarks" (2016).
 *
 * Props:
 *   onPassed   fn()   — called once a genuine blink is detected
 *   onFail     fn()   — called if the timeout expires with no blink
 *   timeoutMs  number — how long to wait for a blink (default 8000)
 */
const EAR_CLOSED_THRESHOLD = 0.21; // eye considered "closed" below this
const EAR_OPEN_THRESHOLD   = 0.25; // eye considered "open" above this
const CHECK_INTERVAL_MS    = 120;  // how often to sample a frame

const LivenessCheck = ({ onPassed, onFail = null, onRetry = null, timeoutMs = 8000 }) => {
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef  = useRef(null);
  const blinkPhase  = useRef('waiting-open'); // 'waiting-open' -> 'waiting-closed' -> done

  const [status, setStatus]   = useState('loading'); // loading | ready | checking | passed | failed
  const [message, setMessage] = useState('Loading liveness check...');
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(timeoutMs / 1000));

  const eyeAspectRatio = (eye) => {
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const vertical1 = dist(eye[1], eye[5]);
    const vertical2 = dist(eye[2], eye[4]);
    const horizontal = dist(eye[0], eye[3]);
    return (vertical1 + vertical2) / (2.0 * horizontal);
  };

  const stopAll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearInterval(timeoutRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const checkFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
      .withFaceLandmarks();

    if (!detection) {
      setMessage('No face detected — please center your face');
      return;
    }

    const leftEAR  = eyeAspectRatio(detection.landmarks.getLeftEye());
    const rightEAR = eyeAspectRatio(detection.landmarks.getRightEye());
    const avgEAR   = (leftEAR + rightEAR) / 2;

    // State machine: must see eyes OPEN, then CLOSED, then OPEN again = one genuine blink
    if (blinkPhase.current === 'waiting-open' && avgEAR > EAR_OPEN_THRESHOLD) {
      blinkPhase.current = 'waiting-closed';
      setMessage('Good — now blink naturally');
    } else if (blinkPhase.current === 'waiting-closed' && avgEAR < EAR_CLOSED_THRESHOLD) {
      blinkPhase.current = 'waiting-reopen';
    } else if (blinkPhase.current === 'waiting-reopen' && avgEAR > EAR_OPEN_THRESHOLD) {
      // Full blink cycle completed — liveness confirmed
      blinkPhase.current = 'done';
      setStatus('passed');
      setMessage('✅ Liveness confirmed — real face detected');
      stopAll();
      onPassed?.();
    }
  }, [onPassed, stopAll]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setStatus('loading');
        setMessage('Loading face models...');
        await loadFaceModels();
        if (!mounted) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (!mounted) return;

        setStatus('checking');
        setMessage('Please look at the camera, then blink naturally');
        blinkPhase.current = 'waiting-open';

        intervalRef.current = setInterval(() => {
          if (mounted) checkFrame();
        }, CHECK_INTERVAL_MS);

        let remaining = Math.ceil(timeoutMs / 1000);
        timeoutRef.current = setInterval(() => {
          remaining -= 1;
          setSecondsLeft(remaining);
          if (remaining <= 0) {
            stopAll();
            if (mounted) {
              setStatus('failed');
              setMessage('⚠️ No blink detected in time. Please try again.');
              onFail?.();
            }
          }
        }, 1000);
      } catch (err) {
        if (mounted) {
          setStatus('failed');
          setMessage('Camera error: ' + err.message);
        }
      }
    };

    init();
    return () => { mounted = false; stopAll(); };
  }, [checkFrame, stopAll, onFail, timeoutMs]);

  const handleRetry = () => {
    onRetry?.();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.viewport}>
        <video ref={videoRef} className={styles.video} muted playsInline autoPlay />
        {status === 'checking' && (
          <div className={styles.timerBadge}>{secondsLeft}s</div>
        )}
      </div>
      <div className={`${styles.statusBar} ${styles[status] || ''}`}>
        {message}
      </div>
      {status === 'failed' && (
        <button className={styles.retryBtn} onClick={handleRetry}>🔄 Retry Liveness Check</button>
      )}
    </div>
  );
};

export default LivenessCheck;