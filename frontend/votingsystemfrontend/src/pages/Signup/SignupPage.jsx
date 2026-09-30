import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { loginSuccess } from '../../features/auth/authSlice';
import { registerVoter } from '../../api/authApi';
import { autofillFromCnic } from '../../api/cnicOcr'; // placeholder – see note
import FaceCamera from '../../components/FaceCamera/FaceCamera';
import AnnouncementBanner from '../../components/AnnouncementBanner/AnnouncementBanner';
import { PAKISTAN_PROVINCES } from '../../utils/formatters';
import styles from './SignupPage.module.css';
import LivenessCheck from '../../components/LivenessCheck/LivenessCheck';
import {
  ArrowLeft,
  ArrowRight,
  ScanLine,
  UserRound,
  Camera,
  LockKeyhole,
  Upload,
  ShieldCheck,
  Check,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Signup has 4 steps:
   1. CNIC Scan          — upload front + back, auto-fill
   2. Personal Details   — pre-filled from CNIC, editable
   3. Face Capture       — live camera, grab descriptors
   4. Password           — create account password
───────────────────────────────────────────────────────── */

const STEPS = ['CNIC Scan', 'Personal Info', 'Face Capture', 'Password'];

const passwordSchema = Yup.string()
  .required('Password required')
  .min(8, 'Min 8 characters')
  .matches(/[A-Z]/, 'At least one uppercase letter')
  .matches(/[0-9]/, 'At least one number');

const SignupPage = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const [step, setStep]                         = useState(0);
  const [loading, setLoading]                   = useState(false);

  // Step 1 — CNIC
  const [cnicFront, setCnicFront]               = useState(null);
  const [cnicBack,  setCnicBack]                = useState(null);
  const [cnicFrontPreview, setCnicFrontPreview] = useState(null);
  const [cnicBackPreview,  setCnicBackPreview]  = useState(null);
  const [scanLoading, setScanLoading]           = useState(false);

  // Step 2 — Personal info (populated after scan)
  const [personalData, setPersonalData] = useState({
    firstName: '', middleName: '', lastName: '',
    cnicNumber: '', cnicExpiry: '', dateOfBirth: '',
    gender: '', address: '', district: '', city: '',
    area: '', tehsil: '', province: '',
  });

  // Step 3 — Face
  const [faceDescriptor, setFaceDescriptor]     = useState(null);
  const [profileImage,   setProfileImage]       = useState(null);
  const [profilePreview, setProfilePreview]     = useState(null);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [livenessRetryCount, setLivenessRetryCount] = useState(0);

  // Step 4 — Password
  const [password,    setPassword]              = useState('');
  const [confirmPass, setConfirmPass]           = useState('');
  const [pwError,     setPwError]               = useState('');

  /* ── Helpers ─────────────────────────────────────── */

  const handleCnicFile = (side, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (side === 'front') { setCnicFront(file); setCnicFrontPreview(URL.createObjectURL(file)); }
    else                  { setCnicBack(file);  setCnicBackPreview(URL.createObjectURL(file)); }
  };

  const handleScanCnic = async () => {
  if (!cnicFront) return toast.error('Please upload the front of your CNIC first.');

  setScanLoading(true);

  try {
    const extractedData = await autofillFromCnic(cnicFront, cnicBack);

    setPersonalData((prev) => ({
      ...prev,
      ...extractedData,
      province: prev.province || 'Punjab',
      district: prev.district || 'Lahore',
      city: prev.city || 'Lahore',
    }));

    toast.success('CNIC scanned. Please verify the auto-filled details.');
    setStep(1);
  } catch (err) {
    toast.error('CNIC scan failed. Please fill in your details manually.');
    setStep(1);
  } finally {
    setScanLoading(false);
  }
};

  const handleFaceCapture = useCallback((descriptor) => {
  if (!descriptor || descriptor.length !== 128) {
    toast.error('Face capture failed — please retake it.');
    return;
  }
  setFaceDescriptor(Array.from(descriptor)); // Float32Array → plain array, safe for JSON
}, []);

  const handleProfilePhoto = (e) => {
    const file = e.target.files[0];
    if (file) { setProfileImage(file); setProfilePreview(URL.createObjectURL(file)); }
  };

  const passwordStrength = () => {
    if (!password) return { width: '0%', color: '#e5e7eb', label: '' };
    let score = 0;
    if (password.length >= 8)          score++;
    if (/[A-Z]/.test(password))        score++;
    if (/[0-9]/.test(password))        score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const map = [
      { width: '25%', color: '#ef4444', label: 'Weak' },
      { width: '50%', color: '#f97316', label: 'Fair' },
      { width: '75%', color: '#eab308', label: 'Good' },
      { width: '100%',color: '#22c55e', label: 'Strong' },
    ];
    return map[score - 1] || map[0];
  };

  /* ── Final submit ─────────────────────────────────── */

  const handleSubmit = async () => {
    // Validate password step
    if (password.length < 8) return setPwError('Password must be at least 8 characters.');
    if (password !== confirmPass) return setPwError('Passwords do not match.');
    if (!faceDescriptor) return toast.error('Please complete the face capture step first.');
    setPwError('');
    setLoading(true);

    try {
      const formData = new FormData();

      // Personal fields
      Object.entries(personalData).forEach(([k, v]) => formData.append(k, v));
      formData.append('password', password);
      formData.append('faceDescriptor', JSON.stringify(faceDescriptor));

      // Images
      if (cnicFront)    formData.append('cnicFrontImage', cnicFront);
      if (cnicBack)     formData.append('cnicBackImage',  cnicBack);
      if (profileImage) formData.append('profileImage',   profileImage);

      const { data } = await registerVoter(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      dispatch(loginSuccess({ token: data.token, user: data.user }));

      toast.success('🎉 Registration successful! Welcome to E-Vote.');
      navigate('/voter/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step validation before advancing ─────────────── */
  const canAdvance = () => {
    if (step === 0) return !!cnicFront;
    if (step === 1) return personalData.firstName && personalData.lastName && personalData.cnicNumber;
    if (step === 2) return !!faceDescriptor;
    return true;
  };

  const pw = passwordStrength();

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className={styles.page}>
      <div className={styles.bgOverlay} />

      {/* ── Left panel — identical to login ── */}
     {/* ── Left panel ── */}
<div className={styles.left}>
  <div className={styles.leftGlow} />

  <div className={styles.leftInner}>
    <div className={styles.brandMark}>
      <span>ECP</span>
    </div>

    <span className={styles.brandEyebrow}>
      E-VOTING SYSTEM
    </span>

    <h2 className={styles.ecpName}>
      Election Commission
      <span> of Pakistan</span>
    </h2>

    <p className={styles.ecpTagline}>
      Secure digital voter registration.
    </p>

    <div className={styles.securityBadge}>
      <ShieldCheck size={16} strokeWidth={2.2} />
      <span>Identity Protected</span>
    </div>
  </div>

  <div className={styles.leftFooter}>
    Secure • Verified • Digital
  </div>
</div>

      {/* ── Right panel ── */}
      <div className={styles.right}>
  <div className={styles.formCard}>
    <Link to="/register" className={styles.backBtn}>
      <ArrowLeft size={15} />
      Back
    </Link>

    <div className={styles.formHeading}>
      <span className={styles.formEyebrow}>VOTER REGISTRATION</span>

      <h1 className={styles.title}>
        Create your account
      </h1>

      <p className={styles.subtitle}>
        Complete the steps below to register as a voter.
      </p>
    </div>

    <div className={styles.announcementSlot}>
      <AnnouncementBanner page="register" />
    </div>

          {/* Step indicator */}
          <div className={styles.stepIndicator}>
  {STEPS.map((label, i) => (
    <div className={styles.stepItem} key={label}>
      <div
        className={`${styles.stepCircle} ${
          i === step
            ? styles.active
            : i < step
            ? styles.completed
            : ''
        }`}
      >
        {i < step ? <Check size={14} /> : i + 1}
      </div>

      <span
        className={`${styles.stepLabel} ${
          i === step ? styles.activeLabel : ''
        }`}
      >
        {label}
      </span>

      {i < STEPS.length - 1 && (
        <div
          className={`${styles.stepLine} ${
            i < step ? styles.completedLine : ''
          }`}
        />
      )}
    </div>
  ))}
</div>

          {/* ── Step 0: CNIC Scan ── */}
          {step === 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeading}>
  <div className={styles.cardIcon}>
    <ScanLine size={18} />
  </div>

  <div>
    <h3 className={styles.cardTitle}>Scan your CNIC</h3>
    <p className={styles.cardSubtitle}>
      Upload both sides of your CNIC to continue.
    </p>
  </div>
</div>

              <div className={styles.cnicScanSection}>
                <p className={styles.cnicScanTitle}>Upload CNIC Images</p>
                <p className={styles.cnicScanSubtitle}>Clear photos only — no blur, no glare.</p>
                <div className={styles.cnicRow}>
                  <div className={styles.cnicUpload} onClick={() => document.getElementById('cnicFrontInput').click()}>
                    {cnicFrontPreview
                      ? <img src={cnicFrontPreview} alt="CNIC Front" />
                      : <><span>📄</span><p>Front Side</p><small>Click to upload</small></>
                    }
                  </div>
                  <div className={styles.cnicUpload} onClick={() => document.getElementById('cnicBackInput').click()}>
                    {cnicBackPreview
                      ? <img src={cnicBackPreview} alt="CNIC Back" />
                      : <><span>📋</span><p>Back Side</p><small>Click to upload</small></>
                    }
                  </div>
                  <input id="cnicFrontInput" type="file" accept="image/*" hidden onChange={(e) => handleCnicFile('front', e)} />
                  <input id="cnicBackInput"  type="file" accept="image/*" hidden onChange={(e) => handleCnicFile('back',  e)} />
                </div>

                <button
                  className={styles.scanBtn}
                  onClick={handleScanCnic}
                  disabled={!cnicFront || scanLoading}
                >
                  {scanLoading ? (<> <span className={styles.spinner} /> Scanning...</>) : ( <><ScanLine size={16} />Scan & Auto-Fill </>)}
                </button>
              </div>

              <div className={styles.infoBox}>
                ℹ️ Your CNIC must be registered in the national database. Details will be verified automatically.
              </div>

              <div className={styles.formActions}>
                <div />
                <button
                  className={styles.nextBtn}
                  onClick={() => setStep(1)}
                  disabled={!cnicFront}
                >
                  Fill Manually →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 1: Personal Details ── */}
          {step === 1 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>👤 Personal Information</h3>
              <p className={styles.cardSubtitle}>Verify and complete your details.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className={styles.grid3}>
                  <div className={styles.field}>
                    <label>First Name *</label>
                    <input value={personalData.firstName} onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })} placeholder="Ahmed" />
                  </div>
                  <div className={styles.field}>
                    <label>Middle Name</label>
                    <input value={personalData.middleName} onChange={(e) => setPersonalData({ ...personalData, middleName: e.target.value })} placeholder="Ali" />
                  </div>
                  <div className={styles.field}>
                    <label>Last Name *</label>
                    <input value={personalData.lastName} onChange={(e) => setPersonalData({ ...personalData, lastName: e.target.value })} placeholder="Khan" />
                  </div>
                </div>

                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label>CNIC Number *</label>
                    <input value={personalData.cnicNumber} onChange={(e) => setPersonalData({ ...personalData, cnicNumber: e.target.value })} placeholder="35202-1234567-1" />
                  </div>
                  <div className={styles.field}>
                    <label>CNIC Expiry</label>
                    <input type="date" value={personalData.cnicExpiry} onChange={(e) => setPersonalData({ ...personalData, cnicExpiry: e.target.value })} />
                  </div>
                </div>

                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label>Date of Birth</label>
                    <input type="date" value={personalData.dateOfBirth} onChange={(e) => setPersonalData({ ...personalData, dateOfBirth: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label>Gender</label>
                    <select value={personalData.gender} onChange={(e) => setPersonalData({ ...personalData, gender: e.target.value })}>
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Address</label>
                  <input value={personalData.address} onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })} placeholder="House #, Street, Area" />
                </div>

                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label>District</label>
                    <input value={personalData.district} onChange={(e) => setPersonalData({ ...personalData, district: e.target.value })} placeholder="Lahore" />
                  </div>
                  <div className={styles.field}>
                    <label>City</label>
                    <input value={personalData.city} onChange={(e) => setPersonalData({ ...personalData, city: e.target.value })} placeholder="Lahore" />
                  </div>
                  <div className={styles.field}>
                    <label>Area</label>
                    <input value={personalData.area} onChange={(e) => setPersonalData({ ...personalData, area: e.target.value })} placeholder="Gulberg" />
                  </div>
                  <div className={styles.field}>
                    <label>Tehsil *</label>
                    <input value={personalData.tehsil} onChange={(e) => setPersonalData({ ...personalData, tehsil: e.target.value })} placeholder="Lahore City" />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Province *</label>
                  <select value={personalData.province} onChange={(e) => setPersonalData({ ...personalData, province: e.target.value })}>
                    <option value="">Select Province</option>
                    {PAKISTAN_PROVINCES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.formActions}>
                <button className={styles.prevBtn} onClick={() => setStep(0)}>← Back</button>
                <button
                  className={styles.nextBtn}
                  onClick={() => setStep(2)}
                  disabled={!personalData.firstName || !personalData.lastName || !personalData.cnicNumber}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Face Capture ── */}
          {step === 2 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>📷 Face Verification</h3>
              <p className={styles.cardSubtitle}>
                Look directly at the camera. Your facial data is stored securely and used only for identity verification.
              </p>

              <div className={styles.faceCaptureSection}>
                <p className={styles.faceCaptureTitle}>Live Face Capture</p>
                <p className={styles.faceCaptureSubtitle}>Ensure good lighting and remove glasses if possible.</p>
                {!livenessPassed ? ( <LivenessCheck  
                key={livenessRetryCount} 
                onPassed={() => setLivenessPassed(true)}
                    onRetry={() => setLivenessRetryCount((c) => c + 1)}/>) : 
                (<FaceCamera mode="capture" onCapture={handleFaceCapture} label="Position your face in the frame" />)}
                {faceDescriptor && (
                  <div className={styles.infoBox} style={{ marginTop: 12 }}>
                    ✅ Face captured successfully! You can proceed.
                  </div>
                )}
              </div>

              <div className={styles.faceCaptureSection} style={{ marginTop: 0 }}>
                <p className={styles.faceCaptureTitle}>Profile Photo</p>
                <p className={styles.faceCaptureSubtitle}>Upload a clear front-facing photo.</p>
                <div
                  className={styles.cnicUpload}
                  onClick={() => document.getElementById('profilePhotoInput').click()}
                  style={{ height: 120 }}
                >
                  {profilePreview
                    ? <img src={profilePreview} alt="Profile" style={{ height: 100, objectFit: 'cover', borderRadius: 8 }} />
                    : <><span>🤳</span><p>Upload Photo</p><small>Click to browse</small></>
                  }
                </div>
                <input id="profilePhotoInput" type="file" accept="image/*" hidden onChange={handleProfilePhoto} />
              </div>

              <div className={styles.formActions}>
                <button className={styles.prevBtn} onClick={() => setStep(1)}>← Back</button>
                <button
                  className={styles.nextBtn}
                  onClick={() => setStep(3)}
                  disabled={!faceDescriptor}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
          

          {/* ── Step 3: Password ── */}
          {step === 3 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>🔐 Create Password</h3>
              <p className={styles.cardSubtitle}>Choose a strong password to secure your account.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className={styles.field}>
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                  />
                  {password && (
                    <div className={styles.passwordStrength}>
                      <div className={styles.strengthBar} style={{ width: pw.width, background: pw.color }} />
                      <span style={{ fontSize: 11, color: pw.color, fontWeight: 600 }}>{pw.label}</span>
                    </div>
                  )}
                </div>

                <div className={styles.field}>
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Repeat your password"
                  />
                </div>

                {pwError && <span className={styles.error}>{pwError}</span>}

                <div className={styles.infoBox}>
                  🔒 Your password is stored encrypted. We never store it in plain text.
                </div>
              </div>

              <div className={styles.formActions}>
                <button className={styles.prevBtn} onClick={() => setStep(2)}>← Back</button>
                <button
                  className={styles.submitBtn}
                  onClick={handleSubmit}
                  disabled={loading || !password || !confirmPass}
                >
                  {loading
                    ? <><span className={styles.spinner} /> Registering...</>
                    : '✅ Complete Registration'
                  }
                </button>
              </div>
            </div>
          )}

          <p className={styles.loginPrompt}>
            Already registered?{' '}
            <Link to="/login" className={styles.loginLink}>Log in here</Link>
          </p>
        </div>
      </div>

      {/* Full-screen loading overlay */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <span>Creating your voter account...</span>
        </div>
      )}
    </div>
  );
};

export default SignupPage;