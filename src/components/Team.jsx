import { useI18n } from '../i18n/useI18n';
import { useReveal } from '../hooks/useReveal';

export default function Team() {
  const { t } = useI18n();
  const ref = useReveal();
  const members = t('team.members');
  const advisors = t('team.advisors');
  const founderPhotoUrl =
    'https://pub-104b6174178445459d4ddc456bee78a9.r2.dev/%E5%9C%96%E7%89%87/BeeYuan/%E7%B6%B2%E7%AB%99%E5%9C%96%E7%89%87/cropped-image-1774435395851.webp';

  return (
    <section id="team" className="py-20 lg:py-28 bg-surface" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 reveal">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface tracking-tight mb-4">
            {t('team.sectionTitle')}
          </h2>
          <div className="h-1 w-24 bg-primary mb-6"></div>
          <p className="text-on-surface-variant max-w-2xl font-body leading-relaxed">
            {t('team.sectionSub')}
          </p>
        </div>

        {/* Team Members */}
        <div className="space-y-6 mb-12">
          {members.map((member, i) => (
            <div
              key={member.name}
              className="asymmetric-card bg-surface-container-lowest p-8 shadow-sm border border-outline-variant/10 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-6">
                {i === 0 ? (
                  <div className="w-28 h-28 md:w-32 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-[0_14px_28px_rgba(24,28,27,0.16)] border border-outline-variant/20 bg-white">
                    <img
                      src={founderPhotoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center text-on-primary shadow-lg">
                    <span className="material-symbols-outlined text-3xl">person</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className={`${i === 0 ? 'text-4xl md:text-5xl' : 'text-2xl'} font-headline font-bold text-on-surface`}>
                    {member.name}
                  </h3>
                  <span className="inline-block px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-bold font-label mt-1 mb-3">
                    {member.role}
                  </span>
                  <div className="space-y-1">
                    {member.desc.split('\n').map((line, j) => (
                      <p key={j} className="text-on-surface-variant text-sm font-body flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm text-secondary mt-0.5">check</span>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Advisors */}
        <div className="reveal bg-on-surface text-surface rounded-2xl p-8">
          <h3 className="text-xl font-headline font-bold mb-4">{advisors.title}</h3>
          <div className="space-y-2">
            {advisors.items.map((item, i) => (
              <p key={i} className="text-surface/80 font-body text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed text-sm">school</span>
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
