import { useI18n } from '../i18n/useI18n';
import { useReveal } from '../hooks/useReveal';

export default function Solution() {
  const { t } = useI18n();
  const ref = useReveal();
  const features = t('solution.features');
  const steps = t('solution.steps');
  const compare = t('solution.compare');

  return (
    <section id="technology" className="py-20 lg:py-28 bg-surface overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 reveal">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface tracking-tight mb-4">
            {t('solution.sectionTitle')}
          </h2>
          <div className="h-1 w-24 bg-primary mb-6"></div>
          <p className="text-on-surface-variant max-w-2xl font-body leading-relaxed">
            {t('solution.sectionSub')}
          </p>
        </div>

        {/* Product Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Left: Product Illustration */}
          <div className="reveal-left order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-container/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 bg-gradient-to-br from-[#1a3a1a] to-[#2d5a2d] rounded-3xl p-8 md:p-12 shadow-2xl">
                {/* Stylized device illustration */}
                <div className="text-center">
                  <div className="inline-flex flex-col items-center">
                    {/* Funnel top */}
                    <div className="w-32 h-12 bg-gradient-to-b from-primary-fixed/40 to-primary-fixed/20 rounded-t-full border-2 border-primary-fixed/30"></div>
                    {/* Body */}
                    <div className="w-24 h-20 bg-surface-container-highest/10 border-2 border-primary-fixed/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-fixed text-4xl">air</span>
                    </div>
                    {/* Stand */}
                    <div className="w-1 h-8 bg-primary-fixed/30"></div>
                    <div className="w-20 h-1 bg-primary-fixed/30 rounded-full"></div>
                    {/* Tripod legs */}
                    <div className="flex gap-8 -mt-0.5">
                      <div className="w-0.5 h-10 bg-primary-fixed/30 rotate-[20deg] origin-top"></div>
                      <div className="w-0.5 h-10 bg-primary-fixed/30 -rotate-[20deg] origin-top"></div>
                    </div>
                  </div>

                  {/* Feature labels */}
                  <div className="mt-8 grid grid-cols-1 gap-3">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3 text-left">
                        <span className="material-symbols-outlined text-primary-fixed text-lg mt-0.5">check_circle</span>
                        <div>
                          <p className="text-primary-fixed font-bold text-sm font-label">{f.title}</p>
                          <p className="text-white/60 text-xs font-body">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-surface-container-highest p-4 rounded-2xl shadow-lg z-20">
                <p className="text-xs font-bold text-primary mb-1 tracking-widest uppercase font-label">TRL 6</p>
                <p className="text-on-surface font-headline font-bold text-sm">Field Verified</p>
              </div>
            </div>
          </div>

          {/* Right: Steps */}
          <div className="reveal-right order-1 lg:order-2">
            <h3 className="text-3xl md:text-4xl font-headline font-bold text-on-surface mb-4">
              {t('solution.productTitle')}
            </h3>
            <p className="text-on-surface-variant mb-8 font-body">{t('solution.productDesc')}</p>

            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.num} className="flex gap-5 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center rounded-full font-headline font-bold text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="text-lg font-headline font-bold mb-1">{step.title}</h4>
                    <p className="text-on-surface-variant font-body text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="reveal rounded-3xl bg-surface-container-lowest border-2 border-primary/20 shadow-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">leaderboard</span>
            <h3 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">{compare.title}</h3>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
            <table className="w-full bg-surface">
              <thead>
                <tr>
                  {compare.headers.map((h, i) => (
                    <th
                      key={i}
                      className={`py-4 px-6 text-left font-headline font-bold text-sm uppercase tracking-wider border-b border-outline-variant/10 ${
                        i === 3
                          ? 'bg-primary text-on-primary'
                          : i === 0
                          ? 'bg-surface-container-highest text-on-surface'
                          : 'bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compare.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-outline-variant/10 odd:bg-surface even:bg-surface-container-low/40">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`py-4 px-6 text-sm font-body ${
                          ci === 0
                            ? 'font-bold text-on-surface bg-surface-container-low/70'
                            : ci === 3
                            ? 'bg-primary-fixed/20 text-primary font-bold'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
