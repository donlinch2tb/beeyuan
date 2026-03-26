import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthContext } from './context';
import { supabase } from '../lib/supabaseClient';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isSigningOutRef = useRef(false);

  const fetchProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('member_profiles')
      .select('user_id, display_name, phone, company, role, membership_tier, updated_at')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (error) {
      // The table can be missing before SQL setup is executed in Supabase.
      console.warn('fetchProfile failed:', error.message);
      setProfile(null);
      return;
    }

    setProfile(data ?? null);
  }, []);

  const ensureProfile = useCallback(async (currentUser) => {
    if (!currentUser) return;

    const displayName =
      currentUser.user_metadata?.full_name ??
      currentUser.user_metadata?.name ??
      currentUser.email?.split('@')[0] ??
      '';

    const { error } = await supabase.from('member_profiles').upsert(
      {
        user_id: currentUser.id,
        display_name: displayName,
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      console.warn('ensureProfile failed:', error.message);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const currentUser = user;
    const userId = currentUser?.id;

    const syncProfile = async () => {
      if (!userId || !currentUser) {
        setProfile(null);
        return;
      }

      await ensureProfile(currentUser);
      if (!isMounted) return;
      await fetchProfile(currentUser);
    };

    syncProfile();

    return () => {
      isMounted = false;
    };
  }, [user, ensureProfile, fetchProfile]);

  const signIn = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async ({ email, password }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/member`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    if (isSigningOutRef.current) {
      return { error: null };
    }
    isSigningOutRef.current = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      return { error };
    } finally {
      isSigningOutRef.current = false;
    }
  };

  const updateProfile = async (payload) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('member_profiles')
      .update({
        display_name: payload.display_name,
        phone: payload.phone,
        company: payload.company,
      })
      .eq('user_id', user.id);

    if (!error) {
      await fetchProfile(user);
    }

    return { error };
  };

  const redeemActivationCode = async (code) => {
    const clean = String(code ?? '').trim().toUpperCase();
    if (!clean) {
      return { data: null, error: new Error('Activation code is required') };
    }

    const { data, error } = await supabase.rpc('redeem_activation_code', { p_code: clean });
    return { data, error };
  };

  const generateActivationCodes = async ({ count, sku, note, baseUrl }) => {
    const cleanBaseUrl = String(baseUrl ?? '').trim();
    const allowedBaseUrls = new Set([
      'https://www.bee-yuan.com',
      'http://localhost:5173',
      'http://localhost:5174',
    ]);

    if (!allowedBaseUrls.has(cleanBaseUrl)) {
      return {
        data: null,
        error: new Error(
          'Base URL is not allowed. Use https://www.bee-yuan.com (or localhost dev URL).'
        ),
      };
    }

    const { data, error } = await supabase.rpc('admin_generate_activation_codes', {
      p_count: Number(count),
      p_sku: sku || null,
      p_note: note || null,
      p_base_url: cleanBaseUrl,
    });

    return { data, error };
  };

  const linkGithubForAdmin = async () => {
    const redirectTo = `${window.location.origin}/member`;
    if (import.meta.env.DEV) {
      console.info('[auth] linkGithubForAdmin start', {
        origin: window.location.origin,
        redirectTo,
      });
    }

    const {
      data: { session: currentSession },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      if (import.meta.env.DEV) {
        console.warn('[auth] getSession failed before linkIdentity', sessionError);
      }
      return { data: null, error: sessionError };
    }

    if (!currentSession) {
      return {
        data: null,
        error: new Error('Auth session missing. Please sign out and sign in again before GitHub verification.'),
      };
    }

    const { data, error } = await supabase.auth.linkIdentity({
      provider: 'github',
      options: {
        redirectTo,
      },
    });

    if (error) {
      if (import.meta.env.DEV) {
        console.warn('[auth] linkIdentity failed', {
          message: error.message,
          status: error.status,
          name: error.name,
        });
      }
    }

    if (error?.message?.toLowerCase().includes('403')) {
      return {
        data: null,
        error: new Error(
          'GitHub verification blocked (403). Add this URL to Supabase Redirect URLs: ' +
            `${window.location.origin}/member`
        ),
      };
    }

    if (error?.status === 404 || error?.message?.toLowerCase().includes('not found')) {
      return {
        data: null,
        error: new Error(
          'GitHub identity linking API is unavailable. In Supabase -> Authentication -> Sign In / Providers, enable "Allow manual linking", then Save changes.'
        ),
      };
    }

    return { data, error };
  };

  const hasGithubIdentity = Boolean(user?.identities?.some((item) => item.provider === 'github'));
  const isAdmin = profile?.role === 'admin';
  const isProductMember = profile?.membership_tier === 'product_member';
  const adminSecondFactorRequired = Boolean(user && isAdmin && !hasGithubIdentity);

  const value = {
    session,
    user,
    profile,
    loading,
    isAdmin,
    isProductMember,
    hasGithubIdentity,
    adminSecondFactorRequired,
    signIn,
    signUp,
    signOut,
    updateProfile,
    redeemActivationCode,
    generateActivationCodes,
    linkGithubForAdmin,
    refreshProfile: () => fetchProfile(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
