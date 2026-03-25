import { useI18n } from '../i18n/I18nContext';

export default function Hero() {
  const { t } = useI18n();
  const stats = t('hero.stats');

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-[#0a3d0a] via-[#1a5c1a] to-[#2d7a2d]"></div>
        {/* Decorative overlay pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(146,250,131,0.1) 0%, transparent 50%)`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a3d0a]/90 via-[#0a3d0a]/60 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <span className="inline-block px-4 py-1.5 bg-primary-container text-on-primary-container rounded-full text-xs font-bold tracking-widest mb-6 font-label animate-fade-in">
            {t('hero.badge')}
          </span>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-headline font-bold text-white leading-[0.9] tracking-tight mb-6 animate-fade-in-up">
            {t('hero.title')}
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-10 font-body leading-relaxed animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            {t('hero.subtitle')}
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-6 mb-10" style={{ animationDelay: '0.3s' }}>
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-2xl md:text-3xl font-headline font-bold text-primary-fixed">{stat.value}</p>
                <p className="text-xs text-white/60 font-label uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#solutions"
              className="bg-tertiary text-on-tertiary px-8 py-4 rounded-lg font-label font-bold text-lg shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center gap-3 justify-center"
            >
              {t('hero.cta1')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
            <a
              href="#technology"
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-label font-bold text-lg hover:bg-white/20 transition-all border border-white/10 text-center"
            >
              {t('hero.cta2')}
            </a>
          </div>
        </div>
      </div>

      {/* Decorative circle */}
      <div className="absolute right-0 bottom-20 hidden lg:block w-1/3 aspect-square opacity-10 pointer-events-none">
        <div className="w-full h-full border-[40px] border-primary-fixed rounded-full animate-pulse"></div>
      </div>

      {/* Hexagon pattern decorative */}
      <div className="absolute top-20 right-10 lg:right-20 hidden md:block opacity-20 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <polygon points="100,10 170,50 170,130 100,170 30,130 30,50" stroke="#92fa83" strokeWidth="2" fill="none" />
          <polygon points="100,30 150,60 150,120 100,150 50,120 50,60" stroke="#92fa83" strokeWidth="1" fill="none" opacity="0.5" />
        </svg>
      </div>
    </section>
  );
}
