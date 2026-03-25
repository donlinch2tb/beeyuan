import { useI18n } from '../i18n/useI18n';
import { useReveal } from '../hooks/useReveal';

export default function Competitive() {
  const { t } = useI18n();
  const ref = useReveal();
  const columns = t('competitive.columns');

  return (
    <section className="py-20 lg:py-28 bg-surface" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 reveal">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface tracking-tight mb-4">
            {t('competitive.sectionTitle')}
          </h2>
          <div className="h-1 w-24 bg-primary mb-6"></div>
          <p className="text-on-surface-variant max-w-2xl font-body leading-relaxed">
            {t('competitive.sectionSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {columns.map((col, i) => (
            <div
              key={i}
              className={`reveal rounded-2xl p-8 flex flex-col gap-6 transition-all ${
                col.highlight
                  ? 'bg-primary text-on-primary shadow-xl scale-[1.02] ring-4 ring-primary-fixed/30'
                  : 'bg-surface-container-lowest border border-outline-variant/10 shadow-sm'
              }`}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              <div className={`w-14 h-14 flex items-center justify-center rounded-xl ${
                col.highlight
                  ? 'bg-on-primary/10 text-on-primary'
                  : 'bg-surface-container-highest text-on-surface-variant'
              }`}>
                <span className="material-symbols-outlined text-3xl">{col.icon}</span>
              </div>

              <h3 className={`text-xl font-headline font-bold ${
                col.highlight ? 'text-on-primary' : 'text-on-surface'
              }`}>
                {col.name}
              </h3>

              <ul className="space-y-3 flex-1">
                {col.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm font-body">
                    <span className={`material-symbols-outlined text-sm ${
                      col.highlight ? 'text-primary-fixed' : 'text-secondary'
                    }`}>
                      {col.highlight ? 'check_circle' : 'remove'}
                    </span>
                    <span className={col.highlight ? 'font-semibold' : ''}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* USP Banner */}
        <div className="reveal bg-on-surface text-surface rounded-2xl p-6 text-center">
          <p className="font-headline font-bold text-lg">{t('competitive.usp')}</p>
        </div>
      </div>
    </section>
  );
}
