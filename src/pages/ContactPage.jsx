import { useI18n } from '../i18n/useI18n';
import SEO from '../components/SEO';

export default function ContactPage() {
  const { t } = useI18n();

  return (
    <div className="pt-20 min-h-screen bg-surface">
      <SEO
        title="聯絡我們 | 蜂緣 BeeYuan"
        description="聯絡蜂緣 BeeYuan，取得虎頭蜂防治、場域導入與合作提案資訊。"
        keywords="聯絡蜂緣,蜂緣客服,虎頭蜂防治合作,BeeYuan contact"
      />
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-15xl font-headline font-bold text-on-surface tracking-tight mb-4">
            {t('footer.contact')}
          </h1>
          <div className="h-1 w-24 bg-primary mb-6"></div>
          <p className="text-on-surface-variant max-w-2xl font-body leading-relaxed">
            {t('footer.tagline')}
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Email */}
          <a
            href={`mailto:${t('footer.email')}`}
            className="group asymmetric-card bg-surface-container-lowest p-8 border border-outline-variant/10 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all"
          >
            <div className="w-14 h-14 bg-primary-container flex items-center justify-center rounded-xl text-on-primary-container mb-5 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">mail</span>
            </div>
            <h3 className="text-lg font-headline font-bold text-on-surface mb-2">Email</h3>
            <p className="text-primary font-body font-semibold">{t('footer.email')}</p>
          </a>

          {/* Line */}
          <div className="asymmetric-card bg-surface-container-lowest p-8 border border-outline-variant/10 shadow-sm">
            <div className="w-14 h-14 bg-secondary-container flex items-center justify-center rounded-xl text-on-secondary-container mb-5">
              <span className="material-symbols-outlined text-2xl">chat</span>
            </div>
            <h3 className="text-lg font-headline font-bold text-on-surface mb-2">Line@</h3>
            <p className="text-primary font-body font-semibold">{t('footer.line')}</p>
          </div>

          {/* Website */}
          <a
            href={`https://${t('footer.domain')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group asymmetric-card bg-surface-container-lowest p-8 border border-outline-variant/10 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all"
          >
            <div className="w-14 h-14 bg-tertiary-fixed flex items-center justify-center rounded-xl text-on-tertiary-fixed mb-5 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">language</span>
            </div>
            <h3 className="text-lg font-headline font-bold text-on-surface mb-2">Website</h3>
            <p className="text-primary font-body font-semibold">{t('footer.domain')}</p>
          </a>
        </div>

        {/* CTA */}
        <div className="bg-on-surface text-surface rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-headline font-bold mb-4">
            {t('hero.badge')}
          </h2>
          <p className="text-surface/70 font-body mb-8 max-w-lg mx-auto">
            {t('hero.subtitle')}
          </p>
          <a
            href={`mailto:${t('footer.email')}`}
            className="inline-flex items-center gap-2 bg-tertiary text-on-tertiary px-8 py-4 rounded-lg font-label font-bold text-lg hover:opacity-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">send</span>
            {t('footer.contact')}
          </a>
        </div>
      </div>
    </div>
  );
}
