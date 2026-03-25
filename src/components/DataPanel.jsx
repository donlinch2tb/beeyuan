import { useReveal } from '../hooks/useReveal';

export default function DataPanel() {
  const ref = useReveal();

  return (
    <section id="data-panel" className="py-12 lg:py-16 bg-surface-container-low text-on-surface" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Decorative Map Area */}
        <div className="reveal aspect-[21/9] bg-surface/5 rounded-[2rem] overflow-hidden relative border border-surface/10">
          <img
            src="https://pub-104b6174178445459d4ddc456bee78a9.r2.dev/%E5%9C%96%E7%89%87/BeeYuan/%E7%B6%B2%E7%AB%99%E5%9C%96%E7%89%87/cropped-image-1774433103444.webp"
            alt="BeeYuan map"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 flex items-center justify-center">
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
                    className="w-3 h-3 bg-primary-fixed rounded-full shadow-[0_0_16px_#77dd6a] animate-pulse"
                    style={{ animationDelay: dot.delay }}
                  ></div>
                  <div
                    className="absolute -top-2 -left-2 w-7 h-7 bg-primary-fixed/25 rounded-full animate-ping"
                    style={{ animationDelay: dot.delay }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
