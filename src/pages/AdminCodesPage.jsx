import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { useAuth } from '../auth/useAuth';
import { useI18n } from '../i18n/useI18n';

function csvEscape(value) {
  const raw = String(value ?? '');
  return `"${raw.replaceAll('"', '""')}"`;
}

function isSafeActivationUrl(value) {
  try {
    const parsed = new URL(String(value ?? ''));
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export default function AdminCodesPage() {
  const { lang } = useI18n();
  const { user, loading, isAdmin, adminSecondFactorRequired, generateActivationCodes } = useAuth();
  const defaultBaseUrl =
    import.meta.env.VITE_APP_BASE_URL?.trim() || 'https://www.bee-yuan.com';
  const [form, setForm] = useState({
    count: 20,
    sku: '',
    note: '',
    baseUrl: defaultBaseUrl,
  });
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rows, setRows] = useState([]);
  const [qrMap, setQrMap] = useState({});

  const text =
    lang === 'en'
      ? {
          title: 'Admin Activation Codes',
          subtitle: 'Generate product activation codes for manufacturing and shipment.',
          count: 'Count',
          sku: 'Product SKU',
          note: 'Batch note',
          baseUrl: 'Activation base URL',
          generate: 'Generate Codes',
          export: 'Export CSV',
        }
      : {
          title: '管理員啟用碼',
          subtitle: '產生產品啟用碼，提供給生產與出貨貼標。',
          count: '數量',
          sku: '產品 SKU',
          note: '批次備註',
          baseUrl: '啟用網址基底',
          generate: '產生啟用碼',
          export: '匯出 CSV',
        };

  const csvContent = useMemo(() => {
    if (!rows.length) return '';
    const header = ['public_serial', 'code', 'activation_url', 'batch_id'];
    const body = rows.map((r) =>
      [
        csvEscape(r.public_serial),
        csvEscape(r.code),
        csvEscape(r.activation_url),
        csvEscape(r.batch_id),
      ].join(',')
    );
    return [header.join(','), ...body].join('\n');
  }, [rows]);

  if (loading) return <div className="min-h-screen pt-36 px-6 max-w-5xl mx-auto">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin || adminSecondFactorRequired) return <Navigate to="/member" replace />;

  const onGenerate = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage('');
    setRows([]);
    setQrMap({});

    const { data, error } = await generateActivationCodes(form);
    if (error) {
      setErrorMessage(error.message);
      setBusy(false);
      return;
    }

    const nextRows = data ?? [];
    setRows(nextRows);

    const qrEntries = await Promise.all(
      nextRows.map(async (item) => {
        const url = await QRCode.toDataURL(item.activation_url, { margin: 1, width: 140 });
        return [item.code, url];
      })
    );

    setQrMap(Object.fromEntries(qrEntries));
    setBusy(false);
  };

  const downloadCsv = () => {
    if (!csvContent) return;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `activation-codes-${new Date().toISOString().slice(0, 19).replaceAll(':', '-')}.csv`;
    a.click();
    URL.revokeObjectURL(href);
  };

  return (
    <section className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-5xl mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-8 shadow-sm">
        <h1 className="text-3xl font-headline font-bold mb-2">{text.title}</h1>
        <p className="text-secondary mb-6">{text.subtitle}</p>

        <form onSubmit={onGenerate} className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.count}</span>
            <input
              type="number"
              min={1}
              max={2000}
              value={form.count}
              onChange={(e) => setForm((prev) => ({ ...prev, count: Number(e.target.value) }))}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.sku}</span>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.note}</span>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.baseUrl}</span>
            <input
              type="url"
              value={form.baseUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, baseUrl: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
              required
            />
          </label>
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={busy}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold disabled:opacity-50"
            >
              {text.generate}
            </button>
            <button
              type="button"
              disabled={!rows.length}
              onClick={downloadCsv}
              className="bg-surface-container-high px-5 py-2.5 rounded-xl font-semibold disabled:opacity-50"
            >
              {text.export}
            </button>
            <Link to="/member" className="bg-surface-container-high px-5 py-2.5 rounded-xl font-semibold">
              {lang === 'en' ? 'Back to member' : '回會員頁'}
            </Link>
            <Link to="/admin/support" className="bg-surface-container-high px-5 py-2.5 rounded-xl font-semibold">
              {lang === 'en' ? 'Support console' : '客服台'}
            </Link>
          </div>
        </form>

        {errorMessage ? <p className="mt-4 text-sm text-error">{errorMessage}</p> : null}

        {rows.length ? (
          <div className="mt-8 grid lg:grid-cols-2 gap-4">
            {rows.map((row) => (
              <div key={row.code} className="rounded-xl border border-outline-variant/30 p-4">
                <div className="text-sm font-semibold mb-1">SN: {row.public_serial ?? '-'}</div>
                <div className="font-mono text-sm break-all">{row.code}</div>
                {isSafeActivationUrl(row.activation_url) ? (
                  <a
                    href={row.activation_url}
                    className="text-xs text-primary break-all"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {row.activation_url}
                  </a>
                ) : (
                  <div className="text-xs text-error break-all">{row.activation_url}</div>
                )}
                {qrMap[row.code] ? (
                  <img src={qrMap[row.code]} alt={`QR ${row.code}`} className="mt-3 w-[140px] h-[140px]" />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
