import Hero from '../components/Hero';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';
import PainPoints from '../components/PainPoints';

function SolutionFlowBg() {
  return (
    <svg
      className="overview-bg-svg"
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path className="flow-line flow-line-1" d="M20 300 C 120 220, 200 250, 300 180 C 380 125, 470 140, 580 90" />
      <path className="flow-line flow-line-2" d="M30 350 C 140 290, 220 300, 320 240 C 420 180, 500 210, 590 160" />
      <circle className="flow-node flow-node-1" cx="200" cy="250" r="6" />
      <circle className="flow-node flow-node-2" cx="320" cy="190" r="7" />
      <circle className="flow-node flow-node-3" cx="470" cy="140" r="6" />
    </svg>
  );
}

function EsgLoopBg() {
  return (
    <svg
      className="overview-bg-svg"
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g className="loop-rotator">
        <circle className="loop-ring" cx="440" cy="210" r="120" />
        <circle className="loop-ring loop-ring-inner" cx="440" cy="210" r="86" />
      </g>
      <path className="leaf-float leaf-float-1" d="M350 100 C370 84, 398 87, 410 110 C392 114, 366 117, 350 100 Z" />
      <path className="leaf-float leaf-float-2" d="M500 290 C520 270, 548 274, 560 296 C540 300, 515 304, 500 290 Z" />
    </svg>
  );
}

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
                className="group relative overflow-hidden asymmetric-card bg-surface-container-lowest p-8 border border-outline-variant/10 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all block"
              >
                {i === 0 ? <SolutionFlowBg /> : i === 1 ? <EsgLoopBg /> : null}

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-on-surface mb-3">
                    {card.title}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed">
                    {card.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
