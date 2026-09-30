import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';

import { changePassword } from '../../api/authApi';
import { updateUser } from '../../features/auth/authSlice';

import styles from './ChangePassword.module.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const requirements = {
    length: newPass.length >= 8,
    uppercase: /[A-Z]/.test(newPass),
    number: /[0-9]/.test(newPass),
  };

  const getStrength = (password) => {
    if (!password) return null;

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return (
      [
        { label: 'Weak', width: '25%' },
        { label: 'Fair', width: '50%' },
        { label: 'Good', width: '75%' },
        { label: 'Strong', width: '100%' },
      ][score - 1] || {
        label: 'Weak',
        width: '25%',
      }
    );
  };

  const strength = getStrength(newPass);

  const validate = () => {
    const validationErrors = {};

    if (!newPass) {
      validationErrors.newPass = 'New password is required.';
    } else if (newPass.length < 8) {
      validationErrors.newPass =
        'Must be at least 8 characters.';
    } else if (!/[A-Z]/.test(newPass)) {
      validationErrors.newPass =
        'Must contain at least one uppercase letter.';
    } else if (!/[0-9]/.test(newPass)) {
      validationErrors.newPass =
        'Must contain at least one number.';
    }

    if (!confirmPass) {
      validationErrors.confirmPass =
        'Please confirm your password.';
    } else if (newPass !== confirmPass) {
      validationErrors.confirmPass =
        'Passwords do not match.';
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await changePassword({
        newPassword: newPass,
      });

      dispatch(
        updateUser({
          mustChangePassword: false,
        })
      );

      const updatedUser = {
        ...user,
        mustChangePassword: false,
      };

      localStorage.setItem(
        'user',
        JSON.stringify(updatedUser)
      );

      toast.success(
        'Password changed successfully.'
      );

      navigate('/candidate/dashboard');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to change password. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.left}>
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
            Secure candidate account access.
          </p>

          <div className={styles.securityBadge}>
            <ShieldCheck size={16} strokeWidth={2.2} />
            <span>Protected Account Setup</span>
          </div>
        </div>

        <div className={styles.leftFooter}>
          Secure • Verified • Digital
        </div>
      </section>

      <section className={styles.right}>
        <div className={styles.formCard}>
          <div className={styles.iconBox}>
            <KeyRound size={22} />
          </div>

          <span className={styles.eyebrow}>
            FIRST LOGIN
          </span>

          <h1>Set your password</h1>

          <p className={styles.subtitle}>
            Welcome,{' '}
            <strong>{user?.name || 'Candidate'}</strong>.
            Create a personal password before accessing your
            candidate dashboard.
          </p>

          <div className={styles.notice}>
            <LockKeyhole size={16} />

            <div>
              <strong>Temporary password replacement</strong>
              <span>
                Your new password will be used for future
                candidate logins.
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className={styles.form}
            noValidate
          >
            <div className={styles.field}>
              <label htmlFor="newPassword">
                New Password
              </label>

              <div
                className={`${styles.inputWrap} ${
                  errors.newPass ? styles.hasError : ''
                }`}
              >
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={newPass}
                  onChange={(e) => {
                    setNewPass(e.target.value);

                    setErrors((prev) => ({
                      ...prev,
                      newPass: '',
                    }));
                  }}
                  placeholder="Enter your new password"
                />

                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowNew((prev) => !prev)}
                  aria-label={
                    showNew
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showNew ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>

              {newPass && strength && (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthTrack}>
                    <div
                      className={`${styles.strengthBar} ${
                        styles[
                          `strength${strength.label}`
                        ]
                      }`}
                      style={{
                        width: strength.width,
                      }}
                    />
                  </div>

                  <span>{strength.label}</span>
                </div>
              )}

              {errors.newPass && (
                <span className={styles.error}>
                  {errors.newPass}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div
                className={`${styles.inputWrap} ${
                  errors.confirmPass ? styles.hasError : ''
                }`}
              >
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={(e) => {
                    setConfirmPass(e.target.value);

                    setErrors((prev) => ({
                      ...prev,
                      confirmPass: '',
                    }));
                  }}
                  placeholder="Repeat your new password"
                />

                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() =>
                    setShowConfirm((prev) => !prev)
                  }
                  aria-label={
                    showConfirm
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showConfirm ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>

              {confirmPass && (
                <div
                  className={
                    newPass === confirmPass
                      ? styles.match
                      : styles.mismatch
                  }
                >
                  {newPass === confirmPass && (
                    <CheckCircle2 size={13} />
                  )}

                  {newPass === confirmPass
                    ? 'Passwords match'
                    : 'Passwords do not match'}
                </div>
              )}

              {errors.confirmPass && (
                <span className={styles.error}>
                  {errors.confirmPass}
                </span>
              )}
            </div>

            <div className={styles.requirements}>
              <span>Password requirements</span>

              <Requirement
                met={requirements.length}
                text="At least 8 characters"
              />

              <Requirement
                met={requirements.uppercase}
                text="One uppercase letter"
              />

              <Requirement
                met={requirements.number}
                text="One number"
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Saving password...
                </>
              ) : (
                <>
                  Set Password & Continue
                  <Check size={16} />
                </>
              )}
            </button>
          </form>

          <div className={styles.protected}>
            <ShieldCheck size={13} />
            Protected authentication portal
          </div>
        </div>
      </section>
    </div>
  );
};

const Requirement = ({ met, text }) => (
  <div
    className={`${styles.requirement} ${
      met ? styles.requirementMet : ''
    }`}
  >
    <span className={styles.requirementCheck}>
      {met && <Check size={10} strokeWidth={3} />}
    </span>

    {text}
  </div>
);

export default ChangePassword;