import { createContext, useContext, useState } from 'react';
import translations from './translations';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('zh');

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[lang];
    for (const key of keys) {
      result = result?.[key];
    }
    return result;
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'zh' ? 'en' : 'zh'));
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
