import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import { fetchParties, addCandidateLocal } from '../../features/admin/adminSlice';
import { PAKISTAN_PROVINCES } from '../../utils/formatters';
import styles from './AddCandidate.module.css';

const AddCandidate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { parties } = useSelector((s) => s.admin);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [symbolPreview, setSymbolPreview] = useState(null);

  useEffect(() => { dispatch(fetchParties()); }, [dispatch]);
  
  const formik = useFormik({
    initialValues: {
      name: '', email: '', constituency: '',
      tehsil: '', city: '', province: '', electionType: 'MNA',
      party: '', photo: null, symbol: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      // cnic: Yup.string().matches(/^\d{5}-\d{7}-\d{1}$/, 'Format: XXXXX-XXXXXXX-X').required('CNIC is required'),
      constituency: Yup.string().required('Constituency is required'),
      tehsil: Yup.string().required('Tehsil is required'),
      city: Yup.string().required('City is required'),
      province: Yup.string().required('Province is required'),
      electionType: Yup.string().oneOf(['MNA', 'MPA']).required(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([k, v]) => {
          if ((k === 'photo' || k === 'symbol') && v) formData.append(k, v);
          else if (k !== 'photo' && k !== 'symbol') formData.append(k, v);
        });

        const { data } = await axiosInstance.post('/admin/candidates', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        dispatch(addCandidateLocal(data.candidate));
        toast.success(`Candidate "${data.candidate.name}" added! Welcome email sent.`);
        navigate('/admin/dashboard/candidates');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add candidate');
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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>Add Candidate</h1>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={formik.handleSubmit} className={styles.form}>
          {/* Photo & Symbol */}
          <div className={styles.uploadRow}>
            <div className={styles.uploadBox} onClick={() => document.getElementById('photoInput').click()}>
              {photoPreview ? <img src={photoPreview} alt="Photo" className={styles.uploadImg} /> : <><span>📷</span><p>Candidate Photo</p></>}
            </div>
            <div className={styles.uploadBox} onClick={() => document.getElementById('symbolInput').click()}>
              {symbolPreview ? <img src={symbolPreview} alt="Symbol" className={styles.uploadImg} /> : <><span>🔰</span><p>Election Symbol</p></>}
            </div>
            <input id="photoInput" type="file" accept="image/*" hidden onChange={(e) => handleFile('photo', e, setPhotoPreview)} />
            <input id="symbolInput" type="file" accept="image/*" hidden onChange={(e) => handleFile('symbol', e, setSymbolPreview)} />
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Full Name *</label>
              <input type="text" {...formik.getFieldProps('name')} placeholder="Full Name" />
              {formik.touched.name && formik.errors.name && <span className={styles.error}>{formik.errors.name}</span>}
            </div>
            <div className={styles.field}>
              <label>Email Address *</label>
              <input type="email" {...formik.getFieldProps('email')} placeholder="candidate@example.com" />
              {formik.touched.email && formik.errors.email && <span className={styles.error}>{formik.errors.email}</span>}
            </div>
          </div>

          <div className={styles.grid2}>
            {/* <div className={styles.field}>
              <label>CNIC *</label>
              <input type="text" {...formik.getFieldProps('cnic')} placeholder="XXXXX-XXXXXXX-X" />
              {formik.touched.cnic && formik.errors.cnic && <span className={styles.error}>{formik.errors.cnic}</span>}
            </div> */}
            <div className={styles.field}>
              <label>Election Type *</label>
              <select {...formik.getFieldProps('electionType')}>
                <option value="MNA">MNA (National Assembly)</option>
                <option value="MPA">MPA (Provincial Assembly)</option>
              </select>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Constituency *</label>
              <input type="text" {...formik.getFieldProps('constituency')} placeholder="e.g. NA-75" />
              {formik.touched.constituency && formik.errors.constituency && <span className={styles.error}>{formik.errors.constituency}</span>}
            </div>
            <div className={styles.field}>
              <label>Tehsil *</label>
              <input type="text" {...formik.getFieldProps('tehsil')} placeholder="Tehsil" />
              {formik.touched.tehsil && formik.errors.tehsil && <span className={styles.error}>{formik.errors.tehsil}</span>}
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>City *</label>
              <input type="text" {...formik.getFieldProps('city')} placeholder="City" />
              {formik.touched.city && formik.errors.city && <span className={styles.error}>{formik.errors.city}</span>}
            </div>
            <div className={styles.field}>
              <label>Province *</label>
              <select {...formik.getFieldProps('province')}>
                <option value="">Select Province</option>
                {PAKISTAN_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {formik.touched.province && formik.errors.province && <span className={styles.error}>{formik.errors.province}</span>}
            </div>
          </div>

          <div className={styles.field}>
  <label>Party</label>
  <select {...formik.getFieldProps('party')}>
    <option value="">Independent (No Party)</option>

    {parties && parties.length > 0 ? (
      parties.map((p) => (
        <option key={p._id} value={p._id}>
          {p.name} {p.abbreviation ? `(${p.abbreviation})` : ''}
        </option>
      ))
    ) : (
      <option disabled>No parties available</option>
    )}
  </select>
</div>

          <div className={styles.infoBox}>
            ℹ️ A temporary password will be auto-generated and emailed to the candidate. They must change it on first login.
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={formik.isSubmitting}>
              {formik.isSubmitting ? '⏳ Adding...' : '✅ Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidate;