import { useI18n } from '../i18n/I18nContext';
import { useReveal } from '../hooks/useReveal';

export default function Roadmap() {
  const { t } = useI18n();
  const ref = useReveal();
  const phases = t('roadmap.phases');
  const revenue = t('roadmap.revenue');

  return (
    <section className="py-20 lg:py-28 bg-surface-container-low" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 reveal">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface tracking-tight mb-4">
            {t('roadmap.sectionTitle')}
          </h2>
          <div className="h-1 w-24 bg-primary mb-6"></div>
          <p className="text-on-surface-variant max-w-2xl font-body leading-relaxed">
            {t('roadmap.sectionSub')}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Horizontal line */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-container to-tertiary rounded-full"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {phases.map((phase, i) => (
              <div
                key={i}
                className="reveal relative"
                style={{ transitionDelay: `${i * 0.2}s` }}
              >
                {/* Timeline dot */}
                <div className="hidden md:flex w-8 h-8 bg-primary text-on-primary rounded-full items-center justify-center font-headline font-bold text-xs mx-auto mb-6 shadow-lg relative z-10">
                  {i + 1}
                </div>

                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm hover:shadow-lg transition-all">
                  {/* Phase header with green accent */}
                  <div className="bg-primary text-on-primary rounded-xl px-4 py-2 mb-4 text-center">
                    <p className="font-headline font-bold text-sm">{phase.period}</p>
                    <p className="text-xs opacity-80">{phase.title}</p>
                  </div>

                  <ul className="space-y-3">
                    {phase.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm font-body text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">arrow_right</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="reveal mt-16 bg-on-surface text-surface rounded-2xl p-8">
          <h3 className="text-xl font-headline font-bold mb-6">{revenue.title}</h3>
          <div className="flex flex-col md:flex-row items-end gap-6 justify-center">
            {revenue.years.map((item, i) => {
              const heights = ['h-20', 'h-36', 'h-52'];
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <p className="text-primary-fixed font-headline font-bold text-sm">{item.revenue}</p>
                  <div className={`w-24 ${heights[i]} bg-gradient-to-t from-primary to-primary-container rounded-t-lg`}></div>
                  <p className="text-surface/60 font-label text-xs">{item.year}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
