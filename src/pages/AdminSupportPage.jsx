import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useI18n } from '../i18n/useI18n';
import AdminNav from '../components/AdminNav';

export default function AdminSupportPage() {
  const { lang } = useI18n();
  const {
    user,
    loading,
    isAdmin,
    adminSecondFactorRequired,
    adminLookupActivation,
    adminTransferActivation,
    adminRevokeActivation,
    adminReissueActivation,
    adminSupportRecentActions,
  } = useAuth();

  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [selectedSerial, setSelectedSerial] = useState('');
  const [actions, setActions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [reissueResult, setReissueResult] = useState(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [reason, setReason] = useState('');
  const latestReissuedSerial = reissueResult?.newPublicSerial || '';

  const text =
    lang === 'en'
      ? {
          title: 'Admin Support',
          subtitle: 'Lookup by serial/email, transfer ownership, revoke, and reissue.',
          query: 'Serial or owner email',
          lookup: 'Lookup',
          transfer: 'Transfer Owner',
          revoke: 'Revoke',
          reissue: 'Reissue',
          toEmail: 'Target email',
          reason: 'Reason',
          logs: 'Recent Actions',
        }
      : {
          title: '客服管理台',
          subtitle: '可依序號/信箱查詢，並執行轉移、作廢、重發。',
          query: '序號或會員 email',
          lookup: '查詢',
          transfer: '轉移綁定',
          revoke: '作廢',
          reissue: '重發',
          toEmail: '目標帳號 email',
          reason: '原因',
          logs: '最近操作',
        };

  const actionLabel = (type) => {
    const mapZh = {
      lookup: '查詢',
      transfer: '轉移綁定',
      revoke: '作廢',
      reissue: '重發',
    };
    const mapEn = {
      lookup: 'Lookup',
      transfer: 'Transfer',
      revoke: 'Revoke',
      reissue: 'Reissue',
    };
    return lang === 'en' ? mapEn[type] || type : mapZh[type] || type;
  };

  if (loading) return <div className="min-h-screen pt-36 px-6 max-w-5xl mx-auto">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin || adminSecondFactorRequired) return <Navigate to="/member" replace />;

  const loadLogs = async () => {
    const { data, error } = await adminSupportRecentActions(30);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setActions(Array.isArray(data) ? data : []);
  };

  const lookup = async (queryOverride, keepMessage = false) => {
    const q = (queryOverride ?? query).trim();
    if (!q) return;

    setBusy(true);
    setErrorMessage('');
    if (!keepMessage) {
      setMessage('');
    }

    const { data, error } = await adminLookupActivation(q);
    if (error) {
      setErrorMessage(error.message);
      setBusy(false);
      return;
    }
    const list = Array.isArray(data) ? data : [];
    setRows(list);
    setSelectedSerial(list[0]?.public_serial ?? '');
    await loadLogs();
    setBusy(false);
  };

  const runAction = async (kind, serialArg) => {
    const serial = serialArg || selectedSerial;
    if (!serial) {
      setErrorMessage(lang === 'en' ? 'Please select a serial first.' : '請先選擇一筆序號。');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setMessage('');

    let result;
    if (kind === 'transfer') {
      result = await adminTransferActivation({
        publicSerial: serial,
        toEmail: transferEmail,
        reason,
      });
    } else if (kind === 'revoke') {
      result = await adminRevokeActivation({ publicSerial: serial, reason });
    } else {
      result = await adminReissueActivation({
        publicSerial: serial,
        reason,
        baseUrl: 'https://www.bee-yuan.com',
      });
    }

    if (result.error) {
      setErrorMessage(result.error.message);
      setBusy(false);
      return;
    }

    const first = Array.isArray(result.data) ? result.data[0] : result.data;
    if (first?.ok === false) {
      setErrorMessage(first?.message || 'Operation failed');
      setBusy(false);
      return;
    }

    if (kind === 'reissue') {
      const details = {
        message: first?.message || 'Done',
        oldPublicSerial: first?.old_public_serial || '',
        newPublicSerial: first?.new_public_serial || '',
        newCode: first?.new_code || '',
        activationUrl: first?.activation_url || '',
      };
      setReissueResult(details);
      setMessage(details.message);
    } else {
      setReissueResult(null);
      setMessage(first?.message || 'Done');
    }

    if (kind === 'reissue') {
      await lookup(serial, true);
    } else {
      await lookup(undefined, true);
    }
    await loadLogs();
    setBusy(false);
  };

  return (
    <section className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-6xl mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-8 shadow-sm">
        <h1 className="text-3xl font-headline font-bold mb-2">{text.title}</h1>
        <p className="text-secondary mb-6">{text.subtitle}</p>
        <AdminNav />

        <div className="grid md:grid-cols-3 gap-4">
          <label className="md:col-span-2 block">
            <span className="text-sm font-semibold text-secondary">{text.query}</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => lookup()}
              disabled={busy || !query.trim()}
              className="bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold disabled:opacity-50"
            >
              {text.lookup}
            </button>
            <button
              type="button"
              onClick={loadLogs}
              disabled={busy}
              className="bg-surface-container-high px-4 py-2.5 rounded-xl font-semibold disabled:opacity-50"
            >
              {text.logs}
            </button>
            <Link to="/member" className="bg-surface-container-high px-4 py-2.5 rounded-xl font-semibold">
              {lang === 'en' ? 'Back to member' : '回會員頁'}
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <label className="block">
            <span className="text-sm font-semibold text-secondary">
              {lang === 'en' ? 'Selected serial' : '目前選取序號'}
            </span>
            <input
              type="text"
              value={selectedSerial}
              onChange={(e) => setSelectedSerial(e.target.value)}
              placeholder={lang === 'en' ? 'Choose from lookup result below' : '請先從下方查詢結果選擇'}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.toEmail}</span>
            <input
              type="email"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.reason}</span>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runAction('transfer')}
            disabled={busy || !selectedSerial || !transferEmail}
            className="bg-tertiary text-on-tertiary px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {text.transfer}
          </button>
          <button
            type="button"
            onClick={() => runAction('revoke')}
            disabled={busy || !selectedSerial}
            className="bg-error text-on-error px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {text.revoke}
          </button>
          <button
            type="button"
            onClick={() => runAction('reissue')}
            disabled={busy || !selectedSerial}
            className="bg-surface-container-high px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {text.reissue}
          </button>
        </div>

        {message ? <p className="mt-4 text-sm text-primary">{message}</p> : null}
        {errorMessage ? <p className="mt-4 text-sm text-error">{errorMessage}</p> : null}
        {reissueResult ? (
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary-fixed/20 p-4 text-sm">
            <div>{lang === 'en' ? 'Reissue completed' : '重發完成'}</div>
            <div>Old SN: {reissueResult.oldPublicSerial || '-'}</div>
            <div>New SN: {reissueResult.newPublicSerial || '-'}</div>
            <div>{lang === 'en' ? 'New code' : '新啟用碼'}: {reissueResult.newCode || '-'}</div>
            <div className="break-all">
              URL: {reissueResult.activationUrl || '-'}
            </div>
            {reissueResult.newPublicSerial ? (
              <button
                type="button"
                onClick={() => {
                  setQuery(reissueResult.newPublicSerial);
                  setSelectedSerial(reissueResult.newPublicSerial);
                }}
                className="mt-3 bg-surface-container-high px-3 py-2 rounded-lg text-sm font-semibold"
              >
                {lang === 'en' ? 'Use new serial in form' : '帶入新序號到表單'}
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">{lang === 'en' ? 'Lookup Results' : '查詢結果'}</h2>
          {rows.length ? (
            <div className="space-y-3">
              {rows
                .slice()
                .sort((a, b) => {
                  if (!latestReissuedSerial) return 0;
                  if (a.public_serial === latestReissuedSerial) return -1;
                  if (b.public_serial === latestReissuedSerial) return 1;
                  return 0;
                })
                .map((row) => {
                const active = selectedSerial === row.public_serial;
                const isLatestReissue = latestReissuedSerial && row.public_serial === latestReissuedSerial;
                return (
                  <div
                    key={`${row.code_id}-${row.public_serial}`}
                    className={`rounded-xl border p-4 ${
                      active
                        ? 'border-primary bg-primary-fixed/20'
                        : isLatestReissue
                          ? 'border-tertiary bg-tertiary-fixed/20'
                          : 'border-outline-variant/30'
                    }`}
                  >
                    {isLatestReissue ? (
                      <div className="inline-block mb-2 rounded-full bg-tertiary text-on-tertiary px-2.5 py-1 text-xs font-semibold">
                        {lang === 'en' ? 'Latest Reissue' : '最新重發'}
                      </div>
                    ) : null}
                    <div className="text-sm">SN: {row.public_serial}</div>
                    <div className="text-sm">Status: {row.status}</div>
                    <div className="text-sm">Owner: {row.owner_email || '-'}</div>
                    <div className="text-sm">SKU: {row.product_sku || '-'}</div>
                    <div className="text-sm">Code: {row.code_mask || '-'}</div>
                    <button
                      type="button"
                      onClick={() => setSelectedSerial(row.public_serial)}
                      className="mt-3 bg-surface-container-high px-3 py-2 rounded-lg text-sm font-semibold"
                    >
                      {lang === 'en' ? 'Select this serial' : '選取這筆序號'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-secondary">
              {lang === 'en'
                ? 'No result yet. Enter serial or email and click Lookup.'
                : '目前沒有結果，請先輸入序號或 email 後按查詢。'}
            </p>
          )}
        </div>

        {actions.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">{text.logs}</h2>
            <div className="space-y-2">
              {actions.map((a) => (
                <div key={a.id} className="rounded-lg bg-surface-container px-4 py-2 text-sm">
                  [{new Date(a.created_at).toLocaleString()}] {actionLabel(a.action_type)} | SN:{' '}
                  {a.public_serial || '-'} | {a.target_email || '-'} | {a.reason || '-'}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
