import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { loginSuccess } from '../../features/auth/authSlice';
import { registerVoter } from '../../api/authApi.js';
import FaceCamera from '../../components/FaceCamera/FaceCamera';
import styles from './SignupPage.module.css';

const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'AJK'];

const schema = Yup.object({
  firstName: Yup.string().required('First name required'),
  lastName: Yup.string().required('Last name required'),
  cnicNumber: Yup.string().required('CNIC required').matches(/^\d{13}$/, 'Must be exactly 13 digits'),
  dateOfBirth: Yup.string().required('Date of birth required'),
  gender: Yup.string().required('Gender required'),
  address: Yup.string().required('Address required'),
  city: Yup.string().required('City required'),
  tehsil: Yup.string().required('Tehsil required'),
  province: Yup.string().required('Province required'),
  password: Yup.string().required('Password required').min(8, 'Min 8 characters'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Confirm password required'),
});

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cnicFront, setCnicFront] = useState(null);
  const [cnicBack, setCnicBack] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [scanning, setScanning] = useState(false);
  const frontRef = useRef();
  const backRef = useRef();
  const profileRef = useRef();

  const [ocrValues, setOcrValues] = useState({
    firstName: '', middleName: '', lastName: '', cnicNumber: '',
    dateOfBirth: '', gender: '', address: '', district: '',
    city: '', area: '', tehsil: '', province: '', cnicExpiry: ''
  });

  const scanCnic = async (file, side) => {
    if (!file) return;
    setScanning(true);
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      parseCnicText(text, side);
      toast.success(`${side === 'front' ? 'Front' : 'Back'} CNIC scanned!`);
    } catch (err) {
      toast.warning('OCR scan completed. Please verify the auto-filled fields.');
    }
    setScanning(false);
  };

  const parseCnicText = (text, side) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const updates = {};
    if (side === 'front') {
      const cnicMatch = text.match(/\b(\d{5}-\d{7}-\d)\b/);
      if (cnicMatch) updates.cnicNumber = cnicMatch[1].replace(/-/g, '');
      const nameMatch = lines.find(l => l.length > 5 && /^[A-Z\s]+$/.test(l));
      if (nameMatch) {
        const parts = nameMatch.trim().split(' ');
        updates.firstName = parts[0] || '';
        updates.middleName = parts.length === 3 ? parts[1] : '';
        updates.lastName = parts[parts.length - 1] || '';
      }
      const dobMatch = text.match(/(\d{2}[./-]\d{2}[./-]\d{4})/);
      if (dobMatch) updates.dateOfBirth = dobMatch[1].replace(/[./]/g, '-');
      if (/female|woman|f\b/i.test(text)) updates.gender = 'Female';
      else if (/male|man|m\b/i.test(text)) updates.gender = 'Male';
    }
    if (side === 'back') {
      const addrLine = lines.find(l => l.length > 15 && /\d/.test(l));
      if (addrLine) updates.address = addrLine;
      const expiryMatch = text.match(/(\d{2}[./-]\d{2}[./-]\d{4})/g);
      if (expiryMatch && expiryMatch.length > 0) updates.cnicExpiry = expiryMatch[expiryMatch.length - 1].replace(/[./]/g, '-');
    }
    setOcrValues(prev => ({ ...prev, ...updates }));
  };

  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;
    if (side === 'front') { setCnicFront(file); scanCnic(file, 'front'); }
    if (side === 'back') { setCnicBack(file); scanCnic(file, 'back'); }
    if (side === 'profile') setProfileImage(file);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!faceDescriptor) { toast.error('Face capture is required for registration.'); setSubmitting(false); return; }
    try {
      const fd = new FormData();
      Object.entries({ ...values, ...ocrValues }).forEach(([k, v]) => { if (v && k !== 'confirmPassword') fd.append(k, v); });
      fd.append('faceDescriptor', JSON.stringify(faceDescriptor));
      if (cnicFront) fd.append('cnicFrontImage', cnicFront);
      if (cnicBack) fd.append('cnicBackImage', cnicBack);
      if (profileImage) fd.append('profileImage', profileImage);

      const res = await registerVoter(fd);
      dispatch(loginSuccess({ token: res.data.token, user: res.data.user }));
      toast.success('Registered successfully! Welcome to ECP E-Voting!');
      navigate('/voter/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <span className={styles.logo}>🗳️</span>
          <h2>Election Commission of Pakistan</h2>
          <p>Secure. Verified.<br />Digital Voting System.</p>
          <div className={styles.stepList}>
            {['CNIC Verification', 'Personal Details', 'Face Registration'].map((s, i) => (
              <div key={i} className={`${styles.stepItem} ${step > i ? styles.done : step === i + 1 ? styles.active : ''}`}>
                <div className={styles.stepCircle}>{step > i ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formWrap}>
          <Link to="/register" className={styles.backBtn}>← Back</Link>
          <h1 className={styles.title}>Create Voter Account</h1>
          <p className={styles.subtitle}>Register in 3 steps — takes about 3 minutes</p>

          {/* STEP 1: CNIC */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Step 1: Scan Your CNIC</h2>
              <p className={styles.stepDesc}>Upload your CNIC front and back. Our AI will auto-fill your details.</p>

              <div className={styles.cnicGrid}>
                <div className={styles.cnicUpload} onClick={() => frontRef.current.click()}>
                  {cnicFront ? (
                    <img src={URL.createObjectURL(cnicFront)} alt="CNIC Front" className={styles.cnicPreview} />
                  ) : (
                    <><span className={styles.uploadIcon}>🪪</span><p>Upload CNIC Front</p><small>Click to browse</small></>
                  )}
                  <input ref={frontRef} type="file" accept="image/*" hidden onChange={e => handleFileChange(e, 'front')} />
                </div>
                <div className={styles.cnicUpload} onClick={() => backRef.current.click()}>
                  {cnicBack ? (
                    <img src={URL.createObjectURL(cnicBack)} alt="CNIC Back" className={styles.cnicPreview} />
                  ) : (
                    <><span className={styles.uploadIcon}>📋</span><p>Upload CNIC Back</p><small>Click to browse</small></>
                  )}
                  <input ref={backRef} type="file" accept="image/*" hidden onChange={e => handleFileChange(e, 'back')} />
                </div>
              </div>

              {scanning && <div className={styles.scanning}><div className={styles.scanSpinner} /> Scanning CNIC with OCR...</div>}

              {ocrValues.cnicNumber && (
                <div className={styles.ocrResult}>
                  <div className={styles.ocrHeader}>✅ Auto-detected from CNIC</div>
                  <div className={styles.ocrGrid}>
                    {ocrValues.firstName && <span><b>Name:</b> {[ocrValues.firstName, ocrValues.middleName, ocrValues.lastName].filter(Boolean).join(' ')}</span>}
                    {ocrValues.cnicNumber && <span><b>CNIC:</b> {ocrValues.cnicNumber}</span>}
                    {ocrValues.dateOfBirth && <span><b>DOB:</b> {ocrValues.dateOfBirth}</span>}
                    {ocrValues.gender && <span><b>Gender:</b> {ocrValues.gender}</span>}
                  </div>
                </div>
              )}

              <button className={`btn btn-primary ${styles.nextBtn}`} onClick={() => setStep(2)}>
                Continue to Details →
              </button>
            </div>
          )}

          {/* STEP 2: FORM */}
          {step === 2 && (
            <Formik
              initialValues={{ ...ocrValues, password: '', confirmPassword: '' }}
              validationSchema={schema}
              onSubmit={() => setStep(3)}
              enableReinitialize
            >
              {() => (
                <Form className={styles.form}>
                  <h2 className={styles.stepTitle}>Step 2: Verify Your Details</h2>
                  <p className={styles.stepDesc}>Check auto-filled fields and complete any missing information.</p>

                  <div className={styles.formGrid}>
                    {[
                      { name: 'firstName', label: 'First Name', placeholder: 'Muhammad' },
                      { name: 'middleName', label: 'Middle Name (Optional)', placeholder: 'Ali' },
                      { name: 'lastName', label: 'Last Name', placeholder: 'Khan' },
                      { name: 'cnicNumber', label: 'CNIC Number', placeholder: '3520212345671' },
                      { name: 'cnicExpiry', label: 'CNIC Expiry', placeholder: 'DD-MM-YYYY' },
                      { name: 'dateOfBirth', label: 'Date of Birth', placeholder: 'DD-MM-YYYY' },
                    ].map(f => (
                      <div key={f.name} className={styles.field}>
                        <label className="label">{f.label}</label>
                        <Field name={f.name} className="input" placeholder={f.placeholder} />
                        <ErrorMessage name={f.name} component="div" className="error-text" />
                      </div>
                    ))}

                    <div className={styles.field}>
                      <label className="label">Gender</label>
                      <Field name="gender" as="select" className="input">
                        <option value="">Select Gender</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </Field>
                      <ErrorMessage name="gender" component="div" className="error-text" />
                    </div>

                    <div className={styles.field}>
                      <label className="label">Province</label>
                      <Field name="province" as="select" className="input">
                        <option value="">Select Province</option>
                        {PROVINCES.map(p => <option key={p}>{p}</option>)}
                      </Field>
                      <ErrorMessage name="province" component="div" className="error-text" />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className="label">Full Address</label>
                    <Field name="address" className="input" placeholder="House No., Street, Area" />
                    <ErrorMessage name="address" component="div" className="error-text" />
                  </div>

                  <div className={styles.formGrid}>
                    {[{name:'district',ph:'District'},{name:'city',ph:'City'},{name:'area',ph:'Area'},{name:'tehsil',ph:'Tehsil (for voting constituency)'}].map(f => (
                      <div key={f.name} className={styles.field}>
                        <label className="label">{f.ph}</label>
                        <Field name={f.name} className="input" placeholder={f.ph} />
                        <ErrorMessage name={f.name} component="div" className="error-text" />
                      </div>
                    ))}
                  </div>

                  <div className={styles.uploadRow}>
                    <label className="label">Profile Photo</label>
                    <div className={styles.profileUpload} onClick={() => profileRef.current.click()}>
                      {profileImage ? <img src={URL.createObjectURL(profileImage)} alt="profile" className={styles.profilePreview} /> : <><span>📷</span><p>Upload Photo</p></>}
                      <input ref={profileRef} type="file" accept="image/*" hidden onChange={e => handleFileChange(e, 'profile')} />
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label className="label">Password</label>
                      <Field name="password" type="password" className="input" placeholder="Min 8 characters" />
                      <ErrorMessage name="password" component="div" className="error-text" />
                    </div>
                    <div className={styles.field}>
                      <label className="label">Confirm Password</label>
                      <Field name="confirmPassword" type="password" className="input" placeholder="Repeat password" />
                      <ErrorMessage name="confirmPassword" component="div" className="error-text" />
                    </div>
                  </div>

                  <div className={styles.btnRow}>
                    <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                    <button type="submit" className="btn btn-primary">Continue to Face Capture →</button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {/* STEP 3: FACE */}
          {step === 3 && (
            <Formik initialValues={ocrValues} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
              {({ isSubmitting }) => (
                <Form className={styles.stepContent}>
                  <h2 className={styles.stepTitle}>Step 3: Face Registration</h2>
                  <p className={styles.stepDesc}>Your face is stored as a secure mathematical descriptor — never as an actual photo.</p>

                  <FaceCamera onCapture={setFaceDescriptor} label="Look directly at camera and click Capture" />

                  {faceDescriptor && (
                    <div className={styles.faceDone}>
                      <span>✅</span> Face registered! 128-point descriptor captured securely.
                    </div>
                  )}

                  <div className={styles.btnRow}>
                    <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || !faceDescriptor}>
                      {isSubmitting ? <><span className={styles.spin} /> Registering...</> : '🗳️ Complete Registration'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          <p className={styles.loginLink}>Already registered? <Link to="/login" className={styles.link}>Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;