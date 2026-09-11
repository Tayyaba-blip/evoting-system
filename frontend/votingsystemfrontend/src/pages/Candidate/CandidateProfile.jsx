import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import { updateCandidateProfile } from '../../features/candidate/candidateSlice';
import styles from './CandidateProfile.module.css';

const CandidateProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile } = useSelector((s) => s.candidate);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwData, setPwData] = useState({ current: '', newPass: '', confirm: '' });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: profile?.name || '',
      constituency: profile?.constituency || '',
      tehsil: profile?.tehsil || '',
      city: profile?.city || '',
      province: profile?.province || '',
      photo: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([k, v]) => {
          if (k === 'photo' && v) formData.append('photo', v);
          else if (k !== 'photo') formData.append(k, v);
        });

        const { data } = await axiosInstance.put('/candidate/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        dispatch(updateCandidateProfile(data.candidate));
        toast.success('Profile updated successfully!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Update failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handlePasswordChange = async () => {
    if (pwData.newPass !== pwData.confirm) return toast.error('Passwords do not match');
    if (pwData.newPass.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await axiosInstance.put('/auth/change-password', { newPassword: pwData.newPass });
      toast.success('Password changed successfully!');
      setChangingPassword(false);
      setPwData({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue('photo', file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  if (!profile) return <div className={styles.loading}>Loading profile...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>Candidate Profile</h1>
      </div>

      <div className={styles.layout}>
        {/* Left: Photo Card */}
        <div className={styles.photoCard}>
          <div className={styles.avatarWrap} onClick={() => document.getElementById('photoInput').click()}>
            {photoPreview || profile.photo ? (
              <img src={photoPreview || `${import.meta.env.VITE_API_BASE}${profile.photo}`} alt="Profile" className={styles.avatar} />
            ) : (
              <div className={styles.avatarFallback}>{profile.name?.[0] || '?'}</div>
            )}
            <div className={styles.avatarOverlay}>📷 Change</div>
          </div>
          <input id="photoInput" type="file" accept="image/*" hidden onChange={handlePhotoChange} />

          <h2 className={styles.name}>{profile.name}</h2>
          <p className={styles.email}>{profile.email}</p>

          <div className={styles.badges}>
            <span className={styles.badge}>{profile.electionType}</span>
            <span className={styles.badge}>{profile.party?.abbreviation || 'Independent'}</span>
          </div>

          <div className={styles.statRow}>
            <div className={styles.stat}>
              <span>{profile.totalVotes?.toLocaleString() || 0}</span>
              <small>Total Votes</small>
            </div>
            <div className={styles.stat}>
              <span>{profile.constituency || '—'}</span>
              <small>Constituency</small>
            </div>
          </div>

          {profile.symbol && (
            <div className={styles.symbolWrap}>
              <p>Election Symbol</p>
              <img src={`${import.meta.env.VITE_API_BASE}${profile.symbol}`} alt="Symbol" className={styles.symbol} />
            </div>
          )}
        </div>

        {/* Right: Edit Form */}
        <div className={styles.formSection}>
          <form onSubmit={formik.handleSubmit} className={styles.form}>
            <h3>Edit Information</h3>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>Full Name</label>
                <input type="text" {...formik.getFieldProps('name')} />
                {formik.touched.name && formik.errors.name && <span className={styles.error}>{formik.errors.name}</span>}
              </div>
              <div className={styles.field}>
                <label>Constituency</label>
                <input type="text" {...formik.getFieldProps('constituency')} />
              </div>
              <div className={styles.field}>
                <label>Tehsil</label>
                <input type="text" {...formik.getFieldProps('tehsil')} />
              </div>
              <div className={styles.field}>
                <label>City</label>
                <input type="text" {...formik.getFieldProps('city')} />
              </div>
              <div className={styles.field}>
                <label>Province</label>
                <input type="text" {...formik.getFieldProps('province')} />
              </div>
            </div>

            <div className={styles.readOnly}>
              <label>Email (read-only)</label>
              <input type="text" value={profile.email} readOnly className={styles.readInput} />
            </div>
            <div className={styles.readOnly}>
              <label>CNIC (read-only)</label>
              <input type="text" value={profile.cnic || '—'} readOnly className={styles.readInput} />
            </div>

            <button type="submit" className={styles.saveBtn} disabled={formik.isSubmitting}>
              {formik.isSubmitting ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </form>

          {/* Password Change Section */}
          <div className={styles.passwordSection}>
            <div className={styles.pwHeader}>
              <h3>Password</h3>
              <button className={styles.pwToggle} onClick={() => setChangingPassword(!changingPassword)}>
                {changingPassword ? 'Cancel' : '🔑 Change Password'}
              </button>
            </div>

            {changingPassword && (
              <div className={styles.pwForm}>
                <div className={styles.field}>
                  <label>New Password</label>
                  <input type="password" placeholder="Min 6 characters" value={pwData.newPass} onChange={(e) => setPwData({ ...pwData, newPass: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Repeat password" value={pwData.confirm} onChange={(e) => setPwData({ ...pwData, confirm: e.target.value })} />
                </div>
                <button className={styles.saveBtn} onClick={handlePasswordChange}>✅ Update Password</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;