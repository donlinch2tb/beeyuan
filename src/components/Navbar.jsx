import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';

export default function Navbar() {
  const { t, lang, toggleLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: t('nav.solutions'), href: '#solutions' },
    { label: t('nav.technology'), href: '#technology' },
    { label: t('nav.esg'), href: '#esg' },
    { label: t('nav.about'), href: '#team' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/80 shadow-[0px_20px_40px_rgba(24,28,27,0.06)]'
          : 'bg-transparent'
      } glass-nav`}
    >
      <div className="flex justify-between items-center px-6 lg:px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <a href="#" className="text-2xl font-bold tracking-tighter text-on-surface font-headline">
          {t('nav.brand')}
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-secondary hover:text-primary transition-colors font-label text-sm font-semibold"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-highest/60 hover:bg-surface-container-highest text-on-surface text-xs font-bold font-label transition-all"
          >
            <span className="material-symbols-outlined text-base">translate</span>
            {lang === 'zh' ? 'EN' : '中'}
          </button>

          {/* Contact Button */}
          <a
            href="#contact"
            className="hidden sm:inline-flex bg-primary text-on-primary px-5 py-2 rounded-xl font-label text-sm font-semibold hover:opacity-80 transition-all duration-300 active:scale-95"
          >
            {t('nav.contact')}
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-on-surface"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface/95 glass-nav border-t border-outline-variant/10 px-6 pb-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-secondary hover:text-primary transition-colors font-label text-sm font-semibold border-b border-outline-variant/5"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileOpen(false)}
            className="inline-flex mt-4 bg-primary text-on-primary px-5 py-2 rounded-xl font-label text-sm font-semibold"
          >
            {t('nav.contact')}
          </a>
        </div>
      )}
    </nav>
  );
}
