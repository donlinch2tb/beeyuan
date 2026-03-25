import { useState } from 'react';
import { I18nContext } from './context';
import translations from './translations';

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
