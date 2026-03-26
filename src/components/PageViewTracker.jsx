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
  const { user } = useAuth();
  const recentSendsRef = useRef(new Map());

  useEffect(() => {
    if (!supabase) return;
    if (typeof window !== 'undefined' && !hasAnalyticsConsent()) return;

    const path = location.pathname || '/';
    const key = `${path}|${lang}|${user?.id ?? 'anon'}`;
    const now = Date.now();
    const lastSentAt = recentSendsRef.current.get(key) ?? 0;

    // React Strict Mode runs effects twice in dev; ignore very-close duplicates.
    if (now - lastSentAt < 4000) return;
    recentSendsRef.current.set(key, now);

    void supabase.rpc('track_page_view', {
      p_path: path,
      p_lang: lang,
      p_referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    });
  }, [location.pathname, lang, user?.id]);

  return null;
}
