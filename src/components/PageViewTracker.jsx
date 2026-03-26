import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/useAuth';

const CONSENT_KEY = 'beeyuan_cookie_consent_v1';

function hasAnalyticsConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.analytics);
  } catch {
    return false;
  }
}

export default function PageViewTracker() {
  const location = useLocation();
  const { lang } = useI18n();
  const { user, isAdmin } = useAuth();
  const recentSendsRef = useRef(new Map());

  useEffect(() => {
    if (!supabase) return;

    const path = location.pathname || '/';
    const isAdminPath = path.startsWith('/admin');
    const canTrackPublic = typeof window !== 'undefined' ? hasAnalyticsConsent() : false;

    // Public page tracking respects cookie analytics consent.
    // Admin page tracking is treated as security/operations audit signal.
    if (!isAdminPath && !canTrackPublic) return;
    if (isAdminPath && !isAdmin) return;

    const key = `${path}|${lang}|${user?.id ?? 'anon'}`;
    const now = Date.now();
    const lastSentAt = recentSendsRef.current.get(key) ?? 0;

    // React Strict Mode runs effects twice in dev; ignore very-close duplicates.
    if (now - lastSentAt < 4000) return;
    recentSendsRef.current.set(key, now);

    void supabase
      .rpc('track_page_view', {
        p_path: path,
        p_lang: lang,
        p_referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      })
      .then(({ data, error }) => {
        if (error && import.meta.env.DEV) {
          console.warn('[track_page_view] rpc error', error.message);
          return;
        }
        const first = Array.isArray(data) ? data[0] : data;
        if (first?.ok === false && import.meta.env.DEV) {
          console.warn('[track_page_view] not recorded', first?.message || 'unknown');
        }
      });
  }, [location.pathname, lang, user?.id, isAdmin]);

  return null;
}
