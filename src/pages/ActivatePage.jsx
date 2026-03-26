import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useI18n } from '../i18n/useI18n';

export default function ActivatePage() {
  const { lang } = useI18n();
  const { user, profile, loading, signIn, signUp, redeemActivationCode } = useAuth();
  const [searchParams] = useSearchParams();
  const [codeInput, setCodeInput] = useState(searchParams.get('code') ?? '');
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const productMember = profile?.membership_tier === 'product_member';
  const normalizedCode = useMemo(() => codeInput.trim().toUpperCase(), [codeInput]);

  const text =
    lang === 'en'
      ? {
          title: 'Activate Product',
          subtitle: 'Use your product activation code to upgrade your account.',
          code: 'Activation code',
          codePlaceholder: 'Enter code or scan QR',
          redeem: 'Activate now',
          signin: 'Sign in',
          signup: 'Sign up',
          email: 'Email',
          password: 'Password',
          submitSignin: 'Login',
          submitSignup: 'Register',
          memberTier: 'Membership tier',
          tierMember: 'Member',
          tierProduct: 'Product Member',
        }
      : {
          title: '產品啟用',
          subtitle: '輸入產品啟用碼，將帳號升級為產品會員。',
          code: '啟用碼',
          codePlaceholder: '輸入啟用碼或掃描 QR',
          redeem: '立即啟用',
          signin: '登入',
          signup: '註冊',
          email: '電子郵件',
          password: '密碼',
          submitSignin: '登入',
          submitSignup: '註冊帳號',
          memberTier: '會員等級',
          tierMember: '一般會員',
          tierProduct: '產品會員',
        };

  const runRedeem = async () => {
    if (!normalizedCode) {
      setErrorMessage(lang === 'en' ? 'Activation code is required.' : '請輸入啟用碼。');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setMessage('');
    const { data, error } = await redeemActivationCode(normalizedCode);
    if (error) {
      setErrorMessage(error.message);
      setBusy(false);
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.ok) {
      setErrorMessage(row?.message ?? 'Activation failed');
      setBusy(false);
      return;
    }

    setMessage(lang === 'en' ? 'Activation successful.' : '啟用成功，已升級為產品會員。');
    setBusy(false);
  };

  const onAuthSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage('');
    setMessage('');

    if (mode === 'signin') {
      const { error } = await signIn(form);
      if (error) {
        setErrorMessage(error.message);
        setBusy(false);
        return;
      }
      setMessage(lang === 'en' ? 'Login successful. Click Activate now.' : '登入成功，請按「立即啟用」。');
      setBusy(false);
      return;
    }

    const { error } = await signUp(form);
    if (error) {
      setErrorMessage(error.message);
      setBusy(false);
      return;
    }

    setMessage(
      lang === 'en'
        ? 'Registration sent. Confirm your email, then return to this link to activate.'
        : '註冊已送出，請先完成信箱驗證，再回到這個連結啟用。'
    );
    setBusy(false);
  };

  if (loading) {
    return <div className="min-h-screen pt-36 px-6 max-w-5xl mx-auto">Loading...</div>;
  }

  return (
    <section className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-xl mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-8 shadow-sm">
        <h1 className="text-3xl font-headline font-bold mb-2">{text.title}</h1>
        <p className="text-secondary mb-6">{text.subtitle}</p>

        <label className="block mb-4">
          <span className="text-sm font-semibold text-secondary">{text.code}</span>
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5 tracking-wider"
            placeholder={text.codePlaceholder}
          />
        </label>

        {user ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-surface-container p-4 text-sm text-secondary">
              <div>{user.email}</div>
              <div className="mt-1">
                {text.memberTier}: {productMember ? text.tierProduct : text.tierMember}
              </div>
            </div>
            <button
              type="button"
              onClick={runRedeem}
              disabled={busy}
              className="w-full bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold disabled:opacity-50"
            >
              {text.redeem}
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  mode === 'signin'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface'
                }`}
              >
                {text.signin}
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  mode === 'signup'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface'
                }`}
              >
                {text.signup}
              </button>
            </div>
            <form onSubmit={onAuthSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-secondary">{text.email}</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-secondary">{text.password}</span>
                <input
                  type="password"
                  minLength={8}
                  required
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold disabled:opacity-50"
              >
                {mode === 'signin' ? text.submitSignin : text.submitSignup}
              </button>
            </form>
          </>
        )}

        {message ? <p className="mt-4 text-sm text-primary">{message}</p> : null}
        {errorMessage ? <p className="mt-4 text-sm text-error">{errorMessage}</p> : null}

        <Link to="/" className="inline-block mt-6 text-sm text-secondary hover:text-primary">
          {lang === 'en' ? 'Back to home' : '回首頁'}
        </Link>
      </div>
    </section>
  );
}
