import { useI18n } from '../i18n/useI18n';
import { useReveal } from '../hooks/useReveal';

export default function Roadmap() {
  const { t } = useI18n();
  const ref = useReveal();

  return (
    <section className="py-12 lg:py-16 bg-surface-container-low" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-10 reveal">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface tracking-tight mb-4">
            {t('roadmap.sectionTitle')}
          </h2>
          <div className="h-1 w-24 bg-primary mb-6"></div>
          <p className="text-on-surface-variant max-w-2xl font-body leading-relaxed">
            {t('roadmap.sectionSub')}
          </p>
        </div>

        <article className="reveal relative overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-on-surface text-surface shadow-[0_28px_60px_rgba(24,28,27,0.2)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(119,221,106,0.22),transparent_46%),radial-gradient(circle_at_88%_80%,rgba(177,95,0,0.24),transparent_44%)]" />
          <div className="relative grid gap-8 p-7 lg:grid-cols-2 lg:items-center lg:p-10">
            <div>
              <p className="text-xs font-label uppercase tracking-[0.18em] text-primary-fixed">
                {t('roadmap.cardBadge')}
              </p>
              <h3 className="mt-3 text-2xl font-headline font-bold leading-tight lg:text-3xl">
                {t('roadmap.cardTitle')}
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-surface/80 lg:text-base">
                {t('roadmap.cardIntro')}
              </p>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-surface/20 bg-surface/5">
              <img
                src="https://pub-104b6174178445459d4ddc456bee78a9.r2.dev/%E5%9C%96%E7%89%87/BeeYuan/%E7%B6%B2%E7%AB%99%E5%9C%96%E7%89%87/cropped-image-1774430703573.webp"
                alt={t('roadmap.mapAlt')}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="roadmap-map-overlay">
                <svg
                  className="roadmap-path-svg"
                  viewBox="0 0 600 450"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <path id="beeTrackA" d="M92 300 C148 266, 210 224, 264 196 C304 174, 336 170, 352 186 C370 202, 360 238, 338 284 C322 318, 328 338, 352 328 C392 312, 440 248, 482 204 C502 182, 514 186, 520 212 C526 248, 526 286, 524 330" />
                    <path id="beeTrackB" d="M166 214 C208 194, 252 170, 300 166 C328 164, 344 170, 346 184 C350 212, 344 250, 342 286 C340 330, 354 338, 382 306 C422 262, 468 214, 504 170" />
                    <path id="beeTrackC" d="M78 158 C126 132, 170 98, 222 72" />
                    <path id="beeTrackD" d="M264 66 C310 72, 346 64, 352 56 C362 44, 356 114, 344 192 C338 228, 350 252, 362 276 C372 298, 378 312, 386 326" />
                  </defs>

                  <use href="#beeTrackA" className="roadmap-route roadmap-route-amber" />
                  <use href="#beeTrackB" className="roadmap-route roadmap-route-amber-soft" />
                  <use href="#beeTrackC" className="roadmap-route roadmap-route-amber-short" />
                  <use href="#beeTrackD" className="roadmap-route roadmap-route-blue" />

                  <circle className="roadmap-node roadmap-node-a" cx="92" cy="300" r="5" />
                  <circle className="roadmap-node roadmap-node-b" cx="344" cy="192" r="5" />
                  <circle className="roadmap-node roadmap-node-c" cx="524" cy="330" r="5" />

                  <g className="bee-flyer">
                    <circle className="bee-tail" r="7">
                      <animateMotion dur="7.8s" repeatCount="indefinite" rotate="auto">
                        <mpath href="#beeTrackA" />
                      </animateMotion>
                    </circle>
                    <circle className="bee-core" r="3.8">
                      <animateMotion dur="7.8s" repeatCount="indefinite" rotate="auto">
                        <mpath href="#beeTrackA" />
                      </animateMotion>
                    </circle>
                  </g>

                  <g className="bee-flyer">
                    <circle className="bee-tail bee-tail-2" r="6">
                      <animateMotion dur="6.9s" repeatCount="indefinite" rotate="auto" begin="-2s">
                        <mpath href="#beeTrackB" />
                      </animateMotion>
                    </circle>
                    <circle className="bee-core bee-core-2" r="3.6">
                      <animateMotion dur="6.9s" repeatCount="indefinite" rotate="auto" begin="-2s">
                        <mpath href="#beeTrackB" />
                      </animateMotion>
                    </circle>
                  </g>

                  <g className="bee-flyer">
                    <circle className="bee-tail bee-tail-3" r="6.5">
                      <animateMotion dur="8.8s" repeatCount="indefinite" rotate="auto" begin="-4s">
                        <mpath href="#beeTrackD" />
                      </animateMotion>
                    </circle>
                    <circle className="bee-core bee-core-3" r="3.7">
                      <animateMotion dur="8.8s" repeatCount="indefinite" rotate="auto" begin="-4s">
                        <mpath href="#beeTrackD" />
                      </animateMotion>
                    </circle>
                  </g>
                </svg>
              </div>

              <div className="absolute left-6 top-6 rounded-lg bg-on-surface/70 px-3 py-1 text-xs font-label tracking-wide text-primary-fixed">
                {t('roadmap.mapStart')}
              </div>
              <div className="absolute right-6 bottom-6 rounded-lg bg-on-surface/70 px-3 py-1 text-xs font-label tracking-wide text-tertiary-fixed">
                {t('roadmap.mapEnd')}
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
