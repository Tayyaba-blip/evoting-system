import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { loginSuccess } from '../../features/auth/authSlice';
import {
  voterLogin,
  adminLogin,
  candidateLogin,
} from '../../api/authApi';

import FaceCamera from '../../components/FaceCamera/FaceCamera';
import LivenessCheck from '../../components/LivenessCheck/LivenessCheck';

import {
  ArrowLeft,
  ArrowRight,
  Blocks,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  IdCard,
  LockKeyhole,
  Mail,
  ScanFace,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  Vote,
} from 'lucide-react';

import styles from './LoginPage.module.css';

const ROLES = [
  {
    key: 'voter',
    label: 'Voter',
  },
  {
    key: 'admin',
    label: 'Admin',
  },
  {
    key: 'candidate',
    label: 'Candidate',
  },
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

      const { token, user, mustChangePassword } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch(loginSuccess({ token, user }));

      const displayName = user.firstName || user.name || 'User';

      toast.success(`Welcome, ${displayName}!`);

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
      toast.error(
        err.response?.data?.message ||
          'Login failed. Please try again.'
      );
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
    if (role === 'voter') {
      return 'Sign in with your CNIC to access your voter portal.';
    }

    if (role === 'admin') {
      return 'Authorized election administration access.';
    }

    return 'Sign in to access your candidate portal.';
  };

  return (
    <div className={styles.page}>
      {/* Decorative background */}
      <div className={styles.background}>
        <div className={styles.glowOne} />
        <div className={styles.glowTwo} />
        <div className={styles.gridPattern} />
      </div>

      {/* ================= LEFT SIDE ================= */}

      <section className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <Link to="/" className={styles.brand}>
            <div className={styles.brandIcon}>
              <Vote size={27} strokeWidth={2.4} />
            </div>

            <div className={styles.brandText}>
              <strong>ECP</strong>
              <span>Blockchain E-Voting</span>
            </div>
          </Link>

          <div className={styles.leftMain}>
            <div className={styles.eyebrow}>
              <Sparkles size={14} />
              Pakistan's Digital Voting Platform
            </div>

            <h1 className={styles.leftTitle}>
              Secure access to
              <span> your digital vote.</span>
            </h1>

            <p className={styles.leftDescription}>
              A modern electronic voting platform designed around
              identity, integrity and transparent election records.
            </p>

            <div className={styles.securityGrid}>
              <div className={styles.securityCard}>
                <div className={styles.securityIcon}>
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <strong>Protected Access</strong>
                  <span>Secure authentication</span>
                </div>

                <CheckCircle2
                  size={17}
                  className={styles.checkIcon}
                />
              </div>

              <div className={styles.securityCard}>
                <div className={styles.securityIcon}>
                  <Fingerprint size={21} />
                </div>

                <div>
                  <strong>Identity Protection</strong>
                  <span>Voter verification</span>
                </div>

                <CheckCircle2
                  size={17}
                  className={styles.checkIcon}
                />
              </div>

              <div className={styles.securityCard}>
                <div className={styles.securityIcon}>
                  <Blocks size={21} />
                </div>

                <div>
                  <strong>Trusted Records</strong>
                  <span>Transparent vote records</span>
                </div>

                <CheckCircle2
                  size={17}
                  className={styles.checkIcon}
                />
              </div>
            </div>

            <div className={styles.securityMessage}>
              <div className={styles.securityMessageIcon}>
                <LockKeyhole size={18} />
              </div>

              <div>
                <strong>Your session is protected</strong>
                <span>
                  Authentication data is transmitted through a
                  secured connection.
                </span>
              </div>
            </div>
          </div>

          <div className={styles.leftFooter}>
            <ShieldCheck size={14} />
            <span>Election Commission of Pakistan</span>
          </div>
        </div>
      </section>

      {/* ================= RIGHT SIDE ================= */}

      <main className={styles.rightPanel}>
        <div className={styles.mobileBrand}>
          <div className={styles.brandIcon}>
            <Vote size={23} />
          </div>

          <div className={styles.brandText}>
            <strong>ECP</strong>
            <span>Blockchain E-Voting</span>
          </div>
        </div>

        <div className={styles.loginCard}>
          <Link to="/" className={styles.backBtn}>
            <ArrowLeft size={16} />
            Home
          </Link>

          <div className={styles.formHeading}>
            <div className={styles.headingIcon}>
              <LockKeyhole size={20} />
            </div>

            <div>
              <span className={styles.headingLabel}>
                SECURE PORTAL
              </span>

              <h2>Welcome back</h2>
            </div>
          </div>

          <p className={styles.subtitle}>
            {getRoleDescription()}
          </p>

          {/* ================= RADIO ROLE SELECTOR ================= */}

          <div className={styles.roleSection}>
            <span className={styles.roleLabel}>
              Login as
            </span>

            <div
              className={styles.roleOptions}
              role="radiogroup"
              aria-label="Select account type"
            >
              {ROLES.map((item) => (
                <label
                  key={item.key}
                  className={`${styles.roleOption} ${
                    role === item.key
                      ? styles.roleOptionActive
                      : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="loginRole"
                    value={item.key}
                    checked={role === item.key}
                    onChange={() =>
                      handleRoleSwitch(item.key)
                    }
                  />

                  <span className={styles.customRadio}>
                    <span />
                  </span>

                  <span className={styles.roleOptionText}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.divider}>
            <span />
            <div>
              {role === 'voter' ? (
                <UserRound size={14} />
              ) : role === 'admin' ? (
                <ShieldCheck size={14} />
              ) : (
                <UsersRound size={14} />
              )}

              {role === 'voter'
                ? 'Voter Login'
                : role === 'admin'
                  ? 'Administrator Login'
                  : 'Candidate Login'}
            </div>
            <span />
          </div>

          <Formik
            key={role}
            initialValues={
              isEmailRole
                ? {
                    email: '',
                    password: '',
                  }
                : {
                    cnicNumber: '',
                    password: '',
                  }
            }
            validationSchema={
              isEmailRole ? emailSchema : voterSchema
            }
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className={styles.form}>
                {/* Email / CNIC */}
                {isEmailRole ? (
                  <div className={styles.field}>
                    <label htmlFor="email">
                      Email Address
                    </label>

                    <div className={styles.inputWrapper}>
                      <Mail
                        size={18}
                        className={styles.inputIcon}
                      />

                      <Field
                        id="email"
                        name="email"
                        type="email"
                        className={styles.input}
                        placeholder="Enter your email address"
                        autoComplete="email"
                      />
                    </div>

                    <ErrorMessage
                      name="email"
                      component="div"
                      className={styles.errorText}
                    />
                  </div>
                ) : (
                  <div className={styles.field}>
                    <label htmlFor="cnicNumber">
                      CNIC Number
                    </label>

                    <div className={styles.inputWrapper}>
                      <IdCard
                        size={18}
                        className={styles.inputIcon}
                      />

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

                    <span className={styles.fieldHint}>
                      Enter 13 digits without dashes
                    </span>

                    <ErrorMessage
                      name="cnicNumber"
                      component="div"
                      className={styles.errorText}
                    />
                  </div>
                )}

                {/* Password */}
                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label htmlFor="password">
                      Password
                    </label>

                    {role === 'candidate' && (
                      <Link
                        to="/forgot-password"
                        className={styles.forgotLink}
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>

                  <div className={styles.inputWrapper}>
                    <LockKeyhole
                      size={18}
                      className={styles.inputIcon}
                    />

                    <Field
                      id="password"
                      name="password"
                      type={
                        showPassword ? 'text' : 'password'
                      }
                      className={`${styles.input} ${styles.passwordInput}`}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  <ErrorMessage
                    name="password"
                    component="div"
                    className={styles.errorText}
                  />
                </div>

                {/* Face verification */}
                {role === 'voter' && (
                  <div
                    className={`${styles.faceSection} ${
                      showFace ? styles.faceSectionOpen : ''
                    }`}
                  >
                    <button
                      type="button"
                      className={styles.toggleFace}
                      onClick={() =>
                        setShowFace((current) => !current)
                      }
                    >
                      <div className={styles.faceButtonIcon}>
                        <ScanFace size={19} />
                      </div>

                      <div className={styles.faceButtonText}>
                        <strong>
                          Identity verification
                        </strong>

                        <span>
                          {showFace
                            ? 'Hide camera verification'
                            : 'Add an extra identity check'}
                        </span>
                      </div>

                      <span
                        className={`${styles.faceToggleIndicator} ${
                          showFace
                            ? styles.faceToggleActive
                            : ''
                        }`}
                      >
                        <span />
                      </span>
                    </button>

                    {showFace && (
                      <div className={styles.faceBox}>
                        {!livenessPassed ? (
                          <LivenessCheck
                            onPassed={() =>
                              setLivenessPassed(true)
                            }
                          />
                        ) : (
                          <>
                            <FaceCamera
                              mode="capture"
                              onCapture={setFaceDescriptor}
                              label="Look at camera for verification"
                            />

                            {faceDescriptor && (
                              <div className={styles.faceOk}>
                                <CheckCircle2 size={16} />
                                Face captured successfully
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className={styles.spinner} />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Login as{' '}
                      {role.charAt(0).toUpperCase() +
                        role.slice(1)}

                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {role === 'voter' && (
            <div className={styles.signupArea}>
              <span>New to E-Vote?</span>

              <Link
                to="/signup"
                className={styles.signupLink}
              >
                Create voter account
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          <div className={styles.cardFooter}>
            <ShieldCheck size={13} />
            Protected authentication portal
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;