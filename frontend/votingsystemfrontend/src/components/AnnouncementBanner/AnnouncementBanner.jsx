import { useEffect, useState } from 'react';
// import { getAnnouncements } from '../../api/index';
import styles from './AnnouncementBanner.module.css';

const AnnouncementBanner = ({ page }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    getAnnouncements(page).then(r => setAnnouncements(r.data.announcements || [])).catch(() => {});
  }, [page]);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % announcements.length), 4000);
    return () => clearInterval(t);
  }, [announcements]);

  if (!visible || announcements.length === 0) return null;

  return (
    <div className={styles.banner}>
      <span className={styles.tag}>📢 Announcement</span>
      <span className={styles.msg}>{announcements[current]?.message}</span>
      <button className={styles.close} onClick={() => setVisible(false)} aria-label="Dismiss">✕</button>
    </div>
  );
};

export default AnnouncementBanner;