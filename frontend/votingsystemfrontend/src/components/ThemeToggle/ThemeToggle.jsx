import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../features/theme/themeSlice';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((s) => s.theme);

  const isDark = mode === 'dark';

  return (
    <button
      type="button"
      className={`${styles.toggle} ${isDark ? styles.dark : styles.light}`}
      onClick={() => dispatch(toggleTheme())}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      <span className={styles.knob} />
    </button>
  );
};

export default ThemeToggle;