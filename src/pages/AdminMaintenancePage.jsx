import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useI18n } from '../i18n/useI18n';
import AdminNav from '../components/AdminNav';

function toLocaleTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

const NEWS_API_KEY_LOCAL_STORAGE_KEY = 'beeyuan_news_api_key_input_v1';

function readNewsApiKeyInput() {
  try {
    return localStorage.getItem(NEWS_API_KEY_LOCAL_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export default function AdminMaintenancePage() {
  const { lang } = useI18n();
  const {
    user,
    loading,
    isAdmin,
    adminSecondFactorRequired,
    adminGetHeartbeatStatus,
    adminSetMaintenanceBundleEnabled,
    adminGetMaintenanceMetrics,
    adminTopPageViews,
    adminRecentMaintenanceActions,
    adminRecentCodeActions,
    adminDailyActivity,
    runNewsIngest,
    adminSetNewsApiKey,
    adminRecentNewsRuns,
    runSystemHeartbeat,
  } = useAuth();
  const [busy, setBusy] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [topPages, setTopPages] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const [recentCodeActions, setRecentCodeActions] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [recentNewsRuns, setRecentNewsRuns] = useState([]);
  const [newsApiKeyInput, setNewsApiKeyInput] = useState(() => readNewsApiKeyInput());
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const text =
    lang === 'en'
      ? {
          title: 'Admin Maintenance',
          subtitle: 'Manage low-cost heartbeat automation for baseline activity and observability.',
          state: 'Automation status',
          tracking: 'Tracking switch',
          pageTracking: 'Public page tracking',
          adminTracking: 'Admin page/action tracking',
          newsIngest: 'News ingest automation',
          enabled: 'Enabled',
          paused: 'Paused',
          schedule: 'Schedule',
          lastRun: 'Last run',
          lastSource: 'Last source',
          totalRuns: 'Total runs',
          lastLogAt: 'Last log',
          refresh: 'Refresh status',
          enable: 'Enable bundle',
          pause: 'Pause bundle',
          manualRun: 'Run once now',
          metricsTitle: 'Activity in last 24h',
          metricPageViews: 'Page views',
          metricUniquePages: 'Unique pages',
          metricAdminPageViews: 'Admin page views',
          metricAdminUsers: 'Admin users',
          metricAdminActions: 'Admin actions',
          metricNewsArticles: 'News articles',
          metricNewsRuns: 'News ingest runs',
          topPagesTitle: 'Top pages (24h)',
          recentActionsTitle: 'Recent maintenance actions',
          recentCodeActionsTitle: 'Recent code generation actions',
          trendTitle: '7-day activity trend',
          trendTotal: 'Total',
          saveNewsKey: 'Save News API key',
          newsKeyLabel: 'SerpApi Key',
          newsKeyHint: 'This field is cached in your current browser.',
          runNewsNow: 'Run news ingest now',
          recentNewsRunsTitle: 'Recent news ingest runs',
          noData: 'No data yet',
          backMember: 'Back to member',
          unknown: 'Unknown',
        }
      : {
          title: '維運管理',
          subtitle: '管理低成本 heartbeat 自動任務，維持基本活躍並保留可觀測紀錄。',
          state: '自動任務狀態',
          tracking: '追蹤開關',
          pageTracking: '前台頁面追蹤',
          adminTracking: 'Admin 頁面/操作追蹤',
          newsIngest: '新聞擷取自動化',
          enabled: '已啟用',
          paused: '已暫停',
          schedule: '排程',
          lastRun: '最後執行',
          lastSource: '來源',
          totalRuns: '累積執行次數',
          lastLogAt: '最後紀錄時間',
          refresh: '重新整理狀態',
          enable: '啟用整套追蹤',
          pause: '暫停整套追蹤',
          manualRun: '立即執行一次',
          metricsTitle: '最近 24 小時活躍',
          metricPageViews: '頁面瀏覽量',
          metricUniquePages: '有瀏覽的頁面數',
          metricAdminPageViews: 'Admin 頁面瀏覽量',
          metricAdminUsers: 'Admin 使用者數',
          metricAdminActions: 'Admin 維運操作數',
          metricNewsArticles: '新聞寫入數',
          metricNewsRuns: '新聞擷取執行數',
          topPagesTitle: '熱門頁面（24h）',
          recentActionsTitle: '最近維運操作',
          recentCodeActionsTitle: '最近產碼操作',
          trendTitle: '最近 7 天活躍趨勢',
          trendTotal: '總量',
          saveNewsKey: '儲存新聞 API Key',
          newsKeyLabel: 'SerpApi Key',
          newsKeyHint: '此欄位會暫存在你目前瀏覽器。',
          runNewsNow: '立即抓取新聞',
          recentNewsRunsTitle: '最近新聞擷取執行紀錄',
          noData: '目前無資料',
          backMember: '回會員頁',
          unknown: '未知',
        };

  const loadStatus = async () => {
    setStatusLoading(true);
    const [statusResp, metricsResp, topResp, actionResp, codeActionResp, dailyResp, newsRunsResp] = await Promise.all([
      adminGetHeartbeatStatus(),
      adminGetMaintenanceMetrics(24),
      adminTopPageViews({ hours: 24, limit: 8 }),
      adminRecentMaintenanceActions(10),
      adminRecentCodeActions(10),
      adminDailyActivity(7),
      adminRecentNewsRuns(10),
    ]);

    const { data, error } = statusResp;
    if (error) {
      setErrorMessage(error.message);
      setStatusLoading(false);
      return;
    }
    const first = Array.isArray(data) ? data[0] : data;
    setStatus(first ?? null);

    if (!metricsResp.error) {
      const row = Array.isArray(metricsResp.data) ? metricsResp.data[0] : metricsResp.data;
      setMetrics(row ?? null);
    }

    if (!topResp.error) {
      setTopPages(Array.isArray(topResp.data) ? topResp.data : []);
    }

    if (!actionResp.error) {
      setRecentActions(Array.isArray(actionResp.data) ? actionResp.data : []);
    }

    if (!codeActionResp.error) {
      setRecentCodeActions(Array.isArray(codeActionResp.data) ? codeActionResp.data : []);
    }

    if (!dailyResp.error) {
      setDailyActivity(Array.isArray(dailyResp.data) ? dailyResp.data : []);
    }

    if (!newsRunsResp.error) {
      setRecentNewsRuns(Array.isArray(newsRunsResp.data) ? newsRunsResp.data : []);
    }

    setStatusLoading(false);
  };

  useEffect(() => {
    if (!loading && user && isAdmin && !adminSecondFactorRequired) {
      loadStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, isAdmin, adminSecondFactorRequired]);

  useEffect(() => {
    try {
      localStorage.setItem(NEWS_API_KEY_LOCAL_STORAGE_KEY, newsApiKeyInput);
    } catch {
      // no-op
    }
  }, [newsApiKeyInput]);

  if (loading) return <div className="min-h-screen pt-36 px-6 max-w-5xl mx-auto">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin || adminSecondFactorRequired) return <Navigate to="/member" replace />;

  const runToggle = async (enabled) => {
    setBusy(true);
    setMessage('');
    setErrorMessage('');
    const { data, error } = await adminSetMaintenanceBundleEnabled(enabled);
    if (error) {
      setErrorMessage(error.message);
      setBusy(false);
      return;
    }
    const first = Array.isArray(data) ? data[0] : data;
    if (first?.ok === false) {
      setErrorMessage(first?.message || 'Operation failed');
      setBusy(false);
      return;
    }
    setMessage(first?.message || (enabled ? text.enabled : text.paused));
    await loadStatus();
    setBusy(false);
  };

  const runManual = async () => {
    setBusy(true);
    setMessage('');
    setErrorMessage('');
    const { data, error } = await runSystemHeartbeat('admin-manual');
    if (error) {
      setErrorMessage(error.message);
      setBusy(false);
      return;
    }
    const first = Array.isArray(data) ? data[0] : data;
    setMessage(first?.message || 'Done');
    await loadStatus();
    setBusy(false);
  };

  const saveNewsKey = async () => {
    setBusy(true);
    setMessage('');
    setErrorMessage('');
    const { data, error } = await adminSetNewsApiKey(newsApiKeyInput);
    if (error) {
      setErrorMessage(error.message);
      setBusy(false);
      return;
    }
    const first = Array.isArray(data) ? data[0] : data;
    if (first?.ok === false) {
      setErrorMessage(first?.message || 'Operation failed');
      setBusy(false);
      return;
    }
    setMessage(first?.message || 'Saved');
    setBusy(false);
  };

  const runNewsNow = async () => {
    setBusy(true);
    setMessage('');
    setErrorMessage('');
    const { data, error } = await runNewsIngest('admin-manual');
    if (error) {
      setErrorMessage(error.message);
      setBusy(false);
      return;
    }
    const first = Array.isArray(data) ? data[0] : data;
    if (first?.ok === false) {
      setErrorMessage(first?.message || 'News ingest failed');
      setBusy(false);
      return;
    }
    setMessage(`${first?.message || 'Done'} (+${first?.inserted_count ?? 0})`);
    await loadStatus();
    setBusy(false);
  };

  const isEnabled = Boolean(status?.bundle_enabled);
  const pageTrackingEnabled = Boolean(status?.page_tracking_enabled);
  const adminTrackingEnabled = Boolean(status?.admin_tracking_enabled);
  const newsIngestEnabled = Boolean(status?.news_ingest_enabled);
  const maxDailyTotal = Math.max(1, ...dailyActivity.map((row) => Number(row.total || 0)));

  return (
    <section className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-4xl mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-8 shadow-sm">
        <h1 className="text-3xl font-headline font-bold mb-2">{text.title}</h1>
        <p className="text-secondary mb-6">{text.subtitle}</p>
        <AdminNav />

        <div className="rounded-xl border border-outline-variant/30 p-4 bg-surface-container">
          {statusLoading ? (
            <p className="text-sm text-secondary">Loading...</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">{text.state}:</span>{' '}
                <span className={isEnabled ? 'text-primary font-semibold' : 'text-error font-semibold'}>
                  {isEnabled ? text.enabled : text.paused}
                </span>
              </div>
              <div>
                <span className="font-semibold">{text.tracking}:</span>{' '}
                <span className={pageTrackingEnabled ? 'text-primary' : 'text-error'}>
                  {text.pageTracking} {pageTrackingEnabled ? text.enabled : text.paused}
                </span>{' '}
                /{' '}
                <span className={adminTrackingEnabled ? 'text-primary' : 'text-error'}>
                  {text.adminTracking} {adminTrackingEnabled ? text.enabled : text.paused}
                </span>
                {' / '}
                <span className={newsIngestEnabled ? 'text-primary' : 'text-error'}>
                  {text.newsIngest} {newsIngestEnabled ? text.enabled : text.paused}
                </span>
              </div>
              <div>
                <span className="font-semibold">{text.schedule}:</span> {status?.schedule || '-'}
              </div>
              <div>
                <span className="font-semibold">{text.lastRun}:</span> {toLocaleTime(status?.last_run_at)}
              </div>
              <div>
                <span className="font-semibold">{text.lastSource}:</span> {status?.last_source || text.unknown}
              </div>
              <div>
                <span className="font-semibold">{text.totalRuns}:</span> {status?.total_runs ?? 0}
              </div>
              <div>
                <span className="font-semibold">{text.lastLogAt}:</span> {toLocaleTime(status?.last_log_at)}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadStatus}
            disabled={busy || statusLoading}
            className="bg-surface-container-high px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {text.refresh}
          </button>
          <button
            type="button"
            onClick={() => runToggle(true)}
            disabled={busy || isEnabled}
            className="bg-primary text-on-primary px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {text.enable}
          </button>
          <button
            type="button"
            onClick={() => runToggle(false)}
            disabled={busy || !isEnabled}
            className="bg-error text-on-error px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {text.pause}
          </button>
          <button
            type="button"
            onClick={runManual}
            disabled={busy}
            className="bg-tertiary text-on-tertiary px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {text.manualRun}
          </button>
          <button
            type="button"
            onClick={runNewsNow}
            disabled={busy}
            className="bg-tertiary text-on-tertiary px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {text.runNewsNow}
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-outline-variant/30 p-4 bg-surface-container">
          <label className="block text-sm font-semibold text-secondary">{text.newsKeyLabel}</label>
          <p className="mt-1 text-xs text-secondary">{text.newsKeyHint}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              type="password"
              value={newsApiKeyInput}
              onChange={(e) => setNewsApiKeyInput(e.target.value)}
              className="flex-1 min-w-[260px] rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
              placeholder="SerpApi private key"
            />
            <button
              type="button"
              onClick={saveNewsKey}
              disabled={busy}
              className="bg-surface-container-high px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {text.saveNewsKey}
            </button>
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-primary">{message}</p> : null}
        {errorMessage ? <p className="mt-4 text-sm text-error">{errorMessage}</p> : null}

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-outline-variant/30 p-4 bg-surface-container">
            <h2 className="font-semibold mb-3">{text.metricsTitle}</h2>
            <div className="space-y-1 text-sm">
              <div>{text.metricPageViews}: {metrics?.page_views ?? 0}</div>
              <div>{text.metricUniquePages}: {metrics?.unique_pages ?? 0}</div>
              <div>{text.metricAdminPageViews}: {metrics?.admin_page_views ?? 0}</div>
              <div>{text.metricAdminUsers}: {metrics?.admin_unique_users ?? 0}</div>
              <div>{text.metricAdminActions}: {metrics?.admin_actions ?? 0}</div>
              <div>{text.metricNewsArticles}: {metrics?.news_articles ?? 0}</div>
              <div>{text.metricNewsRuns}: {metrics?.news_ingest_runs ?? 0}</div>
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant/30 p-4 bg-surface-container">
            <h2 className="font-semibold mb-3">{text.topPagesTitle}</h2>
            {topPages.length ? (
              <div className="space-y-1 text-sm">
                {topPages.map((row) => (
                  <div key={row.page_path}>
                    {row.page_path}: {row.views}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary">{text.noData}</p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-outline-variant/30 p-4 bg-surface-container">
          <h2 className="font-semibold mb-3">{text.trendTitle}</h2>
          {dailyActivity.length ? (
            <div className="space-y-2">
              {dailyActivity.map((row) => {
                const total = Number(row.total || 0);
                const width = Math.max(2, Math.round((total / maxDailyTotal) * 100));
                const day = String(row.day || '').slice(5);
                return (
                  <div key={row.day} className="grid grid-cols-[56px_1fr_120px] gap-2 items-center text-xs">
                    <div className="text-secondary">{day}</div>
                    <div className="h-2.5 rounded bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${width}%` }} />
                    </div>
                    <div className="text-secondary">
                      {text.trendTotal}: {total} (pv {row.page_views}, admin {row.admin_page_views}, hb {row.heartbeats}, news {row.news_articles})
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-secondary">{text.noData}</p>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-outline-variant/30 p-4 bg-surface-container">
          <h2 className="font-semibold mb-3">{text.recentActionsTitle}</h2>
          {recentActions.length ? (
            <div className="space-y-1 text-sm">
              {recentActions.map((row) => (
                <div key={`${row.created_at}-${row.action_type}`}>
                  {toLocaleTime(row.created_at)} - {row.action_type} ({row.detail || '-'})
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary">{text.noData}</p>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-outline-variant/30 p-4 bg-surface-container">
          <h2 className="font-semibold mb-3">{text.recentNewsRunsTitle}</h2>
          {recentNewsRuns.length ? (
            <div className="space-y-1 text-sm">
              {recentNewsRuns.map((row) => (
                <div key={`${row.created_at}-${row.source}`}>
                  {toLocaleTime(row.created_at)} - {row.source} - {row.ok ? 'ok' : 'fail'} (+{row.inserted_count}) {row.message || ''}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary">{text.noData}</p>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-outline-variant/30 p-4 bg-surface-container">
          <h2 className="font-semibold mb-3">{text.recentCodeActionsTitle}</h2>
          {recentCodeActions.length ? (
            <div className="space-y-1 text-sm">
              {recentCodeActions.map((row) => (
                <div key={`${row.id}-${row.created_at}`}>
                  {toLocaleTime(row.created_at)} - count:{row.generated_count} sku:{row.product_sku || '-'} batch:{row.batch_id}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary">{text.noData}</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link to="/member" className="text-secondary hover:text-primary">
            {text.backMember}
          </Link>
        </div>
      </div>
    </section>
  );
}
