import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import { addAnnouncementLocal } from '../../features/admin/adminSlice';
import styles from './AddAnnouncement.module.css';

const DISPLAY_OPTIONS = [
  { value: 'landing', label: '🏠 Landing Page' },
  { value: 'register', label: '📋 Register Page' },
  { value: 'both', label: '📍 Both Pages' },
];

const AddAnnouncement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { title: '', message: '', displayOn: [] },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required').max(150),
      message: Yup.string().required('Message is required').max(1000),
      displayOn: Yup.array().min(1, 'Select at least one display location'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { data } = await axiosInstance.post('/announcements', values);
        dispatch(addAnnouncementLocal(data.announcement));
        toast.success('Announcement created and published!');
        navigate('/admin/dashboard/announcements');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to create announcement');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const toggleDisplay = (val) => {
    const current = formik.values.displayOn;
    if (val === 'both') {
      formik.setFieldValue('displayOn', current.includes('both') ? [] : ['both']);
    } else {
      const without = current.filter((v) => v !== 'both');
      formik.setFieldValue('displayOn', current.includes(val) ? without.filter((v) => v !== val) : [...without, val]);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>Add Announcement</h1>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={formik.handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Announcement Title *</label>
            <input type="text" {...formik.getFieldProps('title')} placeholder="e.g. Voting Begins on 20th January" />
            {formik.touched.title && formik.errors.title && <span className={styles.error}>{formik.errors.title}</span>}
          </div>

          <div className={styles.field}>
            <label>Message *</label>
            <textarea {...formik.getFieldProps('message')} placeholder="Full announcement content..." rows={5} />
            {formik.touched.message && formik.errors.message && <span className={styles.error}>{formik.errors.message}</span>}
            <small className={styles.charCount}>{formik.values.message.length}/1000</small>
          </div>

          <div className={styles.field}>
            <label>Display Location *</label>
            <div className={styles.displayOptions}>
              {DISPLAY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.optBtn} ${formik.values.displayOn.includes(opt.value) ? styles.selected : ''}`}
                  onClick={() => toggleDisplay(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {formik.touched.displayOn && formik.errors.displayOn && <span className={styles.error}>{formik.errors.displayOn}</span>}
          </div>

          {formik.values.title && formik.values.message && (
            <div className={styles.preview}>
              <h4>📋 Preview</h4>
              <div className={styles.previewCard}>
                <strong>{formik.values.title}</strong>
                <p>{formik.values.message}</p>
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={formik.isSubmitting}>
              {formik.isSubmitting ? '⏳ Publishing...' : '📢 Publish Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAnnouncement;