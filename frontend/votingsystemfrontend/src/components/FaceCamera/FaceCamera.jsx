import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

import {
  Camera,
  CameraOff,
  Check,
  CircleAlert,
  RefreshCw,
  ScanFace,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';

import {
  loadFaceModels,
  compareFaceDescriptors,
} from '../../utils/faceUtils';

import styles from './FaceCamera.module.css';

const FaceCamera = ({
  mode = 'continuous',
  storedDescriptor = null,
  onCapture = null,
  onMatch = null,
  onNoFace = null,
  label = '',
  compact = false,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const noFaceCountRef = useRef(0);

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState(
    'Loading face recognition...'
  );

  const [captured, setCaptured] = useState(false);

  /* =========================================================
     START CAMERA
  ========================================================= */

  const startCamera = useCallback(async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user',
          },
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
      setMessage(
        'Camera access denied. Please allow camera permissions and refresh.'
      );
    }
  }, []);

  /* =========================================================
     STOP CAMERA
  ========================================================= */

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }
  }, []);

  /* =========================================================
     DRAW FACE BOX
  ========================================================= */

  const drawBox = useCallback(
    (detection) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video || !detection) return;

      const dims = faceapi.matchDimensions(
        canvas,
        video,
        true
      );

      const resized = faceapi.resizeResults(
        detection,
        dims
      );

      const ctx = canvas.getContext('2d');

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const box = resized.detection.box;

      let boxColor = '#9ee6b5';

      if (status === 'match') {
        boxColor = '#70e19a';
      } else if (status === 'nomatch') {
        boxColor = '#fb7185';
      } else if (status === 'detecting') {
        boxColor = '#facc15';
      }

      /* Main box */

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 2;

      ctx.strokeRect(
        box.x,
        box.y,
        box.width,
        box.height
      );

      /* Corner accents */

      const len = 20;

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      // Top left
      ctx.beginPath();
      ctx.moveTo(box.x, box.y + len);
      ctx.lineTo(box.x, box.y);
      ctx.lineTo(box.x + len, box.y);
      ctx.stroke();

      // Top right
      ctx.beginPath();
      ctx.moveTo(
        box.x + box.width - len,
        box.y
      );
      ctx.lineTo(
        box.x + box.width,
        box.y
      );
      ctx.lineTo(
        box.x + box.width,
        box.y + len
      );
      ctx.stroke();

      // Bottom left
      ctx.beginPath();
      ctx.moveTo(
        box.x,
        box.y + box.height - len
      );
      ctx.lineTo(
        box.x,
        box.y + box.height
      );
      ctx.lineTo(
        box.x + len,
        box.y + box.height
      );
      ctx.stroke();

      // Bottom right
      ctx.beginPath();
      ctx.moveTo(
        box.x + box.width - len,
        box.y + box.height
      );
      ctx.lineTo(
        box.x + box.width,
        box.y + box.height
      );
      ctx.lineTo(
        box.x + box.width,
        box.y + box.height - len
      );
      ctx.stroke();
    },
    [status]
  );

  /* =========================================================
     DETECT FACE
  ========================================================= */

  const detectFrame = useCallback(async () => {
    const video = videoRef.current;

    if (!video || video.readyState < 2) return;

    try {
      const detection = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      /* =============================
         NO FACE
      ============================= */

      if (!detection) {
        noFaceCountRef.current += 1;

        setStatus('noface');
        setMessage(
          'No face detected — look directly at the camera'
        );

        const canvas = canvasRef.current;

        if (canvas) {
          const ctx = canvas.getContext('2d');

          ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          );
        }

        if (
          noFaceCountRef.current >= 3 &&
          onNoFace
        ) {
          onNoFace();
        }

        return;
      }

      noFaceCountRef.current = 0;

      drawBox(detection);

      /* =============================
         CAPTURE MODE
      ============================= */

      if (mode === 'capture') {
        setStatus('captured');
        setMessage('Face captured successfully');

        setCaptured(true);

        if (onCapture) {
          onCapture(detection.descriptor);
        }

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        return;
      }

      /* =============================
         NO STORED FACE
      ============================= */

      if (
        mode !== 'capture' &&
        (!storedDescriptor ||
          storedDescriptor.length === 0)
      ) {
        setStatus('nomatch');
        setMessage('No registered face on file');

        if (onMatch) {
          onMatch(false);
        }

        return;
      }

      /* =============================
         VERIFY FACE
      ============================= */

      setStatus('detecting');
      setMessage('Verifying identity...');

      const { match, distance } =
        compareFaceDescriptors(
          storedDescriptor,
          detection.descriptor
        );

      if (match) {
        setStatus('match');

        setMessage(
          `Identity verified (${(
            (1 - distance) *
            100
          ).toFixed(0)}% match)`
        );

        if (onMatch) {
          onMatch(true);
        }
      } else {
        setStatus('nomatch');

        setMessage(
          `Face not recognised (${(
            distance * 100
          ).toFixed(0)}% distance)`
        );

        if (onMatch) {
          onMatch(false);
        }
      }
    } catch (err) {
      console.error(
        '[FaceCamera] Detection error:',
        err
      );

      setStatus('error');

      setMessage(
        'Face detection failed. Please try again.'
      );
    }
  }, [
    mode,
    storedDescriptor,
    onCapture,
    onMatch,
    onNoFace,
    drawBox,
  ]);

  /* =========================================================
     INITIALIZE
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setStatus('loading');

        setMessage(
          'Loading face recognition models...'
        );

        await loadFaceModels();

        if (!mounted) return;

        setMessage('Starting secure camera...');

        await startCamera();

        if (!mounted) return;

        setStatus('ready');

        setMessage(
          'Position your face inside the frame'
        );

        const interval =
          mode === 'verify' ? 500 : 1500;

        intervalRef.current = setInterval(
          () => {
            if (mounted) {
              detectFrame();
            }
          },
          interval
        );
      } catch (err) {
        console.error(
          '[FaceCamera] Initialization error:',
          err
        );

        if (mounted) {
          setStatus('error');

          setMessage(
            err.message ||
              'Failed to initialise face recognition.'
          );
        }
      }
    };

    init();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* =========================================================
     RETAKE
  ========================================================= */

  const handleRecapture = () => {
    setCaptured(false);

    setStatus('ready');

    setMessage(
      'Position your face inside the frame'
    );

    if (!intervalRef.current) {
      intervalRef.current = setInterval(
        detectFrame,
        1000
      );
    }
  };

  /* =========================================================
     STATUS CONFIG
  ========================================================= */

  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: RefreshCw,
          label: 'Initializing',
          className: styles.statusNeutral,
        };

      case 'ready':
        return {
          icon: ScanFace,
          label: 'Ready',
          className: styles.statusNeutral,
        };

      case 'detecting':
        return {
          icon: ScanFace,
          label: 'Scanning',
          className: styles.statusScanning,
        };

      case 'match':
        return {
          icon: UserRoundCheck,
          label: 'Verified',
          className: styles.statusSuccess,
        };

      case 'captured':
        return {
          icon: Check,
          label: 'Captured',
          className: styles.statusSuccess,
        };

      case 'nomatch':
        return {
          icon: CircleAlert,
          label: 'Not verified',
          className: styles.statusError,
        };

      case 'noface':
        return {
          icon: CameraOff,
          label: 'Face required',
          className: styles.statusWarning,
        };

      case 'error':
        return {
          icon: CircleAlert,
          label: 'Camera error',
          className: styles.statusError,
        };

      default:
        return {
          icon: ScanFace,
          label: 'Ready',
          className: styles.statusNeutral,
        };
    }
  };

  const statusConfig = getStatusConfig();

  const StatusIcon = statusConfig.icon;

  const isScanning =
    status === 'ready' ||
    status === 'detecting';

  const isLoading = status === 'loading';

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className={`${styles.wrapper} ${
        compact ? styles.compact : ''
      }`}
    >
      {/* Camera */}

      <div
        className={`${styles.viewport} ${
          statusConfig.className
        }`}
      >
        <video
          ref={videoRef}
          className={styles.video}
          muted
          playsInline
          autoPlay
        />

        <canvas
          ref={canvasRef}
          className={styles.canvas}
        />

        {/* Dark gradient */}

        <div className={styles.cameraShade} />

        {/* Top security indicator */}

        <div className={styles.securityBadge}>
          <ShieldCheck size={12} />
          <span>Secure verification</span>
        </div>

        {/* Face guide */}

        {isScanning && (
          <div className={styles.faceGuide}>
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
        )}

        {/* Scanner */}

        {isScanning && (
          <div className={styles.scanArea}>
            <div className={styles.scanLine} />
          </div>
        )}

        {/* Loading */}

        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loader}>
              <ScanFace size={22} />
            </div>

            <strong>Preparing camera</strong>

            <span>
              Loading face recognition...
            </span>
          </div>
        )}

        {/* Status */}

        {!isLoading && (
          <div className={styles.statusPanel}>
            <div className={styles.statusIcon}>
              <StatusIcon size={14} />
            </div>

            <div className={styles.statusContent}>
              <strong>
                {statusConfig.label}
              </strong>

              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Successful capture */}

        {captured && (
          <div className={styles.successOverlay}>
            <div className={styles.successIcon}>
              <Check size={22} />
            </div>

            <strong>Face captured</strong>

            <span>
              Your facial data is ready
            </span>
          </div>
        )}
      </div>

      {/* Instruction */}

      {label && (
        <div className={styles.label}>
          <ScanFace size={13} />
          <span>{label}</span>
        </div>
      )}

      {/* Capture */}

      {mode === 'capture' &&
        !captured &&
        status === 'ready' && (
          <button
            type="button"
            className={styles.captureBtn}
            onClick={detectFrame}
          >
            <Camera size={16} />
            <span>Capture Face</span>
          </button>
        )}

      {/* Retake */}

      {mode === 'capture' && captured && (
        <button
          type="button"
          className={styles.recaptureBtn}
          onClick={handleRecapture}
        >
          <RefreshCw size={15} />
          <span>Retake Photo</span>
        </button>
      )}
    </div>
  );
};

export default FaceCamera;