import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchAnnouncements, updateAnnouncementLocal, removeAnnouncementLocal } from '../../features/admin/adminSlice';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { formatDateTime } from '../../utils/formatters';
import styles from './AnnouncementList.module.css';

const AnnouncementList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { announcements, loading } = useSelector((s) => s.admin);

  useEffect(() => { dispatch(fetchAnnouncements()); }, [dispatch]);

  const handleToggle = async (ann) => {
    try {
      const { data } = await axiosInstance.patch(`/announcements/${ann._id}/toggle`);
      dispatch(updateAnnouncementLocal(data.announcement));
      toast.success(`Announcement ${data.announcement.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error('Failed to toggle announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axiosInstance.delete(`/announcements/${id}`);
      dispatch(removeAnnouncementLocal(id));
      toast.success('Announcement deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const displayLabel = (locations) =>
    Array.isArray(locations) ? locations.join(', ') : locations;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>📢 Announcements</h1>
        <Link to="/admin/dashboard/announcements/add" className={styles.addBtn}>+ Add Announcement</Link>
      </div>

      {loading ? <div className={styles.loader}>Loading...</div> :
       announcements.length === 0 ? (
        <div className={styles.empty}><span>📢</span><p>No announcements yet.</p></div>
      ) : (
        <div className={styles.list}>
          {announcements.map((ann) => (
            <div key={ann._id} className={`${styles.card} ${!ann.isActive ? styles.inactive : ''}`}>
              <div className={styles.cardLeft}>
                <h3 className={styles.annTitle}>{ann.title}</h3>
                <p className={styles.annMessage}>{ann.message}</p>
                <div className={styles.meta}>
                  <span className={styles.displayBadge}>📍 {displayLabel(ann.displayOn)}</span>
                  <span className={styles.date}>🕒 {formatDateTime(ann.createdAt)}</span>
                </div>
              </div>
              <div className={styles.actions}>
                <button
                  className={`${styles.toggleBtn} ${ann.isActive ? styles.activeToggle : styles.inactiveToggle}`}
                  onClick={() => handleToggle(ann)}
                >
                  {ann.isActive ? '🟢 Active' : '⚫ Inactive'}
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(ann._id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementList;