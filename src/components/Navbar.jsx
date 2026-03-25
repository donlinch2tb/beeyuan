import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';

export default function Navbar() {
  const { t, lang, toggleLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.solutions'), to: '/solutions' },
    { label: t('nav.esg'), to: '/esg' },
    { label: t('nav.about'), to: '/about' },
  ];

  const isHome = location.pathname === '/';

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? 'bg-surface/80 shadow-[0px_20px_40px_rgba(24,28,27,0.06)]'
          : 'bg-transparent'
      } glass-nav`}
    >
      <div className="flex justify-between items-center px-6 lg:px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tighter font-headline">
          <span className={scrolled || !isHome ? 'text-on-surface' : 'text-white'}>
            {t('nav.brand')}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`transition-colors font-label text-sm font-semibold ${
                location.pathname === link.to
                  ? 'text-primary'
                  : scrolled || !isHome
                  ? 'text-secondary hover:text-primary'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-label transition-all ${
              scrolled || !isHome
                ? 'bg-surface-container-highest/60 hover:bg-surface-container-highest text-on-surface'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>

          {/* Contact Button */}
          <Link
            to="/contact"
            className="hidden sm:inline-flex bg-primary text-on-primary px-5 py-2 rounded-xl font-label text-sm font-semibold hover:opacity-80 transition-all duration-300 active:scale-95"
          >
            {t('nav.contact')}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
          >
            <span className={`material-symbols-outlined text-2xl ${
              scrolled || !isHome ? 'text-on-surface' : 'text-white'
            }`}>
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface/95 glass-nav border-t border-outline-variant/10 px-6 pb-6">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block py-3 transition-colors font-label text-sm font-semibold border-b border-outline-variant/5 ${
                location.pathname === link.to ? 'text-primary' : 'text-secondary hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className="inline-flex mt-4 bg-primary text-on-primary px-5 py-2 rounded-xl font-label text-sm font-semibold"
          >
            {t('nav.contact')}
          </Link>
        </div>
      )}
    </nav>
  );
}
