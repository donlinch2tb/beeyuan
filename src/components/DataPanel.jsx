import { useI18n } from '../i18n/I18nContext';
import { useReveal } from '../hooks/useReveal';
import { useEffect, useState } from 'react';

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const numericTarget = parseInt(target.replace(/[^0-9]/g, ''));
    if (isNaN(numericTarget) || numericTarget === 0) return;

    let start = 0;
    const duration = 2000;
    const increment = numericTarget / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [visible, target]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );

    const el = document.getElementById('data-panel');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // For non-numeric display, just show the original
  const isNumeric = /^\d/.test(target);
  const display = isNumeric
    ? count.toLocaleString() + target.replace(/[0-9,]/g, '')
    : target;

  return <span>{display}{suffix}</span>;
}

export default function DataPanel() {
  const { t } = useI18n();
  const ref = useReveal();
  const stats = t('data.stats');

  return (
    <section id="data-panel" className="py-20 lg:py-28 bg-on-background text-surface" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="reveal">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              {t('data.sectionTitle')}
            </h2>
            <div className="h-1 w-24 bg-tertiary mb-6"></div>
            <p className="text-outline-variant/80 max-w-xl font-body">
              {t('data.sectionSub')}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`reveal p-6 rounded-2xl border ${
                i === 0
                  ? 'bg-tertiary-container border-tertiary-container'
                  : 'bg-surface/5 border-surface/10'
              }`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <p className={`text-3xl md:text-4xl font-headline font-bold mb-1 ${
                i === 0 ? 'text-on-tertiary-container' : 'text-surface'
              }`}>
                {stat.value}
                <span className="text-base ml-1 opacity-60">{stat.unit}</span>
              </p>
              <p className={`text-sm font-label ${
                i === 0 ? 'text-on-tertiary-container/80' : 'text-surface/60'
              }`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Decorative Map Area */}
        <div className="reveal aspect-[21/9] bg-surface/5 rounded-[2rem] overflow-hidden relative border border-surface/10">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Animated dots simulating a map */}
            <div className="relative w-full h-full">
              {[
                { top: '30%', left: '25%', delay: '0s' },
                { top: '45%', left: '55%', delay: '0.5s' },
                { top: '60%', left: '35%', delay: '1s' },
                { top: '35%', left: '70%', delay: '1.5s' },
                { top: '55%', left: '80%', delay: '2s' },
              ].map((dot, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{ top: dot.top, left: dot.left }}
                >
                  <div
                    className="w-3 h-3 bg-tertiary rounded-full shadow-[0_0_15px_#8d4b00] animate-pulse"
                    style={{ animationDelay: dot.delay }}
                  ></div>
                  <div
                    className="absolute -top-2 -left-2 w-7 h-7 bg-tertiary/20 rounded-full animate-ping"
                    style={{ animationDelay: dot.delay }}
                  ></div>
                </div>
              ))}
              {/* Grid lines */}
              <svg className="w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
