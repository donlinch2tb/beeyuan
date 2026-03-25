import { useI18n } from '../i18n/I18nContext';
import { useReveal } from '../hooks/useReveal';

export default function PainPoints() {
  const { t } = useI18n();
  const ref = useReveal();
  const cards = t('pain.cards');

  const colors = [
    { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed', accent: 'text-tertiary' },
    { bg: 'bg-primary-container', text: 'text-on-primary-container', accent: 'text-primary' },
    { bg: 'bg-secondary-container', text: 'text-on-secondary-container', accent: 'text-secondary' },
  ];

  return (
    <section id="solutions" className="py-20 lg:py-28 bg-surface-container-low" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 reveal">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface tracking-tight mb-4">
            {t('pain.sectionTitle')}
          </h2>
          <div className="h-1 w-24 bg-primary mb-6"></div>
          <p className="text-on-surface-variant max-w-2xl font-body leading-relaxed">
            {t('pain.sectionSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <div
              key={i}
              className="reveal asymmetric-card bg-surface-container-lowest p-8 flex flex-col gap-5 shadow-sm border border-outline-variant/10 hover:shadow-lg transition-shadow duration-300"
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              <div className={`w-14 h-14 ${colors[i].bg} flex items-center justify-center rounded-xl ${colors[i].text}`}>
                <span className="material-symbols-outlined text-3xl">{card.icon}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-headline font-bold text-on-surface uppercase tracking-wide">
                {card.title}
              </h3>
              <p className="text-on-surface-variant leading-relaxed font-body text-sm flex-1">
                {card.desc}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {card.tags.map((tag, j) => (
                  <span
                    key={j}
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${colors[i].bg}/30 ${colors[i].accent}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
