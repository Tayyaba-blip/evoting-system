import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import {
  ArrowLeft,
  Camera,
  ImagePlus,
  Info,
  Plus,
  Upload,
  UserPlus,
} from 'lucide-react';

import axiosInstance from '../../api/axiosInstance';

import {
  fetchParties,
  addCandidateLocal,
} from '../../features/admin/adminSlice';

import { PAKISTAN_PROVINCES } from '../../utils/formatters';

import styles from './AddCandidate.module.css';

const AddCandidate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { parties } = useSelector((s) => s.admin);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [symbolPreview, setSymbolPreview] = useState(null);

  useEffect(() => {
    dispatch(fetchParties());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      constituency: '',
      tehsil: '',
      city: '',
      province: '',
      electionType: 'MNA',
      party: '',
      photo: null,
      symbol: null,
    },

    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),

      email: Yup.string()
        .email('Invalid email')
        .required('Email is required'),

      constituency: Yup.string().required(
        'Constituency is required'
      ),

      tehsil: Yup.string().required('Tehsil is required'),

      city: Yup.string().required('City is required'),

      province: Yup.string().required('Province is required'),

      electionType: Yup.string()
        .oneOf(['MNA', 'MPA'])
        .required(),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();

        Object.entries(values).forEach(([key, value]) => {
          if (
            (key === 'photo' || key === 'symbol') &&
            value
          ) {
            formData.append(key, value);
          } else if (
            key !== 'photo' &&
            key !== 'symbol'
          ) {
            formData.append(key, value);
          }
        });

        const { data } = await axiosInstance.post(
          '/admin/candidates',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        dispatch(addCandidateLocal(data.candidate));

        toast.success(
          `Candidate "${data.candidate.name}" added! Welcome email sent.`
        );

        navigate('/admin/dashboard/candidates');
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            'Failed to add candidate'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFile = (field, e, setPreview) => {
    const file = e.target.files?.[0];

    if (!file) return;

    formik.setFieldValue(field, file);
    setPreview(URL.createObjectURL(file));
  };

  const openFilePicker = (id) => {
    document.getElementById(id)?.click();
  };

  return (
    <div className={styles.page}>
      {/* Background decoration */}
      <div className={styles.background} aria-hidden="true">
        <div className={styles.glowOne} />
        <div className={styles.glowTwo} />
      </div>

      <main className={styles.container}>
        {/* ================= HEADER ================= */}

        <header className={styles.header}>
          <button
            type="button"
            className={styles.back}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div className={styles.heading}>
            <span className={styles.eyebrow}>
              CANDIDATE MANAGEMENT
            </span>

            <h1 className={styles.title}>
              Add Candidate
            </h1>

            <p className={styles.subtitle}>
              Register a new election candidate.
            </p>
          </div>
        </header>

        {/* ================= GLASS FORM ================= */}

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <UserPlus size={20} />
            </div>

            <div>
              <h2>Candidate information</h2>

              <p>
                Enter the candidate's details and election
                information.
              </p>
            </div>
          </div>

          <form
            onSubmit={formik.handleSubmit}
            className={styles.form}
          >
            {/* ================= UPLOADS ================= */}

            <div className={styles.uploadRow}>
              {/* Candidate photo */}

              <button
                type="button"
                className={`${styles.uploadBox} ${
                  photoPreview ? styles.hasPreview : ''
                }`}
                onClick={() =>
                  openFilePicker('photoInput')
                }
              >
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="Candidate preview"
                      className={styles.uploadImg}
                    />

                    <div className={styles.uploadOverlay}>
                      <Camera size={15} />
                      <span>Change</span>
                    </div>
                  </>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <div className={styles.uploadIcon}>
                      <Camera size={19} />
                    </div>

                    <div>
                      <strong>Candidate photo</strong>
                      <span>Upload image</span>
                    </div>
                  </div>
                )}
              </button>

              {/* Election symbol */}

              <button
                type="button"
                className={`${styles.uploadBox} ${
                  symbolPreview ? styles.hasPreview : ''
                }`}
                onClick={() =>
                  openFilePicker('symbolInput')
                }
              >
                {symbolPreview ? (
                  <>
                    <img
                      src={symbolPreview}
                      alt="Election symbol preview"
                      className={styles.symbolImg}
                    />

                    <div className={styles.uploadOverlay}>
                      <ImagePlus size={15} />
                      <span>Change</span>
                    </div>
                  </>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <div className={styles.uploadIcon}>
                      <Upload size={19} />
                    </div>

                    <div>
                      <strong>Election symbol</strong>
                      <span>Upload image</span>
                    </div>
                  </div>
                )}
              </button>

              <input
                id="photoInput"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  handleFile(
                    'photo',
                    e,
                    setPhotoPreview
                  )
                }
              />

              <input
                id="symbolInput"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  handleFile(
                    'symbol',
                    e,
                    setSymbolPreview
                  )
                }
              />
            </div>

            <div className={styles.divider} />

            {/* ================= PERSONAL ================= */}

            <div className={styles.sectionHeading}>
              <span>PERSONAL DETAILS</span>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="name">
                  Full Name
                  <span>*</span>
                </label>

                <input
                  id="name"
                  type="text"
                  {...formik.getFieldProps('name')}
                  placeholder="Enter full name"
                  className={
                    formik.touched.name &&
                    formik.errors.name
                      ? styles.inputError
                      : ''
                  }
                />

                {formik.touched.name &&
                  formik.errors.name && (
                    <span className={styles.error}>
                      {formik.errors.name}
                    </span>
                  )}
              </div>

              <div className={styles.field}>
                <label htmlFor="email">
                  Email Address
                  <span>*</span>
                </label>

                <input
                  id="email"
                  type="email"
                  {...formik.getFieldProps('email')}
                  placeholder="candidate@example.com"
                  className={
                    formik.touched.email &&
                    formik.errors.email
                      ? styles.inputError
                      : ''
                  }
                />

                {formik.touched.email &&
                  formik.errors.email && (
                    <span className={styles.error}>
                      {formik.errors.email}
                    </span>
                  )}
              </div>
            </div>

            {/* ================= ELECTION ================= */}

            <div className={styles.sectionHeading}>
              <span>ELECTION DETAILS</span>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="electionType">
                  Election Type
                  <span>*</span>
                </label>

                <select
                  id="electionType"
                  {...formik.getFieldProps(
                    'electionType'
                  )}
                >
                  <option value="MNA">
                    MNA — National Assembly
                  </option>

                  <option value="MPA">
                    MPA — Provincial Assembly
                  </option>
                </select>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label htmlFor="party">
                    Party
                  </label>

                  <span className={styles.optional}>
                    Optional
                  </span>
                </div>

                <select
                  id="party"
                  {...formik.getFieldProps('party')}
                >
                  <option value="">
                    Independent — No Party
                  </option>

                  {parties && parties.length > 0 ? (
                    parties.map((party) => (
                      <option
                        key={party._id}
                        value={party._id}
                      >
                        {party.name}
                        {party.abbreviation
                          ? ` (${party.abbreviation})`
                          : ''}
                      </option>
                    ))
                  ) : (
                    <option disabled>
                      No parties available
                    </option>
                  )}
                </select>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="constituency">
                  Constituency
                  <span>*</span>
                </label>

                <input
                  id="constituency"
                  type="text"
                  {...formik.getFieldProps(
                    'constituency'
                  )}
                  placeholder="e.g. NA-75"
                  className={
                    formik.touched.constituency &&
                    formik.errors.constituency
                      ? styles.inputError
                      : ''
                  }
                />

                {formik.touched.constituency &&
                  formik.errors.constituency && (
                    <span className={styles.error}>
                      {formik.errors.constituency}
                    </span>
                  )}
              </div>

              <div className={styles.field}>
                <label htmlFor="tehsil">
                  Tehsil
                  <span>*</span>
                </label>

                <input
                  id="tehsil"
                  type="text"
                  {...formik.getFieldProps('tehsil')}
                  placeholder="Enter tehsil"
                  className={
                    formik.touched.tehsil &&
                    formik.errors.tehsil
                      ? styles.inputError
                      : ''
                  }
                />

                {formik.touched.tehsil &&
                  formik.errors.tehsil && (
                    <span className={styles.error}>
                      {formik.errors.tehsil}
                    </span>
                  )}
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="city">
                  City
                  <span>*</span>
                </label>

                <input
                  id="city"
                  type="text"
                  {...formik.getFieldProps('city')}
                  placeholder="Enter city"
                  className={
                    formik.touched.city &&
                    formik.errors.city
                      ? styles.inputError
                      : ''
                  }
                />

                {formik.touched.city &&
                  formik.errors.city && (
                    <span className={styles.error}>
                      {formik.errors.city}
                    </span>
                  )}
              </div>

              <div className={styles.field}>
                <label htmlFor="province">
                  Province
                  <span>*</span>
                </label>

                <select
                  id="province"
                  {...formik.getFieldProps('province')}
                  className={
                    formik.touched.province &&
                    formik.errors.province
                      ? styles.inputError
                      : ''
                  }
                >
                  <option value="">
                    Select Province
                  </option>

                  {PAKISTAN_PROVINCES.map(
                    (province) => (
                      <option
                        key={province}
                        value={province}
                      >
                        {province}
                      </option>
                    )
                  )}
                </select>

                {formik.touched.province &&
                  formik.errors.province && (
                    <span className={styles.error}>
                      {formik.errors.province}
                    </span>
                  )}
              </div>
            </div>

            {/* ================= INFO ================= */}

            <div className={styles.infoBox}>
              <div className={styles.infoIcon}>
                <Info size={16} />
              </div>

              <div>
                <strong>Login credentials</strong>

                <p>
                  A temporary password will be generated
                  automatically and emailed to the candidate.
                  They will be required to change it on first
                  login.
                </p>
              </div>
            </div>

            {/* ================= ACTIONS ================= */}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? (
                  <>
                    <span className={styles.spinner} />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus
                      size={16}
                      strokeWidth={2.5}
                    />
                    Add Candidate
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default AddCandidate;