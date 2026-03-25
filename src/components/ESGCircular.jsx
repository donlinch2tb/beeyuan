import { useI18n } from '../i18n/I18nContext';
import { useReveal } from '../hooks/useReveal';

export default function ESGCircular() {
  const { t } = useI18n();
  const ref = useReveal();
  const steps = t('esg.steps');
  const metrics = t('esg.metrics');

  return (
    <section id="esg" className="py-20 lg:py-28 bg-surface-container-low" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 reveal">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface tracking-tight mb-4">
            {t('esg.sectionTitle')}
          </h2>
          <div className="h-1 w-24 bg-primary mb-6"></div>
          <p className="text-on-surface-variant max-w-2xl font-body leading-relaxed">
            {t('esg.sectionSub')}
          </p>
        </div>

        {/* Circular Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Visual Circular Diagram */}
          <div className="reveal-left">
            <div className="relative">
              <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container rounded-3xl p-8 md:p-12 shadow-sm border border-outline-variant/10">
                <div className="grid grid-cols-2 gap-6">
                  {steps.map((step, i) => (
                    <div
                      key={i}
                      className="relative p-5 rounded-2xl bg-surface-container-low border border-outline-variant/10 hover:shadow-md transition-shadow"
                    >
                      <div className="text-3xl font-headline font-bold text-primary/20 mb-2">
                        {step.num}
                      </div>
                      <h4 className="text-sm font-headline font-bold text-on-surface mb-1">
                        {step.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant font-body">
                        {step.desc}
                      </p>
                      {/* Arrow indicator */}
                      {i < 3 && (
                        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 text-primary/30 z-10 hidden lg:block">
                          <span className="material-symbols-outlined text-xl">
                            {i === 1 ? 'south' : 'east'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Center label */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary rounded-full w-20 h-20 flex items-center justify-center shadow-xl z-10 hidden lg:flex">
                  <span className="material-symbols-outlined text-3xl">autorenew</span>
                </div>
              </div>
            </div>
          </div>

          {/* ESG Metrics */}
          <div className="reveal-right space-y-6">
            {metrics.map((metric, i) => (
              <div
                key={i}
                className="flex gap-5 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-primary-container flex items-center justify-center rounded-xl text-on-primary-container">
                  <span className="material-symbols-outlined text-2xl">{metric.icon}</span>
                </div>
                <div>
                  <h4 className="text-lg font-headline font-bold text-on-surface mb-1">{metric.title}</h4>
                  <p className="text-on-surface-variant font-body text-sm">{metric.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
