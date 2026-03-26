import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useI18n } from '../i18n/useI18n';

function AdminSecondFactorBlock({
  onVerify,
  onSignOut,
  busy,
  lang,
  errorMessage,
  session,
  user,
  profile,
  isAdmin,
  hasGithubIdentity,
}) {
  const text =
    lang === 'en'
      ? {
          title: 'Admin verification required',
          desc: 'Please complete GitHub verification before entering member tools.',
          verify: 'Verify with GitHub',
          signOut: 'Sign out',
          back: 'Go to login',
        }
      : {
          title: '管理員需要完成第二級驗證',
          desc: '請先用 GitHub 完成驗證，才能進入會員功能。',
          verify: '使用 GitHub 完成驗證',
          signOut: '登出',
          back: '回登入頁',
        };

  return (
    <section className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-xl mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">{text.title}</h1>
        <p className="text-secondary mb-6">{text.desc}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onVerify}
            disabled={busy}
            className="bg-tertiary text-on-tertiary px-4 py-2.5 rounded-xl font-semibold disabled:opacity-50"
          >
            {text.verify}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="bg-surface-container-high px-4 py-2.5 rounded-xl font-semibold"
          >
            {text.signOut}
          </button>
          <Link to="/login" className="px-4 py-2.5 rounded-xl font-semibold bg-surface-container-high">
            {text.back}
          </Link>
        </div>
        {errorMessage ? <p className="mt-4 text-sm text-error">{errorMessage}</p> : null}
        {import.meta.env.DEV ? (
          <div className="mt-4 p-3 rounded-lg bg-surface-container text-xs text-secondary space-y-1">
            <div>debug.session: {session ? 'yes' : 'no'}</div>
            <div>debug.user_id: {user?.id ?? '-'}</div>
            <div>debug.email: {user?.email ?? '-'}</div>
            <div>debug.role: {profile?.role ?? '-'}</div>
            <div>debug.is_admin: {isAdmin ? 'yes' : 'no'}</div>
            <div>debug.github_identity: {hasGithubIdentity ? 'yes' : 'no'}</div>
            <div>debug.redirect_to: {window.location.origin}/member</div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function MemberPage() {
  const { lang } = useI18n();
  const {
    session,
    user,
    profile,
    loading,
    isAdmin,
    isProductMember,
    hasGithubIdentity,
    adminSecondFactorRequired,
    updateProfile,
    linkGithubForAdmin,
    signOut,
  } = useAuth();
  const [draft, setDraft] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const text =
    lang === 'en'
      ? {
          title: 'Member Profile',
          subtitle: 'You can edit profile fields after login.',
          email: 'Email',
          role: 'Role',
          membershipTier: 'Membership Tier',
          displayName: 'Display Name',
          phone: 'Phone',
          company: 'Company',
          save: 'Save Changes',
          home: 'Back to home',
          roleMember: 'Member',
          roleAdmin: 'Admin',
          tierMember: 'Member',
          tierProduct: 'Product Member',
        }
      : {
          title: '會員資料',
          subtitle: '登入後可編輯以下會員資料。',
          email: '電子郵件',
          role: '角色',
          membershipTier: '會員等級',
          displayName: '顯示名稱',
          phone: '電話',
          company: '公司',
          save: '儲存變更',
          home: '回首頁',
          roleMember: '一般會員',
          roleAdmin: '管理員',
          tierMember: '一般會員',
          tierProduct: '產品會員',
        };

  if (loading) {
    return <div className="min-h-screen pt-36 px-6 max-w-5xl mx-auto">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminSecondFactorRequired) {
    return (
      <AdminSecondFactorBlock
        busy={busy}
        errorMessage={errorMessage}
        lang={lang}
        session={session}
        user={user}
        profile={profile}
        isAdmin={isAdmin}
        hasGithubIdentity={hasGithubIdentity}
        onSignOut={signOut}
        onVerify={async () => {
          setBusy(true);
          const { error } = await linkGithubForAdmin();
          if (error) {
            setErrorMessage(error.message);
            setBusy(false);
          }
        }}
      />
    );
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setErrorMessage('');

    const { error } = await updateProfile(form);
    if (error) {
      setErrorMessage(error.message);
      setBusy(false);
      return;
    }

    setMessage(lang === 'en' ? 'Profile updated.' : '會員資料已更新。');
    setBusy(false);
  };

  const form = {
    display_name: draft.display_name ?? profile?.display_name ?? '',
    phone: draft.phone ?? profile?.phone ?? '',
    company: draft.company ?? profile?.company ?? '',
  };

  return (
    <section className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-2xl mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-8 shadow-sm">
        <h1 className="text-3xl font-headline font-bold mb-2">{text.title}</h1>
        <p className="text-secondary mb-6">{text.subtitle}</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.email}</span>
            <input
              type="text"
              value={user.email ?? ''}
              disabled
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-surface-container-high px-4 py-2.5"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.role}</span>
            <input
              type="text"
              value={profile?.role === 'admin' ? text.roleAdmin : text.roleMember}
              disabled
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-surface-container-high px-4 py-2.5"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.membershipTier}</span>
            <input
              type="text"
              value={isProductMember ? text.tierProduct : text.tierMember}
              disabled
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-surface-container-high px-4 py-2.5"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.displayName}</span>
            <input
              type="text"
              value={form.display_name}
              onChange={(e) => setDraft((prev) => ({ ...prev, display_name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.phone}</span>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-secondary">{text.company}</span>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setDraft((prev) => ({ ...prev, company: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-2.5"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold disabled:opacity-50"
          >
            {text.save}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-primary">{message}</p> : null}
        {errorMessage ? <p className="mt-4 text-sm text-error">{errorMessage}</p> : null}

        <Link to="/" className="inline-block mt-6 text-sm text-secondary hover:text-primary">
          {text.home}
        </Link>
        {isAdmin && hasGithubIdentity ? (
          <Link to="/admin/codes" className="inline-block mt-6 ml-4 text-sm text-primary hover:opacity-80">
            {lang === 'en' ? 'Activation code admin' : '啟用碼管理'}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
