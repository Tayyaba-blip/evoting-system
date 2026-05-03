import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markRead } from '../../features/notifications/notificationSlice';
import styles from './NotificationPanel.module.css';

const NotificationPanel = ({ open, onClose, onMarkRead }) => {
  const panelRef = useRef(null);
  const { items, unreadCount } = useSelector((s) => s.notifications);
  const dispatch = useDispatch();

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  const handleMarkRead = (id) => {
    dispatch(markRead(id));
    onMarkRead?.(id);
  };

  if (!open) return null;

  return (
    <div className={styles.panel} ref={panelRef}>
      <div className={styles.header}>
        <span className={styles.title}>🔔 Notifications</span>
        {unreadCount > 0 && <span className={styles.count}>{unreadCount} new</span>}
      </div>
      <div className={styles.list}>
        {items.length === 0 ? (
          <div className={styles.empty}>
            <span>🎉</span>
            <p>All caught up! No notifications.</p>
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n._id}
              className={`${styles.item} ${!n.read ? styles.unread : ''}`}
              onClick={() => !n.read && handleMarkRead(n._id)}
            >
              <div className={styles.itemDot} />
              <div className={styles.itemContent}>
                <p className={styles.itemMsg}>{n.message}</p>
                <span className={styles.itemTime}>{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
              {!n.read && <span className={styles.readBtn}>Mark read</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;