import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payloadBase64.padEnd(payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    return typeof payload?.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function getUserIdFromHeaders(headers: Headers): string | null {
  const directCandidates = [
    'x-supabase-auth-user',
    'x-supabase-user-id',
    'x-sb-auth-user',
    'x-auth-user',
    'x-user-id',
  ];

  for (const key of directCandidates) {
    const value = headers.get(key);
    if (value && looksLikeUuid(value)) return value;
  }

  for (const [key, value] of headers.entries()) {
    if (!value) continue;
    const lowerKey = key.toLowerCase();
    if ((lowerKey.includes('auth') || lowerKey.includes('user')) && looksLikeUuid(value)) {
      return value;
    }
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ ok: false, message: 'Missing Supabase env in edge function' }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const source = body?.source ?? 'admin-manual';
    const bodyToken = typeof body?.access_token === 'string' ? body.access_token : '';
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization') ?? '';
    const headerToken = authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';

    // Allow direct service_role key calls (from pg_cron / pg_net)
    const isServiceRole = headerToken === serviceRoleKey;

    if (!isServiceRole) {
      const accessToken = bodyToken || headerToken;
      let userId = getUserIdFromHeaders(req.headers) || getUserIdFromToken(accessToken);

      // Fallback: use Supabase auth.getUser() for proper JWT verification
      if (!userId && accessToken) {
        try {
          const authClient = createClient(supabaseUrl, serviceRoleKey);
          const { data: { user: authUser } } = await authClient.auth.getUser(accessToken);
          userId = authUser?.id ?? null;
        } catch {
          // auth.getUser failed, userId stays null
        }
      }

      if (!userId) {
        return json({
          ok: false,
          message: 'Auth user context missing at edge runtime',
          debug: {
            hasAuthHeader: Boolean(authHeader),
            hasBodyToken: Boolean(bodyToken),
            headerTokenLength: headerToken.length,
          },
        }, 401);
      }

      const { data: profile, error: profileError } = await serviceClient
        .from('member_profiles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      if (profileError || profile?.role !== 'admin') {
        return json({ ok: false, message: 'Admin only' }, 403);
      }
    }

    const { data: state, error: stateError } = await serviceClient
      .from('system_heartbeat_state')
      .select('news_ingest_enabled, news_api_provider, news_api_key')
      .eq('id', 1)
      .maybeSingle();

    if (stateError || !state) {
      return json({ ok: false, message: stateError?.message || 'State not found' }, 500);
    }

    if (!state.news_ingest_enabled) {
      return json({ ok: false, message: 'News ingest is paused', inserted_count: 0 }, 200);
    }

    if ((state.news_api_provider || 'serpapi').toLowerCase() !== 'serpapi'
        && (state.news_api_provider || 'serpapi').toLowerCase() !== 'gnews') {
      return json({ ok: false, message: 'Unsupported provider', inserted_count: 0 }, 400);
    }

    const apiKey = String(state.news_api_key || '').trim();
    if (!apiKey) {
      return json({ ok: false, message: 'News API key missing', inserted_count: 0 }, 400);
    }

    // Use SerpApi Google News API
    const query = encodeURIComponent('虎頭蜂 OR hornet OR vespa');
    const url = `https://serpapi.com/search.json?engine=google_news&q=${query}&hl=zh-TW&gl=tw&api_key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      let detail = '';
      try { detail = await response.text(); } catch { /* ignore */ }
      return json(
        { ok: false, message: `News API HTTP status ${response.status}: ${detail}`, inserted_count: 0 },
        502
      );
    }

    const payload = await response.json();
    // SerpApi returns news_results array with { title, link, source: { name }, date, snippet }
    const rawResults = Array.isArray(payload?.news_results) ? payload.news_results : [];

    // Parse SerpApi date format (e.g. "03/26/2026, 07:22 AM, +0000 UTC") to ISO 8601
    function parseSerpDate(dateStr: unknown): string | null {
      if (typeof dateStr !== 'string' || !dateStr.trim()) return null;
      try {
        // Try direct Date parsing first
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d.toISOString();
      } catch { /* ignore */ }
      try {
        // Strip trailing " UTC" and parse  e.g. "03/26/2026, 07:22 AM, +0000"
        const cleaned = dateStr.replace(/,?\s*UTC$/i, '').trim();
        const d = new Date(cleaned);
        if (!isNaN(d.getTime())) return d.toISOString();
      } catch { /* ignore */ }
      return null;
    }

    // Map SerpApi format to the format expected by admin_ingest_news_payload
    const articles = rawResults.map((item: Record<string, unknown>) => ({
      title: item.title || 'Untitled',
      url: item.link || '',
      source: { name: (item.source as Record<string, unknown>)?.name || '' },
      publishedAt: parseSerpDate(item.date),
      description: item.snippet || '',
    }));

    const { data: ingestData, error: ingestError } = await serviceClient.rpc(
      'admin_ingest_news_payload',
      {
        p_source: String(source || 'admin-manual'),
        p_articles: articles,
      }
    );

    if (ingestError) {
      return json({ ok: false, message: ingestError.message, inserted_count: 0 }, 500);
    }

    const first = Array.isArray(ingestData) ? ingestData[0] : ingestData;
    return json(first ?? { ok: true, message: 'Done', inserted_count: 0 }, 200);
  } catch (error) {
    return json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
        inserted_count: 0,
      },
      500
    );
  }
});
