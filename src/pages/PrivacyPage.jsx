import { useI18n } from '../i18n/useI18n';
import SEO from '../components/SEO';

export default function PrivacyPage() {
  const { lang } = useI18n();

  const text =
    lang === 'en'
      ? {
          title: 'Privacy Policy',
          updated: 'Last updated: March 26, 2026',
          company: 'BeeYuan Co., Ltd.',
          intro:
            'This Privacy Policy explains how BeeYuan Co., Ltd. ("BeeYuan", "we", "our", or "us") collects, uses, stores, and protects personal data when you access our website, member center, and related product activation services.',
          sections: [
            {
              title: '1. Data We Collect',
              items: [
                'Account data: email, login identity, and authentication status.',
                'Member profile data: display name, phone number, and company name.',
                'Product activation data: public serial number, activation status, activation timestamp, and ownership binding records.',
                'Support and admin operation logs: lookup records, transfer/revoke/reissue actions, target account email, reason notes, and action timestamps.',
                'Cookie preference data: your selected cookie settings stored in browser local storage.',
              ],
            },
            {
              title: '2. How We Use Data',
              items: [
                'To provide member login, account management, and product activation services.',
                'To process support requests, ownership transfer, and after-sales operations.',
                'To maintain service security, access control, anti-abuse checks, and auditability.',
                'To improve website content and user experience based on your cookie choices.',
              ],
            },
            {
              title: '3. Cookies and Similar Technologies',
              items: [
                'Necessary cookies are used for core site functionality and cannot be disabled.',
                'Analytics and marketing cookies are used only after your consent.',
                'You can change cookie preferences anytime through "Cookie Settings" in the footer.',
              ],
            },
            {
              title: '4. Third-Party Services',
              items: [
                'Supabase: authentication and database hosting.',
                'GitHub (for admin accounts): second-step identity verification.',
                'Google Fonts: loading web fonts from Google services.',
              ],
            },
            {
              title: '5. International Data Transfer',
              items: [
                'Some service providers may process data in jurisdictions outside your location.',
                'Where cross-border transfer occurs, we apply reasonable contractual and technical safeguards consistent with applicable law.',
              ],
            },
            {
              title: '6. Data Retention',
              items: [
                'We keep account, activation, and support records as needed to operate services, meet legal obligations, and handle disputes.',
                'When retention is no longer necessary, data will be deleted or anonymized where reasonably possible.',
              ],
            },
            {
              title: '7. Your Rights',
              items: [
                'You may request access, correction, or deletion of your personal data, subject to legal and operational limits.',
                'You may contact us for privacy-related requests and we will respond within a reasonable time.',
              ],
            },
            {
              title: '8. Security',
              items: [
                'We use access controls and role-based restrictions to reduce unauthorized access risk.',
                'No internet transmission is completely secure; please keep your account credentials safe.',
              ],
            },
            {
              title: '9. Policy Updates',
              items: [
                'We may update this Privacy Policy from time to time. Material updates will be published on this page with a revised "Last updated" date.',
              ],
            },
            {
              title: '10. Contact',
              items: ['Email: contact@bee-yuan.com'],
            },
          ],
        }
      : {
          title: '隱私政策',
          updated: '最後更新日期：2026 年 3 月 26 日',
          company: '蜂緣有限公司',
          intro:
            '本隱私政策說明蜂緣有限公司（以下稱「蜂緣」、「我們」）於您使用本網站、會員中心與產品啟用相關服務時，如何蒐集、使用、保存與保護您的個人資料。',
          sections: [
            {
              title: '1. 我們蒐集的資料類型',
              items: [
                '帳號資料：電子郵件、登入身分與驗證狀態。',
                '會員資料：顯示名稱、電話、公司名稱。',
                '產品啟用資料：公開序號、啟用狀態、啟用時間與綁定紀錄。',
                '客服與管理操作紀錄：查詢、轉移、作廢、重發等操作紀錄，包含目標帳號 Email、原因與時間。',
                'Cookie 偏好資料：您在瀏覽器 localStorage 儲存的 Cookie 設定。',
              ],
            },
            {
              title: '2. 資料使用目的',
              items: [
                '提供會員登入、帳號管理與產品啟用服務。',
                '處理售後客服需求與產品綁定轉移作業。',
                '維護服務安全、權限控管、防濫用檢查與稽核追蹤。',
                '依您的 Cookie 偏好改善網站內容與體驗。',
              ],
            },
            {
              title: '3. Cookie 與類似技術',
              items: [
                '必要 Cookie 用於網站核心功能，無法關閉。',
                '分析與行銷 Cookie 僅在您同意後啟用。',
                '您可透過頁尾「Cookie 設定」隨時調整偏好。',
              ],
            },
            {
              title: '4. 第三方服務',
              items: [
                'Supabase：用於帳號驗證與資料庫服務。',
                'GitHub（管理員帳號）：用於第二級身分驗證。',
                'Google Fonts：用於網站字型載入。',
              ],
            },
            {
              title: '5. 跨境傳輸',
              items: [
                '部分第三方服務供應商可能於您所在地以外之地區處理資料。',
                '若有跨境傳輸情形，我們將依適用法令採取合理契約與技術保護措施。',
              ],
            },
            {
              title: '6. 資料保存期間',
              items: [
                '我們會於提供服務、符合法令義務與處理爭議所需期間內保存帳號、啟用與客服紀錄。',
                '當保存目的消失時，將在合理可行範圍內刪除或去識別化處理。',
              ],
            },
            {
              title: '7. 您的權利',
              items: [
                '您可依法請求查詢、閱覽、更正或刪除個人資料（受法令與服務必要限制）。',
                '您可透過聯絡信箱提出隱私相關請求，我們將在合理期間內回覆。',
              ],
            },
            {
              title: '8. 資訊安全',
              items: [
                '我們採取權限控管與角色限制機制，降低未經授權存取風險。',
                '網路傳輸仍有風險，請妥善保管您的帳號密碼。',
              ],
            },
            {
              title: '9. 政策更新',
              items: ['我們得視法令或營運需求更新本政策，並於本頁公告最新版本與更新日期。'],
            },
            {
              title: '10. 聯絡方式',
              items: ['Email：contact@bee-yuan.com'],
            },
          ],
        };

  return (
    <section className="pt-28 pb-20 px-6">
      <SEO
        title={lang === 'en' ? 'Privacy Policy | BeeYuan' : '隱私政策 | 蜂緣 BeeYuan'}
        description={
          lang === 'en'
            ? 'BeeYuan privacy policy for account, activation, support records, and cookie preferences.'
            : '蜂緣隱私政策，說明帳號、產品啟用、客服紀錄與 Cookie 偏好資料之處理方式。'
        }
        keywords={
          lang === 'en'
            ? 'BeeYuan privacy policy,data protection,cookie policy'
            : '蜂緣,隱私政策,個資保護,Cookie'
        }
      />
      <div className="max-w-4xl mx-auto rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 md:p-10 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-on-surface">{text.title}</h1>
        <p className="mt-2 text-sm text-secondary">{text.updated}</p>
        <p className="mt-1 text-sm text-secondary">
          {lang === 'en' ? 'Data Controller' : '資料控管者'}: {text.company}
        </p>
        <p className="mt-6 text-on-surface-variant leading-relaxed">{text.intro}</p>

        <div className="mt-8 space-y-7">
          {text.sections.map((section) => (
            <article key={section.title}>
              <h2 className="text-xl font-headline font-bold text-on-surface">{section.title}</h2>
              <ul className="mt-3 space-y-2 list-disc pl-5 text-on-surface-variant leading-relaxed">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
