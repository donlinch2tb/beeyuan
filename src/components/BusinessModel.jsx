import { useI18n } from '../i18n/useI18n';
import { useReveal } from '../hooks/useReveal';

export default function BusinessModel() {
  const { t } = useI18n();
  const ref = useReveal();
  const models = t('business.models');

  const bgColors = [
    'bg-secondary-container',
    'bg-primary-container',
    'bg-tertiary-fixed',
    'bg-surface-container-highest',
  ];

  const textColors = [
    'text-on-secondary-container',
    'text-on-primary-container',
    'text-on-tertiary-fixed',
    'text-on-surface',
  ];

  return (
    <section className="py-12 lg:py-16 bg-surface-container-low" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-10 reveal">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface tracking-tight mb-4">
            {t('business.sectionTitle')}
          </h2>
          <div className="h-1 w-24 bg-primary mb-6"></div>
          <p className="text-on-surface-variant max-w-2xl font-body leading-relaxed">
            {t('business.sectionSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {models.map((model, i) => (
            <div
              key={i}
              className="reveal asymmetric-card bg-surface-container-lowest p-8 flex flex-col gap-4 shadow-sm border border-outline-variant/10 hover:shadow-lg transition-all"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className={`w-14 h-14 ${bgColors[i]} flex items-center justify-center rounded-xl ${textColors[i]}`}>
                <span className="material-symbols-outlined text-2xl">{model.icon}</span>
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface">
                {model.title}
              </h3>
              <p className="text-on-surface-variant font-body text-sm leading-relaxed">
                {model.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
