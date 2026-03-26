import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useI18n } from '../i18n/useI18n';

export default function LoginPage() {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const {
    user,
    loading,
    isAdmin,
    adminSecondFactorRequired,
    signIn,
    signUp,
    linkGithubForAdmin,
    signOut,
  } = useAuth();
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!loading && user && !adminSecondFactorRequired) {
      navigate('/member', { replace: true });
    }
  }, [loading, user, adminSecondFactorRequired, navigate]);

  const text =
    lang === 'en'
      ? {
          title: 'Member Login',
          subtitle: 'This page is hidden from homepage navigation by design.',
          signIn: 'Sign In',
          signUp: 'Sign Up',
          email: 'Email',
          password: 'Password',
          submitSignIn: 'Login',
          submitSignUp: 'Register',
          adminGateTitle: 'Admin Second-Step Verification',
          adminGateDesc:
            'Your account is admin role. Please complete GitHub identity linking to unlock admin session.',
          adminGateBtn: 'Verify with GitHub',
          signOut: 'Sign out and switch account',
          home: 'Back to home',
        }
      : {
          title: '會員登入',
          subtitle: '此頁面刻意不放在首頁導覽，僅供需要時使用。',
          signIn: '登入',
          signUp: '註冊',
          email: '電子郵件',
          password: '密碼',
          submitSignIn: '登入帳號',
          submitSignUp: '建立帳號',
          adminGateTitle: '管理員第二級驗證',
          adminGateDesc: '你是管理員角色，請完成 GitHub 身分綁定，才會啟用管理員登入。',
          adminGateBtn: '使用 GitHub 進行第二級驗證',
          signOut: '登出並切換帳號',
          home: '回首頁',
        };

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage('');
    setNotice('');

    try {
      if (mode === 'signin') {
        const { error } = await signIn(form);
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        setNotice(
          lang === 'en'
            ? 'Login successful.'
            : '登入成功。若你是管理員，請完成下方第二級驗證。'
        );
      } else {
        const { error } = await signUp(form);
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        setNotice(
          lang === 'en'
            ? 'Registration successful. Please check your email for confirmation.'
            : '註冊成功，請到信箱完成驗證信後再登入。'
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const startAdminVerification = async () => {
    setBusy(true);
    setErrorMessage('');
    const { error } = await linkGithubForAdmin();
    if (error) {
      setErrorMessage(error.message);
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-36 px-6 max-w-5xl mx-auto">Loading...</div>;
  }

  return (
    <section className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-xl mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-8 shadow-sm">
        <h1 className="text-3xl font-headline font-bold mb-2">{text.title}</h1>
        <p className="text-secondary mb-6">{text.subtitle}</p>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              mode === 'signin'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface'
            }`}
            onClick={() => setMode('signin')}
          >
            {text.signIn}
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              mode === 'signup'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface'
            }`}
            onClick={() => setMode('signup')}
          >
            {text.signUp}
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.email}</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.password}</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
              minLength={8}
              required
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold disabled:opacity-50"
          >
            {mode === 'signin' ? text.submitSignIn : text.submitSignUp}
          </button>
        </form>

        {notice ? <p className="mt-4 text-sm text-primary">{notice}</p> : null}
        {errorMessage ? <p className="mt-3 text-sm text-error">{errorMessage}</p> : null}

        {user && isAdmin && adminSecondFactorRequired ? (
          <div className="mt-8 p-4 rounded-xl border border-tertiary/30 bg-tertiary-fixed/20">
            <h2 className="font-semibold text-on-surface mb-2">{text.adminGateTitle}</h2>
            <p className="text-sm text-secondary mb-4">{text.adminGateDesc}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startAdminVerification}
                disabled={busy}
                className="bg-tertiary text-on-tertiary px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {text.adminGateBtn}
              </button>
              <button
                type="button"
                onClick={signOut}
                className="bg-surface-container-high px-4 py-2 rounded-lg text-sm font-semibold"
              >
                {text.signOut}
              </button>
            </div>
          </div>
        ) : null}

        <Link to="/" className="inline-block mt-6 text-sm text-secondary hover:text-primary">
          {text.home}
        </Link>
      </div>
    </section>
  );
}
