import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';

export default function AdminNav() {
  const { lang } = useI18n();
  const location = useLocation();

  const items =
    lang === 'en'
      ? [
          { to: '/admin/maintenance', label: 'Maintenance' },
          { to: '/admin/codes', label: 'Code Admin' },
          { to: '/admin/support', label: 'Support Console' },
        ]
      : [
          { to: '/admin/maintenance', label: '維運管理' },
          { to: '/admin/codes', label: '產碼台' },
          { to: '/admin/support', label: '客服台' },
        ];

  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => {
        const active = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${
              active ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
