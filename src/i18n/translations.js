const translations = {
  zh: {
    nav: {
      brand: '蜂緣',
      home: '首頁',
      solutions: '解決方案',
      technology: '技術核心',
      esg: 'ESG 永續',
      about: '關於我們',
      contact: '聯繫我們',
    },
    hero: {
      badge: '智慧型生態虎頭蜂防治',
      title: '從致命危機到永續資源',
      subtitle: '智慧型生態虎頭蜂防治系統與循環經濟解決方案',
      cta1: '了解方案',
      cta2: '觀看簡介影片',
      stats: [
        { value: '85%', label: '捕獲率' },
        { value: '>10m', label: '安全距離' },
        { value: '<5%', label: '蜜蜂誤捕率' },
      ],
    },
    homeOverview: {
      sectionTitle: '快速了解',
      sectionSub: '先用 1 分鐘掌握兩大核心：防治方案與 ESG 循環價值。',
      cards: [
        {
          icon: 'precision_manufacturing',
          title: '解決方案',
          summary: '從痛點、技術流程到競爭優勢，完整說明如何降低風險並提升防治效率。',
          cta: '前往解決方案',
          to: '/solutions',
        },
        {
          icon: 'eco',
          title: 'ESG 與商業價值',
          summary: '了解循環經濟流程、市場規模與商業模式，掌握永續與獲利如何並行。',
          cta: '前往 ESG',
          to: '/esg',
        },
      ],
    },
    pain: {
      sectionTitle: '現況痛點',
      sectionSub: '台灣每年超過 20,000 件虎頭蜂通報案件，傳統防治方式面臨三大困境',
      cards: [
        {
          icon: 'personal_injury',
          title: '人員傷亡',
          desc: '傳統網捕與摘除作業帶有 50-70% 的蜂螫風險，每年相關意外約 150 起。',
          tags: ['高風險作業', '頻繁工傷'],
        },
        {
          icon: 'forest',
          title: '環境浩劫',
          desc: '高度依賴化學農藥 (Pesticides)，殘留毒素傷害非目標物種（如蜜蜂），破壞生態平衡。',
          tags: ['化學污染', '生態破壞'],
        },
        {
          icon: 'hourglass_empty',
          title: '被動無效',
          desc: '現行 SOP 為「通報後處理」，缺乏預防機制。學校與登山步道無法在事故發生前預警。',
          tags: ['無預防機制', '反應遲緩'],
        },
      ],
    },
    solution: {
      sectionTitle: '解決方案',
      sectionSub: '專利「習性誘捕」原型機',
      productTitle: '從「正面對決」轉向「兵力削減」',
      productDesc: '利用生物行為學，阻斷攻擊主力',
      features: [
        { title: '單向網罩', desc: '錐形設計 (10cm→2cm)，利用胡蜂回巢習性，只進不出。' },
        { title: '費洛蒙氣室', desc: '特製蜂蜜醋與蛋白誘餌，專一性誘引目標蜂種。' },
        { title: '伸縮支架', desc: '適應樹梢、屋簷等多地形作業，維持 >10m 安全距離。' },
      ],
      steps: [
        { num: '01', title: '佈署 Deploy', desc: '於蜂巢 5-10m 安全範圍設置誘捕器，零接觸作業。' },
        { num: '02', title: '削減 Deplete', desc: '3-5 天內誘捕 85% 的外勤警戒蜂與採集蜂。' },
        { num: '03', title: '清除 Clear', desc: '待防禦兵力削弱後，安全摘除巢穴。' },
        { num: '04', title: '轉化 Convert', desc: '收集的蜂體進入循環經濟鏈，轉製為有機液肥。' },
      ],
      compare: {
        title: '方案對比',
        headers: ['', '傳統網捕', '化學噴藥', '蜂緣系統'],
        rows: [
          ['效能', '捕獲率 70%', '致死率 100%', '系統效能 85%'],
          ['安全距離', '<5m (危險)', '-', '>10m (安全)'],
          ['環境影響', '-', '高環境污染', '零污染'],
        ],
      },
    },
    esg: {
      sectionTitle: 'ESG 循環經濟',
      sectionSub: '獨創「蜂體循環經濟」生態鏈 — 轉害為利',
      steps: [
        { num: '01', title: '無毒誘捕 Capture', desc: '零農藥，確保蜂體無毒。' },
        { num: '02', title: '回收與收集 Collect', desc: '安全回收生物質。' },
        { num: '03', title: '加工萃取 Process', desc: '萃取粗毒、甲殼素或氨基酸。' },
        { num: '04', title: '高價產品 Product', desc: '有機液肥（OC 45%）、土壤改良劑。' },
      ],
      metrics: [
        { icon: 'eco', title: 'Environment', desc: '100% 無農藥 (Net Zero)' },
        { icon: 'groups', title: 'Social', desc: '公共安全事故降低 80%' },
        { icon: 'account_balance', title: 'Governance', desc: '提供政府可稽核的數據報告' },
      ],
    },
    data: {
      sectionTitle: '市場規模',
      sectionSub: '隱藏的十億級藍海',
      stats: [
        { value: '10億', unit: 'USD', label: '全球每年虎頭蜂災害損失' },
        { value: '20,000+', unit: '件', label: '台灣年通報案件數' },
        { value: 'NT$2,500萬', unit: '/年', label: '桃園政府委外預算' },
        { value: 'NT$3億', unit: '', label: '潛在預防性市場規模' },
      ],
    },
    competitive: {
      sectionTitle: '競爭優勢',
      sectionSub: '數據與生態的雙重護城河',
      columns: [
        {
          name: '傳統塑膠桶/DIY',
          icon: 'delete',
          items: ['成本低', '效率極低', '無數據', '無回收'],
          highlight: false,
        },
        {
          name: '病媒防治業者 (噴藥)',
          icon: 'science',
          items: ['成本高', '高污染', '一次性服務', '無預防'],
          highlight: false,
        },
        {
          name: '蜂緣 BeeYuan',
          icon: 'precision_manufacturing',
          items: ['成本適中', '高效率 (50%捕獲)', '即時數據 (Real-time)', '資源回收 (Recycling)'],
          highlight: true,
        },
      ],
      usp: 'USP：唯一提供「量化安全數據」與「回收變現機制」的解決方案',
    },
    business: {
      sectionTitle: '商業模式',
      sectionSub: '多元營收與獲利機制',
      models: [
        { icon: 'hardware', title: '硬體銷售', desc: '銷售誘捕器給農戶與一般民眾。預估 NT$3,650/台。' },
        { icon: 'subscriptions', title: '訂閱服務', desc: '學校/政府「無蜂校園」維護合約。' },
        { icon: 'recycling', title: '回收加值', desc: '銷售生物液肥與甲殼素原料 (原料價 NT$100/kg)。' },
        { icon: 'map', title: '數據授權', desc: '銷售「虎頭蜂熱點地圖」給保險與政府單位。' },
      ],
    },
    team: {
      sectionTitle: '執行團隊',
      sectionSub: '實務專家與學術後盾',
      members: [
        {
          name: '林建宏',
          role: 'GM / Founder',
          desc: '11 年政府捕蜂實務經驗\n前農業局捕蜂大隊文書\n負責戰略與運營',
        },
        {
          name: '林亞臻',
          role: 'R&D / Tech',
          desc: '8 年產品設計經驗\n專精 3D 列印與機構設計\n負責產品迭代',
        },
      ],
      advisors: {
        title: '顧問與合作夥伴',
        items: ['國立中興大學昆蟲學系 (NCHU Dept. of Entomology)', '驗證生物習性數據與誘捕效率'],
      },
      orgSize: '團隊編制：營運 (4人) + 業務 (3人) + 技術 (2人)',
    },
    roadmap: {
      sectionTitle: '發展藍圖',
      sectionSub: '從桃園出發，佈局全台',
      cardBadge: 'Roadmap Vision',
      cardTitle: '以熱點預測與在地部署，建立可複製的安全防治網絡',
      cardIntro:
        '我們以桃園為示範核心，結合前線資料回傳、熱點地圖與跨區部署能力，逐步延伸到校園、社區與山林廊道，形成全台可追蹤、可驗證、可持續優化的防治體系。',
      mapStart: 'Taoyuan Pilot',
      mapEnd: 'Nationwide Rollout',
      mapAlt: 'BeeYuan roadmap map',
      phases: [
        {
          period: '2026 Q1-Q2',
          title: '驗證期',
          items: ['公司設立 (2026/02)', '進駐青創指揮部', 'SBIR Phase 1 申請', '田野測試 (50 巢)'],
        },
        {
          period: '2026 Q3-Q4',
          title: '市場進入',
          items: ['上架政府共同供應契約', '50 所校園示範計畫', '取得 ESG 認證'],
        },
        {
          period: '2027',
          title: '規模擴張',
          items: ['建立自動化回收產線', '擴展至新北/台中', '開發家用消費版產品'],
        },
      ],
      revenue: {
        title: '營收預測',
        years: [
          { year: '2026', revenue: 'NT$1,200 萬' },
          { year: '2027', revenue: 'NT$3,200 萬' },
          { year: '2028', revenue: 'NT$5,000 萬' },
        ],
      },
    },
    footer: {
      brand: '蜂緣 BeeYuan',
      tagline: '智慧型生態虎頭蜂防治系統，以安全預防、數據驅動、ESG 永續為核心。',
      ecosystem: '生態系統',
      ecosystemLinks: ['解決方案', '技術核心', '環境影響報告'],
      legal: '法律聲明',
      legalLinks: ['隱私政策', '服務條款'],
      cookieSettings: 'Cookie 設定',
      contact: '聯繫我們',
      email: 'contact@bee-yuan.com',
      line: '@BeeYuan',
      domain: 'bee-yuan.com',
      copyright: '© 2026 蜂緣有限公司. 智慧型生態虎頭蜂防治系統.',
    },
    cookie: {
      badge: '隱私偏好',
      title: '我們僅在您同意後啟用分析與行銷 Cookie',
      description:
        '必要 Cookie 用於網站正常運作。分析與行銷 Cookie 將在您同意後才啟用，您可隨時於「Cookie 設定」更改。',
      panelTitle: 'Cookie 偏好設定',
      panelDescription: '您可以細分偏好。拒絕不會影響網站基本功能，且可隨時重新調整。',
      alwaysOn: '必要',
      currentChoice: '目前選擇',
      status: {
        unset: '尚未設定',
        all: '已接受全部',
        necessary: '僅必要 Cookie',
        custom: '自訂偏好',
      },
      categories: {
        necessary: {
          title: '必要 Cookie',
          desc: '用於安全、語系、基本互動等核心功能，無法關閉。',
        },
        analytics: {
          title: '分析 Cookie',
          desc: '協助了解流量與使用行為，用於優化體驗。',
        },
        marketing: {
          title: '行銷 Cookie',
          desc: '用於投放與衡量廣告成效，建立更相關的內容推薦。',
        },
      },
      actions: {
        acceptAll: '接受全部',
        rejectAll: '拒絕全部',
        customize: '自訂偏好',
        save: '儲存設定',
        close: '關閉',
      },
    },
  },
  en: {
    nav: {
      brand: 'BeeYuan',
      home: 'Home',
      solutions: 'Solutions',
      technology: 'Technology',
      esg: 'ESG',
      about: 'About',
      contact: 'Contact',
    },
    hero: {
      badge: 'SMART ECO HORNET DEFENSE',
      title: 'FROM DEADLY THREAT TO SUSTAINABLE RESOURCE',
      subtitle: 'Intelligent Ecological Hornet Defense System & Circular Economy Solution',
      cta1: 'Explore Solutions',
      cta2: 'Watch Demo',
      stats: [
        { value: '85%', label: 'Capture Rate' },
        { value: '>10m', label: 'Safe Distance' },
        { value: '<5%', label: 'Bee By-catch' },
      ],
    },
    homeOverview: {
      sectionTitle: 'Quick Overview',
      sectionSub: 'Understand the two core pillars in one minute: solution execution and ESG-driven value.',
      cards: [
        {
          icon: 'precision_manufacturing',
          title: 'Solutions',
          summary: 'Review pain points, implementation flow, and competitive edge to see how risk is reduced.',
          cta: 'Go to Solutions',
          to: '/solutions',
        },
        {
          icon: 'eco',
          title: 'ESG & Business Value',
          summary: 'Explore circular economy flow, market data, and business model to see sustainability at work.',
          cta: 'Go to ESG',
          to: '/esg',
        },
      ],
    },
    pain: {
      sectionTitle: 'Current Pain Points',
      sectionSub: 'Over 20,000 hornet incidents reported annually in Taiwan. Traditional methods face three major challenges.',
      cards: [
        {
          icon: 'personal_injury',
          title: 'Human Casualties',
          desc: 'Traditional net capture carries 50-70% sting risk, causing ~150 workplace accidents annually.',
          tags: ['High Risk', 'Frequent Injuries'],
        },
        {
          icon: 'forest',
          title: 'Environmental Damage',
          desc: 'Heavy reliance on chemical pesticides, leaving toxic residues that harm non-target species like honeybees.',
          tags: ['Chemical Pollution', 'Ecosystem Damage'],
        },
        {
          icon: 'hourglass_empty',
          title: 'Passive & Ineffective',
          desc: 'Current SOP is "respond after report" — no prevention. Schools and trails cannot receive pre-incident alerts.',
          tags: ['No Prevention', 'Slow Response'],
        },
      ],
    },
    solution: {
      sectionTitle: 'Our Solution',
      sectionSub: 'Patented "Behavioral Trapping" Prototype',
      productTitle: 'From Confrontation to Attrition',
      productDesc: 'Using behavioral biology to neutralize the threat',
      features: [
        { title: 'One-way Entrance', desc: 'Funnel design (10cm→2cm) exploits homing instinct — hornets enter but cannot exit.' },
        { title: 'Pheromone Chamber', desc: 'Custom honey vinegar & protein bait specifically lures target hornet species.' },
        { title: 'Telescopic Stand', desc: 'Adapts to treetops, eaves & varied terrain, maintaining >10m safe distance.' },
      ],
      steps: [
        { num: '01', title: 'Deploy', desc: 'Place traps 5-10m from nest in safe perimeter. Zero-contact operation.' },
        { num: '02', title: 'Deplete', desc: 'Capture 85% of forager and guard hornets within 3-5 days.' },
        { num: '03', title: 'Clear', desc: 'Safely remove weakened nest after defense forces are depleted.' },
        { num: '04', title: 'Convert', desc: 'Collected biomass enters circular economy chain for organic fertilizer.' },
      ],
      compare: {
        title: 'Method Comparison',
        headers: ['', 'Net Capture', 'Chemical Spray', 'BeeYuan System'],
        rows: [
          ['Effectiveness', '70% capture', '100% kill rate', '85% system efficiency'],
          ['Safe Distance', '<5m (Danger)', '-', '>10m (Safe)'],
          ['Environmental', '-', 'High pollution', 'Zero pollution'],
        ],
      },
    },
    esg: {
      sectionTitle: 'ESG & Circular Economy',
      sectionSub: 'Pioneering "Hornet Biomass Circular Economy" — Turning Hazard into Resource',
      steps: [
        { num: '01', title: 'Non-toxic Capture', desc: 'Zero pesticides, ensuring clean biomass.' },
        { num: '02', title: 'Collect & Recover', desc: 'Safe biological material recovery.' },
        { num: '03', title: 'Process & Extract', desc: 'Extract crude venom, chitin, or amino acids.' },
        { num: '04', title: 'Premium Products', desc: 'Organic liquid fertilizer (OC 45%), soil amendments.' },
      ],
      metrics: [
        { icon: 'eco', title: 'Environment', desc: '100% Pesticide-free (Net Zero)' },
        { icon: 'groups', title: 'Social', desc: '80% Reduction in Public Safety Incidents' },
        { icon: 'account_balance', title: 'Governance', desc: 'Auditable Data Reports for Government' },
      ],
    },
    data: {
      sectionTitle: 'Market Opportunity',
      sectionSub: 'A Hidden Billion-Dollar Blue Ocean',
      stats: [
        { value: '$1B', unit: 'USD', label: 'Annual Global Hornet Damage' },
        { value: '20,000+', unit: 'cases', label: 'Annual Cases in Taiwan' },
        { value: 'NT$25M', unit: '/year', label: 'Taoyuan Gov. Budget' },
        { value: 'NT$300M', unit: '', label: 'Preventive Market Potential' },
      ],
    },
    competitive: {
      sectionTitle: 'Competitive Edge',
      sectionSub: 'A dual moat of data and ecology',
      columns: [
        {
          name: 'DIY Plastic Bucket',
          icon: 'delete',
          items: ['Low cost', 'Very low efficiency', 'No data', 'No recycling'],
          highlight: false,
        },
        {
          name: 'Pest Control (Spray)',
          icon: 'science',
          items: ['High cost', 'High pollution', 'One-time service', 'No prevention'],
          highlight: false,
        },
        {
          name: 'BeeYuan System',
          icon: 'precision_manufacturing',
          items: ['Moderate cost', 'High efficiency (50%+)', 'Real-time data', 'Resource recycling'],
          highlight: true,
        },
      ],
      usp: 'USP: The only solution offering "quantified safety data" and "recycling monetization."',
    },
    business: {
      sectionTitle: 'Business Model',
      sectionSub: 'Multiple Revenue Streams',
      models: [
        { icon: 'hardware', title: 'Hardware Sales', desc: 'Sell traps to farmers & consumers. Est. NT$3,650/unit.' },
        { icon: 'subscriptions', title: 'SaaS/Service', desc: 'School/Gov "Hornet-free Campus" maintenance contracts.' },
        { icon: 'recycling', title: 'Recycling Value', desc: 'Bio-fertilizer & chitin raw materials (NT$100/kg).' },
        { icon: 'map', title: 'Data Licensing', desc: 'Hornet hotspot maps for insurers & government.' },
      ],
    },
    team: {
      sectionTitle: 'Our Team',
      sectionSub: 'Field Experts & Academic Partners',
      members: [
        {
          name: 'Lin Jianhong',
          role: 'GM / Founder',
          desc: '11 years government hornet response\nFormer Agriculture Bureau team lead\nStrategy & operations',
        },
        {
          name: 'Lin Yazhen',
          role: 'R&D / Tech',
          desc: '8 years product design\nSpecializes in 3D printing & mechanical design\nProduct iteration lead',
        },
      ],
      advisors: {
        title: 'Advisors & Partners',
        items: ['NCHU Dept. of Entomology', 'Verifying behavioral data & trap efficiency'],
      },
      orgSize: 'Team: Operations (4) + Sales (3) + Tech (2)',
    },
    roadmap: {
      sectionTitle: 'Roadmap',
      sectionSub: 'Starting from Taoyuan, Scaling Nationwide',
      cardBadge: 'Roadmap Vision',
      cardTitle: 'Building a repeatable safety network with hotspot intelligence and local execution',
      cardIntro:
        'Starting with Taoyuan as the pilot core, we combine frontline data feedback, hotspot mapping, and regional deployment to expand across campuses, communities, and mountain corridors with a trackable and continuously optimized defense model.',
      mapStart: 'Taoyuan Pilot',
      mapEnd: 'Nationwide Rollout',
      mapAlt: 'BeeYuan roadmap map',
      phases: [
        {
          period: '2026 Q1-Q2',
          title: 'Validation',
          items: ['Company registration (2026/02)', 'Join Youth Startup Hub', 'SBIR Phase 1 application', 'Field testing (50 nests)'],
        },
        {
          period: '2026 Q3-Q4',
          title: 'Market Entry',
          items: ['Gov procurement platform listing', '50-school pilot program', 'ESG certification'],
        },
        {
          period: '2027',
          title: 'Scale Up',
          items: ['Automated recycling line', 'Expand to New Taipei/Taichung', 'Consumer-grade product'],
        },
      ],
      revenue: {
        title: 'Revenue Forecast',
        years: [
          { year: '2026', revenue: 'NT$12M' },
          { year: '2027', revenue: 'NT$32M' },
          { year: '2028', revenue: 'NT$50M' },
        ],
      },
    },
    footer: {
      brand: 'BeeYuan',
      tagline: 'Intelligent ecological hornet defense system — safety-first, data-driven, ESG-aligned.',
      ecosystem: 'Ecosystem',
      ecosystemLinks: ['Solutions', 'Technology', 'Impact Report'],
      legal: 'Legal',
      legalLinks: ['Privacy Policy', 'Terms of Service'],
      cookieSettings: 'Cookie Settings',
      contact: 'Contact Us',
      email: 'contact@bee-yuan.com',
      line: '@BeeYuan',
      domain: 'bee-yuan.com',
      copyright: '© 2026 BeeYuan Co., Ltd. Smart Ecological Hornet Defense.',
    },
    cookie: {
      badge: 'Privacy Controls',
      title: 'Analytics and marketing cookies run only after your consent',
      description:
        'Essential cookies keep the site running. Analytics and marketing cookies are disabled until you allow them, and you can change this anytime in Cookie Settings.',
      panelTitle: 'Cookie Preferences',
      panelDescription: 'Choose by category. Rejecting optional cookies will not affect core website functionality.',
      alwaysOn: 'Required',
      currentChoice: 'Current choice',
      status: {
        unset: 'Not set yet',
        all: 'Accept all',
        necessary: 'Essential only',
        custom: 'Custom preferences',
      },
      categories: {
        necessary: {
          title: 'Essential Cookies',
          desc: 'Required for security, language, and core site functionality. Always enabled.',
        },
        analytics: {
          title: 'Analytics Cookies',
          desc: 'Help us understand traffic and usage patterns to improve the product experience.',
        },
        marketing: {
          title: 'Marketing Cookies',
          desc: 'Used to measure campaign performance and show more relevant messages.',
        },
      },
      actions: {
        acceptAll: 'Accept all',
        rejectAll: 'Reject all',
        customize: 'Customize',
        save: 'Save preferences',
        close: 'Close',
      },
    },
  },
};

export default translations;
