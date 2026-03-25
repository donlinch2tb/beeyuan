import { useI18n } from '../i18n/I18nContext';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer id="contact" className="w-full rounded-t-[2rem] mt-20 bg-surface-container-low">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12 px-8 lg:px-12 py-16 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex flex-col gap-6 max-w-xs">
          <div className="text-xl font-bold tracking-tighter text-on-surface font-headline">
            {t('footer.brand')}
          </div>
          <p className="font-body text-sm leading-relaxed text-secondary">
            {t('footer.tagline')}
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-primary">public</span>
            <span className="material-symbols-outlined text-primary">hub</span>
            <span className="material-symbols-outlined text-primary">eco</span>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 w-full md:w-auto">
          {/* Ecosystem */}
          <div className="flex flex-col gap-4">
            <h5 className="font-headline font-bold text-sm tracking-wider uppercase text-on-surface">
              {t('footer.ecosystem')}
            </h5>
            <ul className="flex flex-col gap-2 font-body text-sm">
              {t('footer.ecosystemLinks').map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-secondary hover:text-tertiary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h5 className="font-headline font-bold text-sm tracking-wider uppercase text-on-surface">
              {t('footer.legal')}
            </h5>
            <ul className="flex flex-col gap-2 font-body text-sm">
              {t('footer.legalLinks').map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-secondary hover:text-tertiary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h5 className="font-headline font-bold text-sm tracking-wider uppercase text-on-surface">
              {t('footer.contact')}
            </h5>
            <ul className="flex flex-col gap-3 font-body text-sm">
              <li className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-sm text-primary">mail</span>
                <a href={`mailto:${t('footer.email')}`} className="hover:text-tertiary transition-colors">
                  {t('footer.email')}
                </a>
              </li>
              <li className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-sm text-primary">chat</span>
                <span>Line: {t('footer.line')}</span>
              </li>
              <li className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-sm text-primary">language</span>
                <a href={`https://${t('footer.domain')}`} className="hover:text-tertiary transition-colors">
                  {t('footer.domain')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-12 pb-12 border-t border-outline-variant/10 pt-8">
        <p className="font-body text-sm leading-relaxed text-secondary text-center md:text-left">
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
}
