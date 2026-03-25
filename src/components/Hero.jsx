import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';

export default function Hero() {
  const { t, lang } = useI18n();
  const stats = t('hero.stats');
  const title = t('hero.title');
  const heroImage = 'https://pub-104b6174178445459d4ddc456bee78a9.r2.dev/%E5%9C%96%E7%89%87/BeeYuan/%E7%B6%B2%E7%AB%99%E5%9C%96%E7%89%87/Gemini_Generated_Image_xf6s6pxf6s6pxf6s_no_watermark.webp';

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-right bg-cover"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(10,61,10,0.96) 0%, rgba(10,61,10,0.9) 30%, rgba(10,61,10,0.62) 46%, rgba(10,61,10,0.28) 56%, rgba(10,61,10,0.08) 62%, rgba(10,61,10,0) 68%)',
          }}
        ></div>
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(10,61,10,0.35) 0%, rgba(10,61,10,0.18) 38%, rgba(10,61,10,0) 62%),
                              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <span className="inline-block px-4 py-1.5 bg-primary-container text-on-primary-container rounded-full text-xs font-bold tracking-widest mb-6 font-label animate-fade-in">
            {t('hero.badge')}
          </span>

          <h1
            className="text-5xl sm:text-6xl md:text-8xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e7ffe2] to-primary-fixed leading-[1.08] md:leading-[1.04] tracking-tight mb-4 animate-fade-in-up"
            style={{ filter: 'drop-shadow(0 6px 20px rgba(0, 20, 0, 0.35))' }}
          >
            {lang === 'zh' ? (
              <>
                <span className="block">從致命危機</span>
                <span className="block">到永續資源</span>
              </>
            ) : (
              title
            )}
          </h1>
          <div className="h-1.5 w-44 max-w-[55vw] rounded-full bg-gradient-to-r from-primary-fixed via-white/80 to-transparent shadow-[0_0_24px_rgba(146,250,131,0.45)] mb-8 animate-pulse"></div>

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
            <Link
              to="/solutions"
              className="bg-tertiary text-on-tertiary px-8 py-4 rounded-lg font-label font-bold text-lg shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center gap-3 justify-center"
            >
              {t('hero.cta1')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link
              to="/esg"
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-label font-bold text-lg hover:bg-white/20 transition-all border border-white/10 text-center"
            >
              {t('hero.cta2')}
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative circle */}
      <div className="absolute right-0 bottom-20 hidden lg:block w-1/3 aspect-square opacity-10 pointer-events-none">
        <div className="w-full h-full border-[40px] border-primary-fixed rounded-full animate-pulse"></div>
      </div>

      {/* Hexagon pattern */}
      <div className="absolute top-20 right-10 lg:right-20 hidden md:block opacity-20 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <polygon points="100,10 170,50 170,130 100,170 30,130 30,50" stroke="#92fa83" strokeWidth="2" fill="none" />
          <polygon points="100,30 150,60 150,120 100,150 50,120 50,60" stroke="#92fa83" strokeWidth="1" fill="none" opacity="0.5" />
        </svg>
      </div>
    </section>
  );
}
