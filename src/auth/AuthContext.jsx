import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthContext } from './context';
import { supabase } from '../lib/supabaseClient';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ownedProducts, setOwnedProducts] = useState([]);
  const [ownedProductsState, setOwnedProductsState] = useState('idle');
  const [loading, setLoading] = useState(true);
  const isSigningOutRef = useRef(false);
  const authEnabled = Boolean(supabase);

  const fetchProfile = useCallback(async (currentUser) => {
    if (!supabase) {
      setProfile(null);
      return;
    }

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

  const fetchOwnedProducts = useCallback(async (currentUser) => {
    if (!supabase || !currentUser) {
      setOwnedProducts([]);
      setOwnedProductsState('idle');
      return;
    }

    const { data, error } = await supabase.rpc('my_owned_products');
    if (error) {
      const message = String(error.message ?? '');
      if (message.toLowerCase().includes('no bound product found')) {
        setOwnedProducts([]);
        setOwnedProductsState('unbound');
        return;
      }
      console.warn('fetchOwnedProducts failed:', error.message);
      setOwnedProducts([]);
      setOwnedProductsState('error');
      return;
    }

    setOwnedProducts(Array.isArray(data) ? data : []);
    setOwnedProductsState('ready');
  }, []);

  const ensureProfile = useCallback(async (currentUser) => {
    if (!supabase) return;
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
    if (!supabase) {
      setLoading(false);
      return;
    }

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
  }, [authEnabled]);

  useEffect(() => {
    let isMounted = true;
    const currentUser = user;
    const userId = currentUser?.id;

    const syncProfile = async () => {
      if (!userId || !currentUser) {
        setProfile(null);
        setOwnedProducts([]);
        setOwnedProductsState('idle');
        return;
      }

      await ensureProfile(currentUser);
      if (!isMounted) return;
      await fetchProfile(currentUser);
      if (!isMounted) return;
      await fetchOwnedProducts(currentUser);
    };

    syncProfile();

    return () => {
      isMounted = false;
    };
  }, [user, ensureProfile, fetchProfile, fetchOwnedProducts]);

  const signIn = async ({ email, password }) => {
    if (!supabase) {
      return { error: new Error('Authentication is disabled (Supabase env missing).') };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async ({ email, password }) => {
    if (!supabase) {
      return { error: new Error('Authentication is disabled (Supabase env missing).') };
    }
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
    if (!supabase) {
      setSession(null);
      setUser(null);
      setProfile(null);
      return { error: null };
    }
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
        setOwnedProducts([]);
      }
      return { error };
    } finally {
      isSigningOutRef.current = false;
    }
  };

  const updateProfile = async (payload) => {
    if (!supabase) return { error: new Error('Supabase is not configured') };
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
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
    const clean = String(code ?? '').trim().toUpperCase();
    if (!clean) {
      return { data: null, error: new Error('Activation code is required') };
    }

    const { data, error } = await supabase.rpc('redeem_activation_code', { p_code: clean });
    if (!error) {
      await fetchProfile(user);
      await fetchOwnedProducts(user);
    }
    return { data, error };
  };

  const generateActivationCodes = async ({ count, sku, note, baseUrl }) => {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
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

  const adminLookupActivation = async (query) => {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
    const { data, error } = await supabase.rpc('admin_lookup_activation', { p_query: query });
    return { data, error };
  };

  const adminTransferActivation = async ({ publicSerial, toEmail, reason }) => {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
    const { data, error } = await supabase.rpc('admin_transfer_activation', {
      p_public_serial: publicSerial,
      p_to_email: toEmail,
      p_reason: reason || null,
    });
    return { data, error };
  };

  const adminRevokeActivation = async ({ publicSerial, reason }) => {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
    const { data, error } = await supabase.rpc('admin_revoke_activation', {
      p_public_serial: publicSerial,
      p_reason: reason || null,
    });
    return { data, error };
  };

  const adminReissueActivation = async ({ publicSerial, reason, baseUrl }) => {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
    const { data, error } = await supabase.rpc('admin_reissue_activation', {
      p_public_serial: publicSerial,
      p_reason: reason || null,
      p_base_url: baseUrl || 'https://www.bee-yuan.com',
    });
    return { data, error };
  };

  const adminSupportRecentActions = async (limit = 50) => {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
    const { data, error } = await supabase.rpc('admin_support_recent_actions', { p_limit: limit });
    return { data, error };
  };

  const linkGithubForAdmin = async () => {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
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
  const isVerifiedProductMember = ownedProducts.some((item) => item.status === 'redeemed');
  const adminSecondFactorRequired = Boolean(user && isAdmin && !hasGithubIdentity);

  const value = {
    session,
    user,
    profile,
    ownedProducts,
    ownedProductsState,
    loading,
    authEnabled,
    isAdmin,
    isProductMember,
    isVerifiedProductMember,
    hasGithubIdentity,
    adminSecondFactorRequired,
    signIn,
    signUp,
    signOut,
    updateProfile,
    redeemActivationCode,
    generateActivationCodes,
    adminLookupActivation,
    adminTransferActivation,
    adminRevokeActivation,
    adminReissueActivation,
    adminSupportRecentActions,
    linkGithubForAdmin,
    refreshProfile: () => fetchProfile(user),
    refreshOwnedProducts: () => fetchOwnedProducts(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
