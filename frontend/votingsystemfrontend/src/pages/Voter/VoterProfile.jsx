import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import { fetchVoterProfile } from '../../features/voter/voterSlice';
import { updateVoterProfile } from '../../features/voter/voterSlice';
import { formatFullName, formatDate, PAKISTAN_PROVINCES } from '../../utils/formatters';
import styles from './VoterProfile.module.css';

const VoterProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading } = useSelector((s) => s.voter);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [cnicFrontPreview, setCnicFrontPreview] = useState(null);
  const [cnicBackPreview, setCnicBackPreview] = useState(null);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => { if (!profile) dispatch(fetchVoterProfile()); }, [dispatch, profile]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: profile?.firstName || '',
      middleName: profile?.middleName || '',
      lastName: profile?.lastName || '',
      address: profile?.address || '',
      district: profile?.district || '',
      city: profile?.city || '',
      area: profile?.area || '',
      tehsil: profile?.tehsil || '',
      province: profile?.province || '',
      profileImage: null,
      cnicFrontImage: null,
      cnicBackImage: null,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name required'),
      lastName: Yup.string().required('Last name required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([k, v]) => {
          if (v && (k === 'profileImage' || k === 'cnicFrontImage' || k === 'cnicBackImage')) {
            formData.append(k, v);
          } else if (k !== 'profileImage' && k !== 'cnicFrontImage' && k !== 'cnicBackImage') {
            formData.append(k, v);
          }
        });

        const { data } = await axiosInstance.put('/voter/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        dispatch(updateVoterProfile(data.user));
        toast.success('Profile updated successfully!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Update failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFile = (field, e, setPreview) => {
    const file = e.target.files[0];
    if (file) { formik.setFieldValue(field, file); setPreview(URL.createObjectURL(file)); }
  };

  const handleAdditionalImages = async (e) => {
    const files = Array.from(e.target.files);
    setAdditionalPreviews(files.map((f) => URL.createObjectURL(f)));

    const formData = new FormData();
    files.forEach((f) => formData.append('additionalImages', f));
    try {
      await axiosInstance.put('/voter/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Additional images uploaded!');
      dispatch(fetchVoterProfile());
    } catch (err) {
      toast.error('Failed to upload additional images');
    }
  };

  if (!profile && loading) return <div className={styles.loading}>Loading profile...</div>;

  const fullName = profile ? formatFullName(profile.firstName, profile.middleName, profile.lastName) : '';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>My Profile</h1>
      </div>

      <div className={styles.layout}>
        {/* Left: Profile Card */}
        <div className={styles.profileCard}>
          {/* Profile Image */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrap} onClick={() => document.getElementById('profileImg').click()}>
              {profileImagePreview || profile?.profileImage ? (
                <img src={profileImagePreview || `${`http://localhost:5000${profile.profileImage}`}`} alt="Profile" className={styles.avatar} />
              ) : (
                <div className={styles.avatarFallback}>{profile?.firstName?.[0]?.toUpperCase() || '?'}</div>
              )}
              <div className={styles.avatarOverlay}>📷 Change Photo</div>
            </div>
            <input id="profileImg" type="file" accept="image/*" hidden onChange={(e) => handleFile('profileImage', e, setProfileImagePreview)} />
          </div>

          <h2 className={styles.name}>{fullName}</h2>
          <p className={styles.cnic}>🪪 {profile?.cnicNumber || '—'}</p>

          <div className={styles.statGrid}>
            <div className={styles.stat}>
              <span>{profile?.hasVotedMNA ? '✅' : '⭕'}</span>
              <small>MNA Voted</small>
            </div>
            <div className={styles.stat}>
              <span>{profile?.hasVotedMPA ? '✅' : '⭕'}</span>
              <small>MPA Voted</small>
            </div>
            <div className={styles.stat}>
              <span>{profile?.province || '—'}</span>
              <small>Province</small>
            </div>
          </div>

          {/* CNIC Images */}
          <div className={styles.cnicSection}>
            <h4>CNIC Documents</h4>
            <div className={styles.cnicRow}>
              <div className={styles.cnicBox} onClick={() => document.getElementById('cnicFront').click()}>
                {cnicFrontPreview || profile?.cnicFrontImage ? (
                  <img src={cnicFrontPreview || `${`http://localhost:5000${profile.profileImage}`}`} alt="CNIC Front" />
                ) : <><span>📄</span><small>CNIC Front</small></>}
              </div>
              <div className={styles.cnicBox} onClick={() => document.getElementById('cnicBack').click()}>
                {cnicBackPreview || profile?.cnicBackImage ? (
                  <img src={cnicBackPreview || `${`http://localhost:5000${profile.profileImage}`}}`} alt="CNIC Back" />
                ) : <><span>📄</span><small>CNIC Back</small></>}
              </div>
            </div>
            <input id="cnicFront" type="file" accept="image/*" hidden onChange={(e) => handleFile('cnicFrontImage', e, setCnicFrontPreview)} />
            <input id="cnicBack" type="file" accept="image/*" hidden onChange={(e) => handleFile('cnicBackImage', e, setCnicBackPreview)} />
          </div>

          {/* Additional Images */}
          <div className={styles.additionalSection}>
            <h4>Additional Face Images</h4>
            <p>Upload more face images to improve recognition accuracy</p>
            <div className={styles.additionalGrid}>
              {profile?.additionalImages?.map((img, i) => (
                <img key={i} src={`${import.meta.env.VITE_API_BASE}${img}`} alt={`Face ${i + 1}`} className={styles.additionalImg} />
              ))}
              {additionalPreviews.map((prev, i) => (
                <img key={`prev-${i}`} src={prev} alt={`New ${i}`} className={styles.additionalImg} />
              ))}
            </div>
            <label className={styles.uploadMoreBtn}>
              📷 Upload More Images
              <input type="file" accept="image/*" multiple hidden onChange={handleAdditionalImages} />
            </label>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div className={styles.editSection}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab === 'info' ? styles.activeTab : ''}`} onClick={() => setActiveTab('info')}>Personal Info</button>
            <button className={`${styles.tab} ${activeTab === 'address' ? styles.activeTab : ''}`} onClick={() => setActiveTab('address')}>Address</button>
          </div>

          <form onSubmit={formik.handleSubmit} className={styles.form}>
            {activeTab === 'info' && (
              <>
                <div className={styles.grid3}>
                  <div className={styles.field}>
                    <label>First Name *</label>
                    <input type="text" {...formik.getFieldProps('firstName')} />
                    {formik.touched.firstName && formik.errors.firstName && <span className={styles.error}>{formik.errors.firstName}</span>}
                  </div>
                  <div className={styles.field}>
                    <label>Middle Name</label>
                    <input type="text" {...formik.getFieldProps('middleName')} />
                  </div>
                  <div className={styles.field}>
                    <label>Last Name *</label>
                    <input type="text" {...formik.getFieldProps('lastName')} />
                    {formik.touched.lastName && formik.errors.lastName && <span className={styles.error}>{formik.errors.lastName}</span>}
                  </div>
                </div>

                {/* Read-only fields */}
                <div className={styles.readGrid}>
                  <div className={styles.field}>
                    <label>CNIC (read-only)</label>
                    <input type="text" value={profile?.cnicNumber || '—'} readOnly className={styles.readInput} />
                  </div>
                  <div className={styles.field}>
                    <label>Date of Birth (read-only)</label>
                    <input type="text" value={profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : '—'} readOnly className={styles.readInput} />
                  </div>
                  <div className={styles.field}>
                    <label>Gender (read-only)</label>
                    <input type="text" value={profile?.gender || '—'} readOnly className={styles.readInput} />
                  </div>
                  <div className={styles.field}>
                    <label>CNIC Expiry (read-only)</label>
                    <input type="text" value={profile?.cnicExpiry || '—'} readOnly className={styles.readInput} />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'address' && (
              <>
                <div className={styles.field}>
                  <label>Full Address</label>
                  <textarea {...formik.getFieldProps('address')} rows={3} placeholder="House number, street, area..." />
                </div>
                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label>District</label>
                    <input type="text" {...formik.getFieldProps('district')} />
                  </div>
                  <div className={styles.field}>
                    <label>City</label>
                    <input type="text" {...formik.getFieldProps('city')} />
                  </div>
                  <div className={styles.field}>
                    <label>Area</label>
                    <input type="text" {...formik.getFieldProps('area')} />
                  </div>
                  <div className={styles.field}>
                    <label>Tehsil</label>
                    <input type="text" {...formik.getFieldProps('tehsil')} />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Province</label>
                  <select {...formik.getFieldProps('province')}>
                    <option value="">Select Province</option>
                    {PAKISTAN_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </>
            )}

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn} disabled={formik.isSubmitting}>
                {formik.isSubmitting ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VoterProfile;