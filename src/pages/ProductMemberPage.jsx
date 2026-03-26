import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';
import SEO from '../components/SEO';

export default function ProductMemberPage() {
  const { lang } = useI18n();

  const text =
    lang === 'en'
      ? {
          title: 'Product Member Zone',
          subtitle: 'Under development.',
          desc: '',
          back: 'Back to member center',
        }
      : {
          title: '產品會員專區',
          subtitle: '開發中.',
          desc: '',
          back: '回會員中心',
        };

  return (
    <section className="min-h-screen pt-32 pb-16 px-6">
      <SEO
        title={lang === 'en' ? 'Product Member Zone | BeeYuan' : '產品會員專區 | 蜂緣 BeeYuan'}
        description={
          lang === 'en'
            ? 'Verified product-member feature area.'
            : '僅限已驗證產品會員使用的功能區。'
        }
        keywords={lang === 'en' ? 'product member,member zone' : '產品會員,會員專區'}
      />
      <div className="max-w-3xl mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-8 shadow-sm">
        <h1 className="text-3xl font-headline font-bold mb-2">{text.title}</h1>
        <p className="text-secondary mb-3">{text.subtitle}</p>
        {text.desc ? <p className="text-on-surface-variant mb-6">{text.desc}</p> : null}
        <Link to="/member" className="inline-block bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold">
          {text.back}
        </Link>
      </div>
    </section>
  );
}
