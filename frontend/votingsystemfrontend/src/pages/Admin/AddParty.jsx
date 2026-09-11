import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import { addPartyLocal } from '../../features/admin/adminSlice';
import styles from './AddParty.module.css';

const AddParty = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [flagPreview, setFlagPreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: '', abbreviation: '', leaderName: '',
      foundedYear: '', history: '', isIndependent: false, flag: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Party name is required'),
      abbreviation: Yup.string().required('Abbreviation is required').max(10, 'Max 10 chars'),
      foundedYear: Yup.number().min(1900).max(new Date().getFullYear()).nullable(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([k, v]) => {
          if (k === 'flag') { if (v) formData.append('flag', v); }
          else formData.append(k, v);
        });

        const { data } = await axiosInstance.post('/parties', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        dispatch(addPartyLocal(data.party));
        toast.success(`Party "${data.party.name}" created successfully!`);
        navigate('/admin/dashboard/parties');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to create party');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFlagChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue('flag', file);
      setFlagPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>Add New Party</h1>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={formik.handleSubmit} className={styles.form}>
          {/* Flag Upload */}
          <div className={styles.flagSection}>
            <div className={styles.flagUpload} onClick={() => document.getElementById('flagInput').click()}>
              {flagPreview ? (
                <img src={flagPreview} alt="Flag Preview" className={styles.flagPreview} />
              ) : (
                <div className={styles.flagPlaceholder}>
                  <span>🏴</span>
                  <p>Upload Party Flag</p>
                  <small>Click to browse</small>
                </div>
              )}
            </div>
            <input id="flagInput" type="file" accept="image/*" hidden onChange={handleFlagChange} />
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Party Name *</label>
              <input type="text" {...formik.getFieldProps('name')} placeholder="e.g. Pakistan Tehreek-e-Insaf" />
              {formik.touched.name && formik.errors.name && <span className={styles.error}>{formik.errors.name}</span>}
            </div>
            <div className={styles.field}>
              <label>Abbreviation *</label>
              <input type="text" {...formik.getFieldProps('abbreviation')} placeholder="e.g. PTI" />
              {formik.touched.abbreviation && formik.errors.abbreviation && <span className={styles.error}>{formik.errors.abbreviation}</span>}
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Party Leader Name</label>
              <input type="text" {...formik.getFieldProps('leaderName')} placeholder="e.g. Imran Khan" />
            </div>
            <div className={styles.field}>
              <label>Founded Year</label>
              <input type="number" {...formik.getFieldProps('foundedYear')} placeholder="e.g. 1996" min="1900" max={new Date().getFullYear()} />
              {formik.touched.foundedYear && formik.errors.foundedYear && <span className={styles.error}>{formik.errors.foundedYear}</span>}
            </div>
          </div>

          <div className={styles.field}>
            <label>Party History / Description</label>
            <textarea {...formik.getFieldProps('history')} placeholder="Brief history of the party..." rows={4} />
          </div>

          <div className={styles.checkField}>
            <input type="checkbox" id="isIndependent" {...formik.getFieldProps('isIndependent')} />
            <label htmlFor="isIndependent">This is an Independent Candidate group (No Party)</label>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={formik.isSubmitting}>
              {formik.isSubmitting ? '⏳ Creating...' : '✅ Add Party'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddParty;