import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { changePassword } from '../../api/authApi';
import { updateUser } from '../../features/auth/authSlice';
import styles from './ChangePassword.module.css';

const ChangePassword = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { user }  = useSelector((s) => s.auth);

  const [newPass,    setNewPass]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew,    setShowNew]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState({});

  /* ── Password strength ──────────────────────────── */
  const getStrength = (pw) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8)           score++;
    if (/[A-Z]/.test(pw))         score++;
    if (/[0-9]/.test(pw))         score++;
    if (/[^A-Za-z0-9]/.test(pw))  score++;
    return [
      { label: 'Weak',   color: '#ef4444', width: '25%' },
      { label: 'Fair',   color: '#f97316', width: '50%' },
      { label: 'Good',   color: '#eab308', width: '75%' },
      { label: 'Strong', color: '#22c55e', width: '100%' },
    ][score - 1] || { label: 'Weak', color: '#ef4444', width: '25%' };
  };

  const strength = getStrength(newPass);

  /* ── Validation ─────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!newPass)              e.newPass = 'New password is required.';
    else if (newPass.length < 8) e.newPass = 'Must be at least 8 characters.';
    else if (!/[A-Z]/.test(newPass)) e.newPass = 'Must contain at least one uppercase letter.';
    else if (!/[0-9]/.test(newPass)) e.newPass = 'Must contain at least one number.';

    if (!confirmPass)              e.confirmPass = 'Please confirm your password.';
    else if (newPass !== confirmPass) e.confirmPass = 'Passwords do not match.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ──────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await changePassword({ newPassword: newPass });

      // Update local user so mustChangePassword flag is cleared
      dispatch(updateUser({ mustChangePassword: false }));
      const updatedUser = { ...user, mustChangePassword: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('🎉 Password changed! You can now use this password to log in.');
      navigate('/candidate/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgOverlay} />

      {/* ── Left panel ── */}
      <div className={styles.left}>
        <div className={styles.leftInner}>
          <div className={styles.ecpLogo}>🗳️</div>
          <h2 className={styles.ecpName}>Election Commission of Pakistan</h2>
          <p className={styles.ecpTagline}>
            Secure. Verified.<br />Digital Voting System.
          </p>
          <div className={styles.ecpFeatures}>
            <div className={styles.feature}><span>🔐</span> Secure Your Account</div>
            <div className={styles.feature}><span>🛡️</span> Strong Password Required</div>
            <div className={styles.feature}><span>⛓️</span> Blockchain Secured</div>
            <div className={styles.feature}><span>🇵🇰</span> For Pakistan</div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className={styles.right}>
        <div className={styles.formCard}>

          {/* Header badge */}
          <div className={styles.firstTimeBadge}>
            🔑 First Login — Password Setup Required
          </div>

          <h1 className={styles.title}>Set Your Password</h1>
          <p className={styles.subtitle}>
            Welcome, <strong>{user?.name || 'Candidate'}</strong>! Your account was created by the
            Election Commission. You must set a personal password before continuing.
          </p>

          <div className={styles.infoBox}>
            ℹ️ Your temporary password will be replaced. Use your new password for all future logins.
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>

            {/* New Password */}
            <div className={styles.field}>
              <label>New Password</label>
              <div className={styles.inputWrap}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPass}
                  onChange={(e) => { setNewPass(e.target.value); setErrors((prev) => ({ ...prev, newPass: '' })); }}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className={errors.newPass ? styles.inputError : ''}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowNew((s) => !s)}
                  tabIndex={-1}
                >
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Strength bar */}
              {newPass && strength && (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthTrack}>
                    <div
                      className={styles.strengthBar}
                      style={{ width: strength.width, background: strength.color }}
                    />
                  </div>
                  <span className={styles.strengthLabel} style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}

              {errors.newPass && <span className={styles.error}>{errors.newPass}</span>}
            </div>

            {/* Confirm Password */}
            <div className={styles.field}>
              <label>Confirm Password</label>
              <div className={styles.inputWrap}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={(e) => { setConfirmPass(e.target.value); setErrors((prev) => ({ ...prev, confirmPass: '' })); }}
                  placeholder="Repeat your new password"
                  className={errors.confirmPass ? styles.inputError : ''}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm((s) => !s)}
                  tabIndex={-1}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Match indicator */}
              {confirmPass && (
                <span className={newPass === confirmPass ? styles.matchOk : styles.matchFail}>
                  {newPass === confirmPass ? '✅ Passwords match' : '❌ Passwords do not match'}
                </span>
              )}

              {errors.confirmPass && <span className={styles.error}>{errors.confirmPass}</span>}
            </div>

            {/* Requirements checklist */}
            <div className={styles.requirements}>
              <p className={styles.reqTitle}>Password must have:</p>
              <ul>
                <li className={newPass.length >= 8 ? styles.reqMet : styles.reqPending}>
                  {newPass.length >= 8 ? '✅' : '⭕'} At least 8 characters
                </li>
                <li className={/[A-Z]/.test(newPass) ? styles.reqMet : styles.reqPending}>
                  {/[A-Z]/.test(newPass) ? '✅' : '⭕'} One uppercase letter (A–Z)
                </li>
                <li className={/[0-9]/.test(newPass) ? styles.reqMet : styles.reqPending}>
                  {/[0-9]/.test(newPass) ? '✅' : '⭕'} One number (0–9)
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading
                ? <><span className={styles.spinner} /> Saving password...</>
                : '🔐 Set Password & Continue →'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;