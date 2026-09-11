import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, setTheme } from '../features/theme/themeSlice';

const useTheme = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    const saved = localStorage.getItem('evoting-theme');
    if (saved) dispatch(setTheme(saved));
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('evoting-theme', mode);

    // Update meta theme color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', mode === 'dark' ? '#0a1a0a' : '#ffffff');
    }
  }, [mode]);

  const toggle = () => dispatch(toggleTheme());

  return { mode, toggle, isDark: mode === 'dark' };
};

export default useTheme;