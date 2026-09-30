import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Camera,
  Check,
  KeyRound,
  LockKeyhole,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import axiosInstance from '../../api/axiosInstance';
import {
  fetchCandidateProfile,
  updateCandidateProfile,
} from '../../features/candidate/candidateSlice';
import { getImageUrl } from '../../utils/imageUrl';

import styles from './CandidateProfile.module.css';

const CandidateProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { profile } = useSelector((s) => s.candidate);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwData, setPwData] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  useEffect(() => {
    if (!profile) {
      dispatch(fetchCandidateProfile());
    }
  }, [dispatch, profile]);

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

        Object.entries(values).forEach(([key, value]) => {
          if (key === 'photo' && value) {
            formData.append('photo', value);
          } else if (key !== 'photo') {
            formData.append(key, value);
          }
        });

        const { data } = await axiosInstance.put(
          '/candidate/profile',
          formData
        );

        dispatch(updateCandidateProfile(data.candidate));
        toast.success('Profile updated successfully!');
      } catch (err) {
        toast.error(
          err.response?.data?.message || 'Update failed'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handlePasswordChange = async () => {
    if (pwData.newPass !== pwData.confirm) {
      return toast.error('Passwords do not match');
    }

    if (pwData.newPass.length < 6) {
      return toast.error(
        'Password must be at least 6 characters'
      );
    }

    try {
      await axiosInstance.put('/auth/change-password', {
        newPassword: pwData.newPass,
      });

      toast.success('Password changed successfully!');

      setChangingPassword(false);

      setPwData({
        current: '',
        newPass: '',
        confirm: '',
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Password change failed'
      );
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    formik.setFieldValue('photo', file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  if (!profile) {
    return (
      <div className={styles.loading}>
        <span className={styles.spinner} />
        Loading profile...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.background} aria-hidden="true">
        <div className={styles.glowOne} />
        <div className={styles.glowTwo} />
      </div>

      <main className={styles.container}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.back}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div>
            <span className={styles.eyebrow}>
              CANDIDATE ACCOUNT
            </span>

            <h1>Candidate Profile</h1>

            <p>Manage your personal and election information.</p>
          </div>
        </header>

        <div className={styles.layout}>
          <aside className={styles.photoCard}>
            <button
              type="button"
              className={styles.avatarWrap}
              onClick={() =>
                document.getElementById('photoInput')?.click()
              }
            >
              {photoPreview || profile.photo ? (
                <img
                  src={
                    photoPreview ||
                    getImageUrl(profile.photo)
                  }
                  alt="Candidate"
                />
              ) : (
                <UserRound size={45} strokeWidth={1.5} />
              )}

              <span className={styles.avatarOverlay}>
                <Camera size={15} />
                Change photo
              </span>
            </button>

            <input
              id="photoInput"
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoChange}
            />

            <div className={styles.identity}>
              <h2>{profile.name}</h2>
              <p>{profile.email}</p>
            </div>

            <div className={styles.verified}>
              <ShieldCheck size={14} />
              Verified Candidate
            </div>

            <div className={styles.badges}>
              {profile.electionType && (
                <span>{profile.electionType}</span>
              )}

              <span>
                {profile.party?.abbreviation || 'Independent'}
              </span>
            </div>

            <div className={styles.statRow}>
              <div>
                <strong>
                  {profile.totalVotes?.toLocaleString() || 0}
                </strong>
                <span>Total Votes</span>
              </div>

              <div>
                <strong>{profile.constituency || '—'}</strong>
                <span>Constituency</span>
              </div>
            </div>

            {profile.symbol && (
              <div className={styles.symbolWrap}>
                <span>Election Symbol</span>

                <img
                  src={getImageUrl(profile.symbol)}
                  alt="Election symbol"
                />
              </div>
            )}
          </aside>

          <section className={styles.content}>
            <form
              onSubmit={formik.handleSubmit}
              className={styles.formCard}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <UserRound size={18} />
                </div>

                <div>
                  <h3>Personal Information</h3>
                  <p>Update your candidate profile details.</p>
                </div>
              </div>

              <div className={styles.grid2}>
                <Field
                  label="Full Name"
                  name="name"
                  formik={formik}
                />

                <Field
                  label="Constituency"
                  name="constituency"
                  formik={formik}
                />

                <Field
                  label="Tehsil"
                  name="tehsil"
                  formik={formik}
                />

                <Field
                  label="City"
                  name="city"
                  formik={formik}
                />

                <Field
                  label="Province"
                  name="province"
                  formik={formik}
                />
              </div>

              <div className={styles.divider} />

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Email</label>
                  <input
                    value={profile.email || ''}
                    readOnly
                    className={styles.readInput}
                  />
                  <small>Account email cannot be changed here.</small>
                </div>

                <div className={styles.field}>
                  <label>CNIC</label>
                  <input
                    value={profile.cnic || '—'}
                    readOnly
                    className={styles.readInput}
                  />
                  <small>Identity information is read-only.</small>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? (
                    <>
                      <span className={styles.spinner} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>

            <section className={styles.passwordCard}>
              <div className={styles.passwordHeader}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    <KeyRound size={18} />
                  </div>

                  <div>
                    <h3>Password & Security</h3>
                    <p>Update your account password.</p>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.changeBtn}
                  onClick={() =>
                    setChangingPassword((prev) => !prev)
                  }
                >
                  <LockKeyhole size={14} />
                  {changingPassword ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {changingPassword && (
                <div className={styles.passwordForm}>
                  <div className={styles.field}>
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={pwData.newPass}
                      onChange={(e) =>
                        setPwData({
                          ...pwData,
                          newPass: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Repeat password"
                      value={pwData.confirm}
                      onChange={(e) =>
                        setPwData({
                          ...pwData,
                          confirm: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button
                    type="button"
                    className={styles.updatePasswordBtn}
                    onClick={handlePasswordChange}
                  >
                    <Check size={15} />
                    Update Password
                  </button>
                </div>
              )}
            </section>
          </section>
        </div>
      </main>
    </div>
  );
};

const Field = ({ label, name, formik }) => (
  <div className={styles.field}>
    <label htmlFor={name}>{label}</label>

    <input
      id={name}
      type="text"
      {...formik.getFieldProps(name)}
    />

    {formik.touched[name] && formik.errors[name] && (
      <span className={styles.error}>
        {formik.errors[name]}
      </span>
    )}
  </div>
);

export default CandidateProfile;