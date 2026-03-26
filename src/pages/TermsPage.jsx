import { useI18n } from '../i18n/useI18n';
import SEO from '../components/SEO';

export default function TermsPage() {
  const { lang } = useI18n();

  const text =
    lang === 'en'
      ? {
          title: 'Terms of Service',
          updated: 'Last updated: March 26, 2026',
          company: 'BeeYuan Co., Ltd.',
          intro:
            'These Terms of Service ("Terms") govern your use of BeeYuan website, member center, and product activation services. By accessing or using the services, you agree to be bound by these Terms.',
          sections: [
            {
              title: '1. Service Scope',
              items: [
                'Public website browsing and information access.',
                'Member account registration/login and profile management.',
                'Product activation, ownership binding, and support processing for eligible products.',
              ],
            },
            {
              title: '2. Account Responsibilities',
              items: [
                'You are responsible for account credentials and activities under your account.',
                'You must provide accurate information and update it when changed.',
                'You must not impersonate others or create unauthorized admin access.',
              ],
            },
            {
              title: '3. Activation Code and Ownership Rules',
              items: [
                'Activation code is intended for legitimate product activation only.',
                'After successful redemption, product ownership is bound to the account.',
                'Transferred/revoked/reissued ownership is handled by authorized support/admin workflow.',
                'Repeated invalid redemption attempts may trigger temporary restrictions.',
              ],
            },
            {
              title: '4. Prohibited Conduct',
              items: [
                'No unauthorized access, reverse engineering, automated abuse, or security probing.',
                'No interference with service operation, data integrity, or access controls.',
                'No misuse of support process with false information.',
              ],
            },
            {
              title: '5. Intellectual Property',
              items: [
                'Unless otherwise stated, website content, marks, visual assets, and service materials are owned by or licensed to BeeYuan.',
                'You may not reproduce, distribute, modify, or use such materials beyond lawful and authorized use.',
              ],
            },
            {
              title: '6. Service Changes and Availability',
              items: [
                'We may update, suspend, or discontinue parts of the service for maintenance, security, legal, or operational reasons.',
                'We may revise these terms and publish updated versions on this website.',
              ],
            },
            {
              title: '7. Disclaimer and Liability',
              items: [
                'Service is provided on an "as available" basis.',
                'To the maximum extent permitted by law, BeeYuan is not liable for indirect, incidental, or consequential damages.',
              ],
            },
            {
              title: '8. Governing Law and Jurisdiction',
              items: [
                'These Terms are governed by the laws of the Republic of China (Taiwan).',
                'Unless otherwise required by mandatory law, the Taiwan Taoyuan District Court shall be the court of first instance for disputes arising from these Terms.',
              ],
            },
            {
              title: '9. Contact',
              items: ['Email: contact@bee-yuan.com'],
            },
          ],
        }
      : {
          title: '服務條款',
          updated: '最後更新日期：2026 年 3 月 26 日',
          company: '蜂緣有限公司',
          intro:
            '本服務條款（以下稱「本條款」）適用於您使用蜂緣網站、會員中心與產品啟用相關服務。您存取或使用本服務，即視為已閱讀、瞭解並同意受本條款拘束。',
          sections: [
            {
              title: '1. 服務範圍',
              items: [
                '公開網站內容瀏覽與資訊查閱。',
                '會員帳號註冊／登入與會員資料管理。',
                '適用產品之啟用、所有權綁定與售後客服處理。',
              ],
            },
            {
              title: '2. 帳號責任',
              items: [
                '您應妥善保管帳號密碼，並對帳號下之行為負責。',
                '您提供的資料應保持正確且即時更新。',
                '不得冒用他人身分或嘗試取得未授權管理權限。',
              ],
            },
            {
              title: '3. 啟用碼與綁定規則',
              items: [
                '啟用碼僅供合法產品啟用用途。',
                '啟用成功後，產品會綁定至該會員帳號。',
                '若需轉移、作廢或重發，須由授權客服／管理流程處理。',
                '若短時間內多次輸入無效啟用碼，系統可能暫時限制操作。',
              ],
            },
            {
              title: '4. 禁止行為',
              items: [
                '禁止未授權存取、逆向工程、自動化濫用或安全性探測。',
                '禁止干擾服務運作、資料完整性或權限控管。',
                '禁止於客服流程中提供不實資訊。',
              ],
            },
            {
              title: '5. 智慧財產權',
              items: [
                '除另有說明外，本網站內容、商標、視覺素材與服務資料之權利均屬蜂緣所有或經合法授權。',
                '未經授權，不得重製、散布、改作或作超出法令允許範圍之使用。',
              ],
            },
            {
              title: '6. 服務調整與可用性',
              items: [
                '基於維護、安全、法令或營運需求，我們得調整、暫停或終止部分服務。',
                '我們得更新本條款，更新版本將公告於網站。',
              ],
            },
            {
              title: '7. 免責與責任限制',
              items: [
                '服務依「現況可用」提供。',
                '在法律允許範圍內，蜂緣不對間接性、附帶性或衍生性損害負責。',
              ],
            },
            {
              title: '8. 準據法與管轄',
              items: [
                '本條款以中華民國（臺灣）法律為準據法。',
                '除法律另有強制規定外，因本條款所生爭議以臺灣桃園地方法院為第一審管轄法院。',
              ],
            },
            {
              title: '9. 聯絡方式',
              items: ['Email：contact@bee-yuan.com'],
            },
          ],
        };

  return (
    <section className="pt-28 pb-20 px-6">
      <SEO
        title={lang === 'en' ? 'Terms of Service | BeeYuan' : '服務條款 | 蜂緣 BeeYuan'}
        description={
          lang === 'en'
            ? 'BeeYuan terms of service for accounts, activation codes, and support operations.'
            : '蜂緣服務條款，說明會員帳號、啟用碼與客服流程使用規範。'
        }
        keywords={
          lang === 'en'
            ? 'BeeYuan terms of service,activation rules,account terms'
            : '蜂緣,服務條款,啟用碼條款,會員條款'
        }
      />
      <div className="max-w-4xl mx-auto rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 md:p-10 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-on-surface">{text.title}</h1>
        <p className="mt-2 text-sm text-secondary">{text.updated}</p>
        <p className="mt-1 text-sm text-secondary">
          {lang === 'en' ? 'Service Provider' : '服務提供者'}: {text.company}
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
