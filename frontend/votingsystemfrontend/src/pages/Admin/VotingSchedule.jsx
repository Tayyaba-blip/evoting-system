import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import { fetchSchedules, addScheduleLocal, updateScheduleLocal, removeScheduleLocal } from '../../features/admin/adminSlice';
import { formatDateTime } from '../../utils/formatters';
import styles from './VotingSchedule.module.css';

const VotingSchedule = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { schedules, loading } = useSelector((s) => s.admin);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { dispatch(fetchSchedules()); }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      title: '', startTime: '', endTime: '', description: '', electionType: 'Both',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title required'),
      startTime: Yup.string().required('Start time required'),
      endTime: Yup.string().required('End time required'),
      electionType: Yup.string().oneOf(['MNA', 'MPA', 'Both']),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const { data } = await axiosInstance.post('/schedule', values);
        dispatch(addScheduleLocal(data.schedule));
        toast.success('Voting schedule created! All voters and candidates notified.');
        resetForm();
        setShowForm(false);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to create schedule');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleEnd = async (id, title) => {
    if (!window.confirm(`End voting for "${title}"? This will finalize results.`)) return;
    try {
      const { data } = await axiosInstance.patch(`/schedule/${id}/end`);
      dispatch(updateScheduleLocal(data.schedule));
      toast.success('Voting ended. Results finalized.');
    } catch (err) {
      toast.error('Failed to end schedule');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await axiosInstance.delete(`/schedule/${id}`);
      dispatch(removeScheduleLocal(id));
      toast.success('Schedule deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const getStatus = (s) => {
    if (s.isEnded) return { label: 'Ended', cls: styles.ended };
    const now = new Date();
    if (new Date(s.startTime) <= now && new Date(s.endTime) >= now) return { label: '🔴 Live', cls: styles.live };
    if (new Date(s.startTime) > now) return { label: '⏳ Upcoming', cls: styles.upcoming };
    return { label: 'Closed', cls: styles.closed };
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>📅 Voting Schedule</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Schedule'}
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3>Create Voting Schedule</h3>
          <form onSubmit={formik.handleSubmit} className={styles.form}>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>Schedule Title *</label>
                <input type="text" {...formik.getFieldProps('title')} placeholder="e.g. General Elections 2024" />
                {formik.touched.title && formik.errors.title && <span className={styles.error}>{formik.errors.title}</span>}
              </div>
              <div className={styles.field}>
                <label>Election Type</label>
                <select {...formik.getFieldProps('electionType')}>
                  <option value="Both">Both (MNA + MPA)</option>
                  <option value="MNA">MNA Only</option>
                  <option value="MPA">MPA Only</option>
                </select>
              </div>
            </div>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>Start Time *</label>
                <input type="datetime-local" {...formik.getFieldProps('startTime')} />
                {formik.touched.startTime && formik.errors.startTime && <span className={styles.error}>{formik.errors.startTime}</span>}
              </div>
              <div className={styles.field}>
                <label>End Time *</label>
                <input type="datetime-local" {...formik.getFieldProps('endTime')} />
                {formik.touched.endTime && formik.errors.endTime && <span className={styles.error}>{formik.errors.endTime}</span>}
              </div>
            </div>
            <div className={styles.field}>
              <label>Description</label>
              <textarea {...formik.getFieldProps('description')} rows={3} placeholder="Optional schedule details..." />
            </div>
            <div className={styles.infoBox}>⚡ Creating a schedule will push a notification to all voter and candidate dashboards immediately.</div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn} disabled={formik.isSubmitting}>
                {formik.isSubmitting ? '⏳ Creating...' : '📅 Create Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className={styles.loader}>Loading...</div> :
       schedules.length === 0 ? <div className={styles.empty}><span>📅</span><p>No schedules created yet.</p></div> : (
        <div className={styles.list}>
          {schedules.map((s) => {
            const status = getStatus(s);
            return (
              <div key={s._id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <h3>{s.title}</h3>
                    <span className={styles.electionType}>{s.electionType}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${status.cls}`}>{status.label}</span>
                </div>
                <div className={styles.times}>
                  <div><span>🟢 Start</span><strong>{formatDateTime(s.startTime)}</strong></div>
                  <div><span>🔴 End</span><strong>{formatDateTime(s.endTime)}</strong></div>
                </div>
                {s.description && <p className={styles.desc}>{s.description}</p>}
                <div className={styles.cardActions}>
                  {!s.isEnded && status.label.includes('Live') && (
                    <button className={styles.endBtn} onClick={() => handleEnd(s._id, s.title)}>🔒 End Voting</button>
                  )}
                  <button className={styles.deleteBtn} onClick={() => handleDelete(s._id)}>🗑️ Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VotingSchedule;