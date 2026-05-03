import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../features/theme/themeSlice';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((s) => s.theme);
  return (
    <button className={styles.toggle} onClick={() => dispatch(toggleTheme())} title="Toggle theme" aria-label="Toggle dark/light mode">
      <span className={styles.icon}>{mode === 'dark' ? '☀️' : '🌙'}</span>
      <span className={styles.label}>{mode === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
};

export default ThemeToggle;