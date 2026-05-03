import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { loginSuccess } from '../../features/auth/authSlice';
import { voterLogin, adminLogin, candidateLogin } from '../../api/authApi';
import FaceCamera from '../../components/FaceCamera/FaceCamera';
import styles from './LoginPage.module.css';

const ROLES = [
  { key: 'voter', label: '🗳️ Voter', desc: 'CNIC + Password' },
  { key: 'admin', label: '⚙️ Admin', desc: 'Email + Password' },
  { key: 'candidate', label: '🏅 Candidate', desc: 'Email + Password' },
];

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [role, setRole] = useState('voter');
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [showFace, setShowFace] = useState(false);

  const voterSchema = Yup.object({ cnicNumber: Yup.string().required('CNIC required').matches(/^\d{13}$/, '13 digits, no dashes'), password: Yup.string().required('Password required') });
  const emailSchema = Yup.object({ email: Yup.string().email('Invalid email').required('Email required'), password: Yup.string().required('Password required') });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      let res;
      if (role === 'voter') {
        const payload = { ...values };
        if (faceDescriptor) payload.liveDescriptor = faceDescriptor;
        res = await voterLogin(payload);
      } else if (role === 'admin') {
        res = await adminLogin(values);
      } else {
        res = await candidateLogin(values);
      }

      const { token, user, mustChangePassword } = res.data;
      dispatch(loginSuccess({ token, user }));
      toast.success(`Welcome, ${user.firstName || user.name}!`);

      if (role === 'candidate' && mustChangePassword) {
        navigate('/candidate/change-password');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'candidate') {
        navigate('/candidate/dashboard');
      } else {
        navigate('/voter/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setSubmitting(false);
  };

  const isEmailRole = role === 'admin' || role === 'candidate';

  return (
    <div className={styles.page}>
      <div className={styles.bgOverlay} />

      <div className={styles.left}>
        <div className={styles.leftInner}>
          <div className={styles.ecpLogo}>🗳️</div>
          <h2 className={styles.ecpName}>Election Commission of Pakistan</h2>
          <p className={styles.ecpTagline}>Secure. Verified.<br />Digital Voting System.</p>
          <div className={styles.ecpFeatures}>
            <div className={styles.feature}><span>⛓️</span> Blockchain Secured</div>
            <div className={styles.feature}><span>🤖</span> AI Face Verified</div>
            <div className={styles.feature}><span>🔐</span> End-to-End Encrypted</div>
            <div className={styles.feature}><span>🇵🇰</span> For Pakistan</div>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formCard}>
          <Link to="/" className={styles.backBtn}>← Home</Link>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Login to your account</p>

          {/* Role tabs */}
          <div className={styles.roleTabs}>
            {ROLES.map(r => (
              <button key={r.key} className={`${styles.roleTab} ${role === r.key ? styles.activeTab : ''}`} onClick={() => { setRole(r.key); setFaceDescriptor(null); setShowFace(false); }}>
                <span>{r.label}</span>
                <small>{r.desc}</small>
              </button>
            ))}
          </div>

          <Formik
            key={role}
            initialValues={isEmailRole ? { email: '', password: '' } : { cnicNumber: '', password: '' }}
            validationSchema={isEmailRole ? emailSchema : voterSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className={styles.form}>
                {isEmailRole ? (
                  <div className={styles.field}>
                    <label className="label">Email Address</label>
                    <Field name="email" type="email" className="input" placeholder="your@email.com" />
                    <ErrorMessage name="email" component="div" className="error-text" />
                  </div>
                ) : (
                  <div className={styles.field}>
                    <label className="label">CNIC Number</label>
                    <Field name="cnicNumber" className="input" placeholder="3520212345671 (13 digits)" maxLength={13} />
                    <ErrorMessage name="cnicNumber" component="div" className="error-text" />
                  </div>
                )}

                <div className={styles.field}>
                  <label className="label">Password</label>
                  <Field name="password" type="password" className="input" placeholder="Enter password" />
                  <ErrorMessage name="password" component="div" className="error-text" />
                </div>

                {role === 'voter' && (
                  <div className={styles.faceSection}>
                    <button type="button" className={styles.toggleFace} onClick={() => setShowFace(s => !s)}>
                      {showFace ? '🚫 Skip Face Verify' : '📷 Add Face Verification (Recommended)'}
                    </button>
                    {showFace && (
                      <div className={styles.faceBox}>
                        <FaceCamera onCapture={setFaceDescriptor} label="Look at camera for verification" />
                        {faceDescriptor && <div className={styles.faceOk}>✅ Face captured</div>}
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={isSubmitting}>
                  {isSubmitting ? <><span className={styles.spinner} /> Logging in...</> : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)} →`}
                </button>
              </Form>
            )}
          </Formik>

          {role === 'candidate' && (
            <div className={styles.links}>
              <Link to="/forgot-password" className={styles.link}>Forgot password?</Link>
            </div>
          )}

          {role === 'voter' && (
            <p className={styles.signupPrompt}>
              Don't have an account? <Link to="/signup" className={styles.link}>Sign up as Voter</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;