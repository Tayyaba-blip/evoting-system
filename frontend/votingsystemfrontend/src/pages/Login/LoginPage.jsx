import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { loginSuccess } from '../../features/auth/authSlice';
import { voterLogin, adminLogin, candidateLogin } from '../../api/authApi';
import FaceCamera from '../../components/FaceCamera/FaceCamera';
import LivenessCheck from '../../components/LivenessCheck/LivenessCheck';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  IdCard,
  LockKeyhole,
  Mail,
  ScanFace,
  ShieldCheck,
} from 'lucide-react';

import styles from './LoginPage.module.css';

const ROLES = [
  { key: 'voter', label: 'Voter' },
  { key: 'admin', label: 'Admin' },
  { key: 'candidate', label: 'Candidate' },
];

const voterSchema = Yup.object({
  cnicNumber: Yup.string()
    .required('CNIC required')
    .matches(/^\d{13}$/, 'Enter exactly 13 digits without dashes'),
  password: Yup.string().required('Password required'),
});

const emailSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email required'),
  password: Yup.string().required('Password required'),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [role, setRole] = useState('voter');
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [showFace, setShowFace] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isEmailRole = role === 'admin' || role === 'candidate';

  const handleSubmit = async (values, { setSubmitting }) => {
  try {
    let res;

    // Send login request based on selected role
    if (role === 'voter') {
      const payload = { ...values };

      if (faceDescriptor) {
        payload.liveDescriptor = faceDescriptor;
      }

      res = await voterLogin(payload);
    } else if (role === 'admin') {
      res = await adminLogin(values);
    } else {
      res = await candidateLogin(values);
    }

    // Only continue if login actually returned valid auth data
    const { token, user, mustChangePassword } = res.data;

    if (!token || !user) {
      throw new Error('INVALID_LOGIN_RESPONSE');
    }

    // Store authentication only after successful login
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    dispatch(loginSuccess({ token, user }));

    const displayName =
      user.firstName ||
      user.name ||
      'User';

    toast.success(`Welcome, ${displayName}!`);

    // Navigate ONLY after successful authentication
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
    console.error('Login failed:', err);

    const status = err.response?.status;

    // Incorrect credentials
    if (status === 400 || status === 401 || status === 403) {
      if (role === 'voter') {
        toast.error('Invalid CNIC or password');
      } else {
        toast.error('Invalid email or password');
      }

      // IMPORTANT:
      // no navigate() here, so user stays on LoginPage
      return;
    }

    // Server / unexpected errors
    const serverMessage = err.response?.data?.message;

    if (serverMessage) {
      toast.error(serverMessage);
    } else {
      toast.error('Login failed. Please try again.');
    }

    // Again: no navigation on failure
  } finally {
    setSubmitting(false);
  }
};

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setFaceDescriptor(null);
    setShowFace(false);
    setLivenessPassed(false);
  };

  const getRoleDescription = () => {
    if (role === 'voter') return 'Use your CNIC and password to access your voter portal.';
    if (role === 'admin') return 'Authorized election administration access.';
    return 'Use your registered email to access your candidate portal.';
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgOverlay} />

      {/* Minimal left side — intentionally matches SignupPage */}
      <section className={styles.left}>
        <div className={styles.leftGlow} />

        <div className={styles.leftInner}>
          <Link to="/" className={styles.brandMark} aria-label="ECP home">
            <span>ECP</span>
          </Link>

          <span className={styles.brandEyebrow}>E-VOTING SYSTEM</span>

          <h1 className={styles.ecpName}>
            Election Commission
            <span> of Pakistan</span>
          </h1>

          <p className={styles.ecpTagline}>Secure digital voting access.</p>

          <div className={styles.securityBadge}>
            <ShieldCheck size={16} strokeWidth={2.2} />
            <span>Protected Access</span>
          </div>
        </div>

        <div className={styles.leftFooter}>Secure • Verified • Digital</div>
      </section>

      {/* Login side */}
      <main className={styles.right}>
        <div className={styles.loginCard}>
          <Link to="/" className={styles.backBtn}>
            <ArrowLeft size={15} />
            Home
          </Link>

          <div className={styles.formHeading}>
            <span className={styles.formEyebrow}>SECURE PORTAL</span>
            <h2>Welcome back</h2>
            <p className={styles.subtitle}>{getRoleDescription()}</p>
          </div>

          <div className={styles.roleSection}>
            <span className={styles.roleLabel}>Login as</span>

            <div className={styles.roleOptions} role="radiogroup" aria-label="Select account type">
              {ROLES.map((item) => (
                <label
                  key={item.key}
                  className={`${styles.roleOption} ${
                    role === item.key ? styles.roleOptionActive : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="loginRole"
                    value={item.key}
                    checked={role === item.key}
                    onChange={() => handleRoleSwitch(item.key)}
                  />
                  <span className={styles.customRadio}><span /></span>
                  <span className={styles.roleOptionText}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Formik
            key={role}
            initialValues={
              isEmailRole
                ? { email: '', password: '' }
                : { cnicNumber: '', password: '' }
            }
            validationSchema={isEmailRole ? emailSchema : voterSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className={styles.form}>
                {isEmailRole ? (
                  <div className={styles.field}>
                    <label htmlFor="email">Email Address</label>
                    <div className={styles.inputWrapper}>
                      <Mail size={17} className={styles.inputIcon} />
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        className={styles.input}
                        placeholder="Enter your email address"
                        autoComplete="email"
                      />
                    </div>
                    <ErrorMessage name="email" component="div" className={styles.errorText} />
                  </div>
                ) : (
                  <div className={styles.field}>
                    <label htmlFor="cnicNumber">CNIC Number</label>
                    <div className={styles.inputWrapper}>
                      <IdCard size={17} className={styles.inputIcon} />
                      <Field
                        id="cnicNumber"
                        name="cnicNumber"
                        inputMode="numeric"
                        className={styles.input}
                        placeholder="3520212345671"
                        maxLength={13}
                        autoComplete="username"
                      />
                    </div>
                    <span className={styles.fieldHint}>13 digits without dashes</span>
                    <ErrorMessage name="cnicNumber" component="div" className={styles.errorText} />
                  </div>
                )}

                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label htmlFor="password">Password</label>
                    {role === 'candidate' && (
                      <Link to="/forgot-password" className={styles.forgotLink}>
                        Forgot password?
                      </Link>
                    )}
                  </div>

                  <div className={styles.inputWrapper}>
                    <LockKeyhole size={17} className={styles.inputIcon} />
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`${styles.input} ${styles.passwordInput}`}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className={styles.errorText} />
                </div>

                {role === 'voter' && (
                  <div className={`${styles.faceSection} ${showFace ? styles.faceSectionOpen : ''}`}>
                    <button
                      type="button"
                      className={styles.toggleFace}
                      onClick={() => setShowFace((current) => !current)}
                    >
                      <div className={styles.faceButtonIcon}>
                        <ScanFace size={18} />
                      </div>

                      <div className={styles.faceButtonText}>
                        <strong>Identity verification</strong>
                        <span>{showFace ? 'Hide camera verification' : 'Optional face verification'}</span>
                      </div>

                      <span className={`${styles.faceToggleIndicator} ${showFace ? styles.faceToggleActive : ''}`}>
                        <span />
                      </span>
                    </button>

                    {showFace && (
                      <div className={styles.faceBox}>
                        {!livenessPassed ? (
                          <LivenessCheck onPassed={() => setLivenessPassed(true)} />
                        ) : (
                          <>
                            <FaceCamera
                              mode="capture"
                              onCapture={setFaceDescriptor}
                              label="Look at camera for verification"
                            />
                            {faceDescriptor && (
                              <div className={styles.faceOk}>
                                <CheckCircle2 size={15} />
                                Face captured successfully
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className={styles.spinner} />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Login as {role.charAt(0).toUpperCase() + role.slice(1)}
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {role === 'voter' && (
            <div className={styles.signupArea}>
              <span>New to E-Vote?</span>
              <Link to="/signup" className={styles.signupLink}>
                Create voter account
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          <div className={styles.cardFooter}>
            <ShieldCheck size={12} />
            Protected authentication portal
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
