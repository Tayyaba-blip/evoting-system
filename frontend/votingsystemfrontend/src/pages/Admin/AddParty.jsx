import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Building2,
  Check,
  ImagePlus,
  Plus,
  Upload,
} from 'lucide-react';

import axiosInstance from '../../api/axiosInstance';
import { addPartyLocal } from '../../features/admin/adminSlice';
import styles from './AddParty.module.css';

const AddParty = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [flagPreview, setFlagPreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      abbreviation: '',
      leaderName: '',
      foundedYear: '',
      history: '',
      isIndependent: false,
      flag: null,
    },

    validationSchema: Yup.object({
      name: Yup.string().required('Party name is required'),

      abbreviation: Yup.string()
        .required('Abbreviation is required')
        .max(10, 'Max 10 chars'),

      foundedYear: Yup.number()
        .min(1900)
        .max(new Date().getFullYear())
        .nullable(),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();

        Object.entries(values).forEach(([key, value]) => {
          if (key === 'flag') {
            if (value) {
              formData.append('flag', value);
            }
          } else {
            formData.append(key, value);
          }
        });

        const { data } = await axiosInstance.post(
          '/parties',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        dispatch(addPartyLocal(data.party));

        toast.success(
          `Party "${data.party.name}" created successfully!`
        );

        navigate('/admin/dashboard/parties');
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            'Failed to create party'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFlagChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    formik.setFieldValue('flag', file);
    setFlagPreview(URL.createObjectURL(file));
  };

  const openFlagPicker = () => {
    document.getElementById('flagInput')?.click();
  };

  return (
    <div className={styles.page}>
      {/* Background decoration */}
      <div className={styles.background} aria-hidden="true">
        <div className={styles.glowOne} />
        <div className={styles.glowTwo} />
      </div>

      <main className={styles.container}>
        {/* Header */}
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
              PARTY MANAGEMENT
            </span>

            <h1 className={styles.title}>
              Add New Party
            </h1>

            <p className={styles.subtitle}>
              Create a new political party record.
            </p>
          </div>
        </header>

        {/* Main glass panel */}
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <Building2 size={20} />
            </div>

            <div>
              <h2>Party information</h2>
              <p>
                Enter the basic details for the new party.
              </p>
            </div>
          </div>

          <form
            onSubmit={formik.handleSubmit}
            className={styles.form}
          >
            {/* Flag */}
            <section className={styles.flagSection}>
              <button
                type="button"
                className={`${styles.flagUpload} ${
                  flagPreview ? styles.hasPreview : ''
                }`}
                onClick={openFlagPicker}
              >
                {flagPreview ? (
                  <>
                    <img
                      src={flagPreview}
                      alt="Party flag preview"
                      className={styles.flagPreview}
                    />

                    <div className={styles.flagOverlay}>
                      <ImagePlus size={18} />
                      <span>Change flag</span>
                    </div>
                  </>
                ) : (
                  <div className={styles.flagPlaceholder}>
                    <div className={styles.uploadIcon}>
                      <Upload size={20} />
                    </div>

                    <div>
                      <strong>Upload party flag</strong>
                      <span>PNG, JPG or WEBP</span>
                    </div>
                  </div>
                )}
              </button>

              <input
                id="flagInput"
                type="file"
                accept="image/*"
                hidden
                onChange={handleFlagChange}
              />
            </section>

            <div className={styles.divider} />

            {/* Basic information */}
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="name">
                  Party Name
                  <span>*</span>
                </label>

                <input
                  id="name"
                  type="text"
                  {...formik.getFieldProps('name')}
                  placeholder="e.g. Pakistan Tehreek-e-Insaf"
                  className={
                    formik.touched.name && formik.errors.name
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
                <label htmlFor="abbreviation">
                  Abbreviation
                  <span>*</span>
                </label>

                <input
                  id="abbreviation"
                  type="text"
                  {...formik.getFieldProps('abbreviation')}
                  placeholder="e.g. PTI"
                  className={
                    formik.touched.abbreviation &&
                    formik.errors.abbreviation
                      ? styles.inputError
                      : ''
                  }
                />

                {formik.touched.abbreviation &&
                  formik.errors.abbreviation && (
                    <span className={styles.error}>
                      {formik.errors.abbreviation}
                    </span>
                  )}
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="leaderName">
                  Party Leader
                </label>

                <input
                  id="leaderName"
                  type="text"
                  {...formik.getFieldProps('leaderName')}
                  placeholder="Enter leader name"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="foundedYear">
                  Founded Year
                </label>

                <input
                  id="foundedYear"
                  type="number"
                  {...formik.getFieldProps('foundedYear')}
                  placeholder="e.g. 1996"
                  min="1900"
                  max={new Date().getFullYear()}
                  className={
                    formik.touched.foundedYear &&
                    formik.errors.foundedYear
                      ? styles.inputError
                      : ''
                  }
                />

                {formik.touched.foundedYear &&
                  formik.errors.foundedYear && (
                    <span className={styles.error}>
                      {formik.errors.foundedYear}
                    </span>
                  )}
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="history">
                  Party History / Description
                </label>

                <span className={styles.optional}>
                  Optional
                </span>
              </div>

              <textarea
                id="history"
                {...formik.getFieldProps('history')}
                placeholder="Write a brief description of the party..."
                rows={4}
              />
            </div>

            {/* Independent */}
            <label
              className={`${styles.checkField} ${
                formik.values.isIndependent
                  ? styles.checkFieldActive
                  : ''
              }`}
              htmlFor="isIndependent"
            >
              <input
                type="checkbox"
                id="isIndependent"
                {...formik.getFieldProps('isIndependent')}
              />

              <span className={styles.customCheck}>
                {formik.values.isIndependent && (
                  <Check size={13} strokeWidth={3} />
                )}
              </span>

              <span className={styles.checkText}>
                <strong>Independent candidate group</strong>

                <small>
                  Select this if this entry does not represent
                  a political party.
                </small>
              </span>
            </label>

            {/* Actions */}
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} strokeWidth={2.5} />
                    Add Party
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddParty;