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
    runSystemHeartbeat,
  } = useAuth();
  const [busy, setBusy] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [topPages, setTopPages] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const [recentCodeActions, setRecentCodeActions] = useState([]);
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
          topPagesTitle: 'Top pages (24h)',
          recentActionsTitle: 'Recent maintenance actions',
          recentCodeActionsTitle: 'Recent code generation actions',
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
          topPagesTitle: '熱門頁面（24h）',
          recentActionsTitle: '最近維運操作',
          recentCodeActionsTitle: '最近產碼操作',
          noData: '目前無資料',
          backMember: '回會員頁',
          unknown: '未知',
        };

  const loadStatus = async () => {
    setStatusLoading(true);
    const [statusResp, metricsResp, topResp, actionResp, codeActionResp] = await Promise.all([
      adminGetHeartbeatStatus(),
      adminGetMaintenanceMetrics(24),
      adminTopPageViews({ hours: 24, limit: 8 }),
      adminRecentMaintenanceActions(10),
      adminRecentCodeActions(10),
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

    setStatusLoading(false);
  };

  useEffect(() => {
    if (!loading && user && isAdmin && !adminSecondFactorRequired) {
      loadStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, isAdmin, adminSecondFactorRequired]);

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

  const isEnabled = Boolean(status?.bundle_enabled);
  const pageTrackingEnabled = Boolean(status?.page_tracking_enabled);
  const adminTrackingEnabled = Boolean(status?.admin_tracking_enabled);

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
