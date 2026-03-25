import Hero from '../components/Hero';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import PainPoints from '../components/PainPoints';

export default function HomePage() {
  const { t } = useI18n();
  const cards = t('homeOverview.cards');

  return (
    <>
      <Hero />
      <PainPoints />
      <section className="py-20 lg:py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface tracking-tight mb-4">
              {t('homeOverview.sectionTitle')}
            </h2>
            <div className="h-1 w-24 bg-primary mb-6"></div>
            <p className="text-on-surface-variant max-w-2xl font-body leading-relaxed">
              {t('homeOverview.sectionSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cards.map((card, i) => (
              <Link
                key={i}
                to={card.to}
                className="group asymmetric-card bg-surface-container-lowest p-8 border border-outline-variant/10 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all block"
              >
                <div className="w-14 h-14 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-on-surface mb-3">
                  {card.title}
                </h3>
                <p className="text-on-surface-variant font-body leading-relaxed">
                  {card.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
