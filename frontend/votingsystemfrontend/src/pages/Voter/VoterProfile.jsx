import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Circle,
  CreditCard,
  FileImage,
  ImagePlus,
  LockKeyhole,
  MapPin,
  Save,
  ShieldCheck,
  Upload,
  UserRound,
  Vote,
} from 'lucide-react';

import axiosInstance from '../../api/axiosInstance';
import {
  fetchVoterProfile,
  updateVoterProfile,
} from '../../features/voter/voterSlice';
import {
  formatFullName,
  formatDate,
  PAKISTAN_PROVINCES,
} from '../../utils/formatters';
import { getImageUrl } from '../../utils/imageUrl';
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

  useEffect(() => {
    if (!profile) {
      dispatch(fetchVoterProfile());
    }
  }, [dispatch, profile]);

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

        Object.entries(values).forEach(([key, value]) => {
          const isFile =
            key === 'profileImage' ||
            key === 'cnicFrontImage' ||
            key === 'cnicBackImage';

          if (value && isFile) {
            formData.append(key, value);
          } else if (!isFile) {
            formData.append(key, value);
          }
        });

        const { data } = await axiosInstance.put(
          '/voter/profile',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        dispatch(updateVoterProfile(data.user));
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

  const handleFile = (field, e, setPreview) => {
    const file = e.target.files[0];

    if (file) {
      formik.setFieldValue(field, file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImages = async (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    setAdditionalPreviews(
      files.map((file) => URL.createObjectURL(file))
    );

    const formData = new FormData();

    files.forEach((file) => {
      formData.append('additionalImages', file);
    });

    try {
      await axiosInstance.put('/voter/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Additional images uploaded!');
      dispatch(fetchVoterProfile());
    } catch (err) {
      toast.error('Failed to upload additional images');
    }
  };

  if (!profile && loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <span>Loading your profile...</span>
      </div>
    );
  }

  const fullName = profile
    ? formatFullName(
        profile.firstName,
        profile.middleName,
        profile.lastName
      )
    : '';

  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlowOne} />
      <div className={styles.backgroundGlowTwo} />

      <main className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.back}
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <span className={styles.eyebrow}>
                VOTER ACCOUNT
              </span>

              <h1 className={styles.title}>My Profile</h1>

              <p>
                Manage your personal information and identity
                documents.
              </p>
            </div>
          </div>

          <div className={styles.secureBadge}>
            <ShieldCheck size={16} />
            Verified voter account
          </div>
        </header>

        <div className={styles.layout}>
          {/* PROFILE CARD */}
          <aside className={styles.profileCard}>
            <div className={styles.profileCardGlow} />

            <div className={styles.avatarSection}>
              <button
                type="button"
                className={styles.avatarWrap}
                onClick={() =>
                  document.getElementById('profileImg').click()
                }
                aria-label="Change profile photo"
              >
                {profileImagePreview || profile?.profileImage ? (
                  <img
                    src={
                      profileImagePreview ||
                      getImageUrl(profile.profileImage)
                    }
                    alt="Profile"
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarFallback}>
                    {profile?.firstName?.[0]?.toUpperCase() || 'V'}
                  </div>
                )}

                <div className={styles.avatarOverlay}>
                  <Camera size={20} />
                  <span>Change</span>
                </div>
              </button>

              <input
                id="profileImg"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  handleFile(
                    'profileImage',
                    e,
                    setProfileImagePreview
                  )
                }
              />
            </div>

            <div className={styles.identity}>
              <span className={styles.voterLabel}>
                <ShieldCheck size={13} />
                REGISTERED VOTER
              </span>

              <h2 className={styles.name}>{fullName}</h2>

              <p className={styles.cnic}>
                <CreditCard size={14} />
                {profile?.cnicNumber || '—'}
              </p>
            </div>

            <div className={styles.statGrid}>
              <div
                className={`${styles.stat} ${
                  profile?.hasVotedMNA ? styles.statDone : ''
                }`}
              >
                {profile?.hasVotedMNA ? (
                  <CheckCircle2 />
                ) : (
                  <Circle />
                )}

                <strong>MNA</strong>
                <small>
                  {profile?.hasVotedMNA ? 'Vote cast' : 'Pending'}
                </small>
              </div>

              <div
                className={`${styles.stat} ${
                  profile?.hasVotedMPA ? styles.statDone : ''
                }`}
              >
                {profile?.hasVotedMPA ? (
                  <CheckCircle2 />
                ) : (
                  <Circle />
                )}

                <strong>MPA</strong>
                <small>
                  {profile?.hasVotedMPA ? 'Vote cast' : 'Pending'}
                </small>
              </div>

              <div className={styles.stat}>
                <MapPin />
                <strong>{profile?.province || '—'}</strong>
                <small>Province</small>
              </div>
            </div>

            <div className={styles.divider} />

            {/* CNIC */}
            <section className={styles.cnicSection}>
              <div className={styles.sectionHeading}>
                <div>
                  <h3>CNIC Documents</h3>
                  <p>Front and back identity documents</p>
                </div>

                <LockKeyhole size={16} />
              </div>

              <div className={styles.cnicRow}>
                <button
                  type="button"
                  className={styles.cnicBox}
                  onClick={() =>
                    document.getElementById('cnicFront').click()
                  }
                >
                  {cnicFrontPreview ||
                  profile?.cnicFrontImage ? (
                    <img
                      src={
                        cnicFrontPreview ||
                        getImageUrl(profile.cnicFrontImage)
                      }
                      alt="CNIC Front"
                    />
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <FileImage size={20} />
                      <strong>Front</strong>
                      <span>Upload image</span>
                    </div>
                  )}

                  <span className={styles.documentOverlay}>
                    <Upload size={14} />
                    Replace
                  </span>
                </button>

                <button
                  type="button"
                  className={styles.cnicBox}
                  onClick={() =>
                    document.getElementById('cnicBack').click()
                  }
                >
                  {cnicBackPreview ||
                  profile?.cnicBackImage ? (
                    <img
                      src={
                        cnicBackPreview ||
                        getImageUrl(profile.cnicBackImage)
                      }
                      alt="CNIC Back"
                    />
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <FileImage size={20} />
                      <strong>Back</strong>
                      <span>Upload image</span>
                    </div>
                  )}

                  <span className={styles.documentOverlay}>
                    <Upload size={14} />
                    Replace
                  </span>
                </button>
              </div>

              <input
                id="cnicFront"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  handleFile(
                    'cnicFrontImage',
                    e,
                    setCnicFrontPreview
                  )
                }
              />

              <input
                id="cnicBack"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  handleFile(
                    'cnicBackImage',
                    e,
                    setCnicBackPreview
                  )
                }
              />
            </section>

            <div className={styles.divider} />

            {/* ADDITIONAL IMAGES */}
            <section className={styles.additionalSection}>
              <div className={styles.sectionHeading}>
                <div>
                  <h3>Face Recognition</h3>
                  <p>Additional verification images</p>
                </div>

                <UserRound size={16} />
              </div>

              {(profile?.additionalImages?.length > 0 ||
                additionalPreviews.length > 0) && (
                <div className={styles.additionalGrid}>
                  {profile?.additionalImages?.map((img, i) => (
                    <img
                      key={i}
                      src={getImageUrl(img)}
                      alt={`Face ${i + 1}`}
                      className={styles.additionalImg}
                    />
                  ))}

                  {additionalPreviews.map((preview, i) => (
                    <img
                      key={`preview-${i}`}
                      src={preview}
                      alt={`New face ${i + 1}`}
                      className={styles.additionalImg}
                    />
                  ))}
                </div>
              )}

              <label className={styles.uploadMoreBtn}>
                <ImagePlus size={16} />
                Add Face Images

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleAdditionalImages}
                />
              </label>
            </section>
          </aside>

          {/* EDIT FORM */}
          <section className={styles.editSection}>
            <div className={styles.formTop}>
              <div>
                <span className={styles.eyebrow}>
                  ACCOUNT DETAILS
                </span>
                <h2>Edit Information</h2>
                <p>
                  Keep your voter information accurate and up to
                  date.
                </p>
              </div>

              <div className={styles.formIcon}>
                <UserRound size={21} />
              </div>
            </div>

            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${
                  activeTab === 'info' ? styles.activeTab : ''
                }`}
                onClick={() => setActiveTab('info')}
              >
                <UserRound size={16} />
                Personal Information
              </button>

              <button
                type="button"
                className={`${styles.tab} ${
                  activeTab === 'address' ? styles.activeTab : ''
                }`}
                onClick={() => setActiveTab('address')}
              >
                <MapPin size={16} />
                Address
              </button>
            </div>

            <form
              onSubmit={formik.handleSubmit}
              className={styles.form}
            >
              {activeTab === 'info' && (
                <>
                  <div className={styles.formSectionTitle}>
                    <h3>Personal details</h3>
                    <p>
                      Your name can be updated. Identity information
                      remains protected.
                    </p>
                  </div>

                  <div className={styles.grid3}>
                    <div className={styles.field}>
                      <label>First Name *</label>
                      <input
                        type="text"
                        {...formik.getFieldProps('firstName')}
                      />

                      {formik.touched.firstName &&
                        formik.errors.firstName && (
                          <span className={styles.error}>
                            {formik.errors.firstName}
                          </span>
                        )}
                    </div>

                    <div className={styles.field}>
                      <label>Middle Name</label>
                      <input
                        type="text"
                        {...formik.getFieldProps('middleName')}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>Last Name *</label>
                      <input
                        type="text"
                        {...formik.getFieldProps('lastName')}
                      />

                      {formik.touched.lastName &&
                        formik.errors.lastName && (
                          <span className={styles.error}>
                            {formik.errors.lastName}
                          </span>
                        )}
                    </div>
                  </div>

                  <div className={styles.protectedHeading}>
                    <LockKeyhole size={15} />

                    <div>
                      <strong>Protected identity fields</strong>
                      <span>
                        These fields cannot be edited from your
                        profile.
                      </span>
                    </div>
                  </div>

                  <div className={styles.readGrid}>
                    <div className={styles.field}>
                      <label>CNIC</label>
                      <input
                        type="text"
                        value={profile?.cnicNumber || '—'}
                        readOnly
                        className={styles.readInput}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>Date of Birth</label>
                      <input
                        type="text"
                        value={
                          profile?.dateOfBirth
                            ? formatDate(profile.dateOfBirth)
                            : '—'
                        }
                        readOnly
                        className={styles.readInput}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>Gender</label>
                      <input
                        type="text"
                        value={profile?.gender || '—'}
                        readOnly
                        className={styles.readInput}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>CNIC Expiry</label>
                      <input
                        type="text"
                        value={profile?.cnicExpiry || '—'}
                        readOnly
                        className={styles.readInput}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'address' && (
                <>
                  <div className={styles.formSectionTitle}>
                    <h3>Registered address</h3>
                    <p>
                      Update your current location and constituency
                      information.
                    </p>
                  </div>

                  <div className={styles.field}>
                    <label>Full Address</label>
                    <textarea
                      {...formik.getFieldProps('address')}
                      rows={3}
                      placeholder="House number, street, area..."
                    />
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.field}>
                      <label>District</label>
                      <input
                        type="text"
                        {...formik.getFieldProps('district')}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>City</label>
                      <input
                        type="text"
                        {...formik.getFieldProps('city')}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>Area</label>
                      <input
                        type="text"
                        {...formik.getFieldProps('area')}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>Tehsil</label>
                      <input
                        type="text"
                        {...formik.getFieldProps('tehsil')}
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>Province</label>

                    <select
                      {...formik.getFieldProps('province')}
                    >
                      <option value="">Select Province</option>

                      {PAKISTAN_PROVINCES.map((province) => (
                        <option
                          key={province}
                          value={province}
                        >
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className={styles.formActions}>
                <span className={styles.saveNote}>
                  <ShieldCheck size={14} />
                  Changes are securely saved to your account.
                </span>

                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={formik.isSubmitting}
                >
                  <Save size={16} />

                  {formik.isSubmitting
                    ? 'Saving Changes...'
                    : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default VoterProfile;