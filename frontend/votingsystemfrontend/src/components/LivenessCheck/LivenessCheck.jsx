import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import * as faceapi from 'face-api.js';

import {
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  ScanFace,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';

import { loadFaceModels } from '../../utils/faceUtils';

import styles from './LivenessCheck.module.css';


/* ========================================
   SETTINGS
======================================== */

const EAR_CLOSED_THRESHOLD = 0.21;
const EAR_OPEN_THRESHOLD = 0.25;
const CHECK_INTERVAL_MS = 120;


/* ========================================
   COMPONENT
======================================== */

const LivenessCheck = ({
  onPassed,
  onFail = null,
  onRetry = null,
  timeoutMs = 8000,
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const blinkPhase = useRef('waiting-open');

  const [status, setStatus] =
    useState('loading');

  const [message, setMessage] =
    useState('Loading liveness check...');

  const [secondsLeft, setSecondsLeft] =
    useState(
      Math.ceil(timeoutMs / 1000)
    );


  /* ========================================
     EYE ASPECT RATIO
  ======================================== */

  const eyeAspectRatio = (eye) => {
    const dist = (a, b) =>
      Math.hypot(
        a.x - b.x,
        a.y - b.y
      );

    const vertical1 = dist(
      eye[1],
      eye[5]
    );

    const vertical2 = dist(
      eye[2],
      eye[4]
    );

    const horizontal = dist(
      eye[0],
      eye[3]
    );

    return (
      (vertical1 + vertical2) /
      (2.0 * horizontal)
    );
  };


  /* ========================================
     STOP EVERYTHING
  ======================================== */

  const stopAll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(
        intervalRef.current
      );

      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearInterval(
        timeoutRef.current
      );

      timeoutRef.current = null;
    }

    streamRef.current
      ?.getTracks()
      .forEach((track) =>
        track.stop()
      );

    streamRef.current = null;
  }, []);


  /* ========================================
     CHECK FRAME
  ======================================== */

  const checkFrame =
    useCallback(async () => {
      const video = videoRef.current;

      if (
        !video ||
        video.readyState < 2
      ) {
        return;
      }

      try {
        const detection =
          await faceapi
            .detectSingleFace(
              video,
              new faceapi
                .TinyFaceDetectorOptions({
                  inputSize: 224,
                  scoreThreshold: 0.5,
                })
            )
            .withFaceLandmarks();


        /* No face */

        if (!detection) {
          setMessage(
            'Center your face in the frame'
          );

          return;
        }


        /* Calculate eye ratio */

        const leftEAR =
          eyeAspectRatio(
            detection.landmarks
              .getLeftEye()
          );

        const rightEAR =
          eyeAspectRatio(
            detection.landmarks
              .getRightEye()
          );

        const avgEAR =
          (leftEAR + rightEAR) / 2;


        /* ==============================
           BLINK STATE MACHINE
        ============================== */

        if (
          blinkPhase.current ===
            'waiting-open' &&
          avgEAR >
            EAR_OPEN_THRESHOLD
        ) {
          blinkPhase.current =
            'waiting-closed';

          setMessage(
            'Face detected — blink naturally'
          );
        }

        else if (
          blinkPhase.current ===
            'waiting-closed' &&
          avgEAR <
            EAR_CLOSED_THRESHOLD
        ) {
          blinkPhase.current =
            'waiting-reopen';

          setMessage(
            'Blink detected — open your eyes'
          );
        }

        else if (
          blinkPhase.current ===
            'waiting-reopen' &&
          avgEAR >
            EAR_OPEN_THRESHOLD
        ) {
          blinkPhase.current =
            'done';

          setStatus('passed');

          setMessage(
            'Liveness confirmed'
          );

          stopAll();

          onPassed?.();
        }
      } catch (err) {
        console.error(
          '[LivenessCheck] Detection error:',
          err
        );
      }
    }, [onPassed, stopAll]);


  /* ========================================
     INITIALIZE
  ======================================== */

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setStatus('loading');

        setMessage(
          'Loading face models...'
        );

        setSecondsLeft(
          Math.ceil(
            timeoutMs / 1000
          )
        );

        await loadFaceModels();

        if (!mounted) return;


        /* Start camera */

        const stream =
          await navigator.mediaDevices
            .getUserMedia({
              video: {
                width: 480,
                height: 360,
                facingMode: 'user',
              },

              audio: false,
            });

        streamRef.current =
          stream;


        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;

          await videoRef.current
            .play();
        }

        if (!mounted) return;


        /* Begin liveness */

        setStatus('checking');

        setMessage(
          'Look at the camera, then blink naturally'
        );

        blinkPhase.current =
          'waiting-open';


        /* Face detection */

        intervalRef.current =
          setInterval(() => {
            if (mounted) {
              checkFrame();
            }
          }, CHECK_INTERVAL_MS);


        /* Countdown */

        let remaining =
          Math.ceil(
            timeoutMs / 1000
          );

        timeoutRef.current =
          setInterval(() => {
            remaining -= 1;

            setSecondsLeft(
              Math.max(
                remaining,
                0
              )
            );

            if (remaining <= 0) {
              stopAll();

              if (mounted) {
                setStatus(
                  'failed'
                );

                setMessage(
                  'No blink detected in time'
                );

                onFail?.();
              }
            }
          }, 1000);
      } catch (err) {
        console.error(
          '[LivenessCheck] Error:',
          err
        );

        if (mounted) {
          setStatus('failed');

          setMessage(
            'Camera unavailable. Please check permissions.'
          );
        }
      }
    };


    init();


    return () => {
      mounted = false;

      stopAll();
    };
  }, [
    checkFrame,
    stopAll,
    onFail,
    timeoutMs,
  ]);


  /* ========================================
     RETRY
  ======================================== */

  const handleRetry = () => {
    onRetry?.();
  };


  /* ========================================
     STATUS
  ======================================== */

  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: RefreshCw,
          title: 'Preparing verification',
        };

      case 'checking':
        return {
          icon: Eye,
          title: 'Liveness check',
        };

      case 'passed':
        return {
          icon: Check,
          title: 'Verified',
        };

      case 'failed':
        return {
          icon: TriangleAlert,
          title: 'Verification failed',
        };

      default:
        return {
          icon: ScanFace,
          title: 'Liveness check',
        };
    }
  };


  const config =
    getStatusConfig();

  const StatusIcon =
    config.icon;


  /* ========================================
     UI
  ======================================== */

  return (
    <div className={styles.wrapper}>

      {/* Camera */}

      <div
        className={`${styles.viewport} ${
          styles[status] || ''
        }`}
      >
        <video
          ref={videoRef}
          className={styles.video}
          muted
          playsInline
          autoPlay
        />

        <div
          className={styles.cameraShade}
        />


        {/* Secure badge */}

        <div
          className={
            styles.securityBadge
          }
        >
          <ShieldCheck size={12} />

          <span>
            Liveness verification
          </span>
        </div>


        {/* Timer */}

        {status === 'checking' && (
          <div
            className={
              styles.timerBadge
            }
          >
            <span
              className={
                styles.timerDot
              }
            />

            <strong>
              {secondsLeft}s
            </strong>
          </div>
        )}


        {/* Face guide */}

        {status === 'checking' && (
          <>
            <div
              className={
                styles.faceGuide
              }
            >
              <span
                className={`${styles.corner} ${styles.topLeft}`}
              />

              <span
                className={`${styles.corner} ${styles.topRight}`}
              />

              <span
                className={`${styles.corner} ${styles.bottomLeft}`}
              />

              <span
                className={`${styles.corner} ${styles.bottomRight}`}
              />
            </div>

            <div
              className={
                styles.scanLine
              }
            />
          </>
        )}


        {/* Loading */}

        {status === 'loading' && (
          <div
            className={
              styles.loadingOverlay
            }
          >
            <div
              className={
                styles.loadingIcon
              }
            >
              <ScanFace
                size={22}
              />
            </div>

            <strong>
              Preparing camera
            </strong>

            <span>
              Loading liveness detection
            </span>
          </div>
        )}


        {/* Passed */}

        {status === 'passed' && (
          <div
            className={
              styles.resultOverlay
            }
          >
            <div
              className={
                styles.successIcon
              }
            >
              <Check size={22} />
            </div>

            <strong>
              Liveness confirmed
            </strong>

            <span>
              Real face verified
            </span>
          </div>
        )}


        {/* Failed */}

        {status === 'failed' && (
          <div
            className={`${styles.resultOverlay} ${styles.failedOverlay}`}
          >
            <div
              className={
                styles.failedIcon
              }
            >
              <EyeOff size={21} />
            </div>

            <strong>
              Verification failed
            </strong>

            <span>
              Please try blinking again
            </span>
          </div>
        )}
      </div>


      {/* Status card */}

      <div
        className={`${styles.statusBar} ${
          styles[status] || ''
        }`}
      >
        <div
          className={
            styles.statusIcon
          }
        >
          <StatusIcon size={15} />
        </div>

        <div
          className={
            styles.statusText
          }
        >
          <strong>
            {config.title}
          </strong>

          <span>
            {message}
          </span>
        </div>
      </div>


      {/* Retry */}

      {status === 'failed' && (
        <button
          type="button"
          className={
            styles.retryBtn
          }
          onClick={
            handleRetry
          }
        >
          <RefreshCw size={15} />

          <span>
            Retry Liveness Check
          </span>
        </button>
      )}
    </div>
  );
};

export default LivenessCheck;