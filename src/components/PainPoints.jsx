import { useI18n } from '../i18n/I18nContext';
import { useReveal } from '../hooks/useReveal';

export default function PainPoints() {
  const { t } = useI18n();
  const ref = useReveal();
  const cards = t('pain.cards');
  const cardBackgrounds = [
    'https://pub-104b6174178445459d4ddc456bee78a9.r2.dev/%E5%9C%96%E7%89%87/BeeYuan/%E7%B6%B2%E7%AB%99%E5%9C%96%E7%89%87/unnamed%20(6)_no_watermark.webp',
    'https://pub-104b6174178445459d4ddc456bee78a9.r2.dev/%E5%9C%96%E7%89%87/BeeYuan/%E7%B6%B2%E7%AB%99%E5%9C%96%E7%89%87/cropped-image-1774427990336.webp',
    'https://pub-104b6174178445459d4ddc456bee78a9.r2.dev/%E5%9C%96%E7%89%87/BeeYuan/%E7%B6%B2%E7%AB%99%E5%9C%96%E7%89%87/cropped-image-1774428307767.webp',
  ];

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
              style={{
                transitionDelay: `${i * 0.15}s`,
                ...(cardBackgrounds[i]
                  ? {
                      backgroundImage: `linear-gradient(rgba(10,35,10,0.35), rgba(10,35,10,0.65)), url("${cardBackgrounds[i]}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : {}),
              }}
            >
              <h3 className={`text-xl md:text-2xl font-headline font-bold uppercase tracking-wide ${cardBackgrounds[i] ? 'text-white' : 'text-on-surface'}`}>
                {card.title}
              </h3>
              <p className={`leading-relaxed font-body text-sm flex-1 ${cardBackgrounds[i] ? 'text-white/90' : 'text-on-surface-variant'}`}>
                {card.desc}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {card.tags.map((tag, j) => (
                  <span
                    key={j}
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      cardBackgrounds[i]
                        ? 'bg-white/20 text-white border border-white/25'
                        : `${colors[i].bg}/30 ${colors[i].accent}`
                    }`}
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
