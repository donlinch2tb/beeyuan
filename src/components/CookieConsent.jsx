import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n/useI18n';

const STORAGE_KEY = 'beeyuan_cookie_consent_v1';
const OPEN_SETTINGS_EVENT = 'beeyuan-open-cookie-settings';

function safeReadConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: parsed.updatedAt || null,
      method: parsed.method || 'saved',
      version: 1,
    };
  } catch {
    return null;
  }
}

function persistConsent(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('beeyuan-cookie-consent-updated', { detail: next }));
}

export default function CookieConsent() {
  const { t } = useI18n();
  const labels = t('cookie');
  const initialConsent = typeof window !== 'undefined' ? safeReadConsent() : null;

  const [consent, setConsent] = useState(initialConsent);
  const [bannerOpen, setBannerOpen] = useState(!initialConsent);
  const [panelOpen, setPanelOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    analytics: Boolean(initialConsent?.analytics),
    marketing: Boolean(initialConsent?.marketing),
  });

  useEffect(() => {
    const handleOpen = () => {
      const latest = safeReadConsent();
      if (latest) {
        setPrefs({ analytics: latest.analytics, marketing: latest.marketing });
      }
      setBannerOpen(false);
      setPanelOpen(true);
    };

    window.addEventListener(OPEN_SETTINGS_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, handleOpen);
  }, []);

  const summaryText = useMemo(() => {
    if (!consent) return labels.status.unset;
    if (consent.analytics && consent.marketing) return labels.status.all;
    if (!consent.analytics && !consent.marketing) return labels.status.necessary;
    return labels.status.custom;
  }, [consent, labels]);

  const save = (nextPrefs, method) => {
    const next = {
      necessary: true,
      analytics: nextPrefs.analytics,
      marketing: nextPrefs.marketing,
      updatedAt: new Date().toISOString(),
      method,
      version: 1,
    };
    persistConsent(next);
    setConsent(next);
    setPrefs({ analytics: next.analytics, marketing: next.marketing });
    setBannerOpen(false);
    setPanelOpen(false);
  };

  return (
    <>
      {bannerOpen && (
        <section className="cookie-banner fixed bottom-4 left-4 right-4 z-[90] lg:left-1/2 lg:right-auto lg:w-[min(900px,calc(100%-2rem))] lg:-translate-x-1/2">
          <div className="relative overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-lowest/95 p-5 shadow-[0_20px_44px_rgba(24,28,27,0.18)] backdrop-blur-xl lg:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(119,221,106,0.18),transparent_50%),radial-gradient(circle_at_88%_78%,rgba(177,95,0,0.14),transparent_45%)]" />
            <div className="relative">
              <p className="text-xs font-label uppercase tracking-[0.18em] text-primary">{labels.badge}</p>
              <h3 className="mt-2 text-lg font-headline font-bold text-on-surface lg:text-xl">{labels.title}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant">{labels.description}</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => save({ analytics: true, marketing: true }, 'accept_all')}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-label font-semibold text-on-primary transition hover:opacity-90"
                >
                  {labels.actions.acceptAll}
                </button>
                <button
                  type="button"
                  onClick={() => save({ analytics: false, marketing: false }, 'reject_all')}
                  className="rounded-xl border border-outline-variant/70 bg-surface px-4 py-2 text-sm font-label font-semibold text-on-surface transition hover:bg-surface-container"
                >
                  {labels.actions.rejectAll}
                </button>
                <button
                  type="button"
                  onClick={() => setPanelOpen(true)}
                  className="rounded-xl border border-primary/35 bg-primary/8 px-4 py-2 text-sm font-label font-semibold text-primary transition hover:bg-primary/12"
                >
                  {labels.actions.customize}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {panelOpen && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-[rgba(24,28,27,0.45)] p-3 backdrop-blur-sm lg:items-center">
          <section
            role="dialog"
            aria-modal="true"
            aria-label={labels.panelTitle}
            className="w-full max-w-2xl rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_24px_60px_rgba(24,28,27,0.24)] lg:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-label uppercase tracking-[0.18em] text-primary">{labels.badge}</p>
                <h4 className="mt-2 text-xl font-headline font-bold text-on-surface">{labels.panelTitle}</h4>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{labels.panelDescription}</p>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container"
                aria-label={labels.actions.close}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-outline-variant/35 bg-surface-container-low p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-label text-sm font-semibold text-on-surface">{labels.categories.necessary.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{labels.categories.necessary.desc}</p>
                  </div>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-label font-bold text-primary">{labels.alwaysOn}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-outline-variant/35 bg-surface-container-low p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-label text-sm font-semibold text-on-surface">{labels.categories.analytics.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{labels.categories.analytics.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrefs((prev) => ({ ...prev, analytics: !prev.analytics }))}
                    className={`cookie-toggle ${prefs.analytics ? 'on' : ''}`}
                    aria-label={labels.categories.analytics.title}
                    aria-pressed={prefs.analytics}
                  >
                    <span className="knob" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-outline-variant/35 bg-surface-container-low p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-label text-sm font-semibold text-on-surface">{labels.categories.marketing.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{labels.categories.marketing.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrefs((prev) => ({ ...prev, marketing: !prev.marketing }))}
                    className={`cookie-toggle ${prefs.marketing ? 'on' : ''}`}
                    aria-label={labels.categories.marketing.title}
                    aria-pressed={prefs.marketing}
                  >
                    <span className="knob" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 pt-4">
              <p className="text-xs font-label text-on-surface-variant">{labels.currentChoice}: {summaryText}</p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => save({ analytics: false, marketing: false }, 'reject_all')}
                  className="rounded-xl border border-outline-variant/70 bg-surface px-4 py-2 text-sm font-label font-semibold text-on-surface transition hover:bg-surface-container"
                >
                  {labels.actions.rejectAll}
                </button>
                <button
                  type="button"
                  onClick={() => save(prefs, 'custom_save')}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-label font-semibold text-on-primary transition hover:opacity-90"
                >
                  {labels.actions.save}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export { OPEN_SETTINGS_EVENT };
