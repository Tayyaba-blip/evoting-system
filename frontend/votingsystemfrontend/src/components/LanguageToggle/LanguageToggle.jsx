import { useTranslation } from 'react-i18next';
import styles from './LanguageToggle.module.css';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const toggle = () => {
    const lang = isUrdu ? 'en' : 'ur';
    i18n.changeLanguage(lang);
    document.documentElement.setAttribute('lang', lang);
  };

  return (
    <button className={styles.toggle} onClick={toggle} title="Change language">
      <span>{isUrdu ? '🇵🇰 اردو' : '🇬🇧 EN'}</span>
      <span className={styles.arrow}>⇄</span>
      <span>{isUrdu ? 'EN' : 'اردو'}</span>
    </button>
  );
};

export default LanguageToggle;