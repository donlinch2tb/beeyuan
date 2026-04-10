// 最終安全版 index.js (已修正白名單錯誤)

let productsData = { products: [] };
const productsGrid = document.getElementById('productsGrid');
const loading = document.getElementById('loading');
let currentCategory = 'all';

// --- 安全核心：可信賴的外部連結來源白名單 ---
 const TRUSTED_ORIGINS = [
    'sunnyyummy.cashier.ecpay.com.tw',
    'store.line.me',
    'line.me',
    'www.miiloyoung.com'
];

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', async () => {
    // 確保 DOM 元素存在
    if (!productsGrid || !loading) {
        console.error("缺少必要的 DOM 元素 (productsGrid 或 loading)");
        return;
    }
    const products = await loadProducts();
    loading.classList.add('hidden');

    if (products && products.length > 0) {
        generateNavButtons(products);
        renderProducts(products); // 渲染並自動綁定事件
    }
});

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('無法載入商品資料');
        productsData = await response.json();
        return productsData.products;
    } catch (error) {
        console.error('載入商品資料失敗:', error);
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #e74c3c;">
                <p>⚠️ 載入商品資料失敗</p>
                <p style="font-size: 0.9rem; color: #666;">請檢查 products.json 檔案是否存在。</p>
            </div>`;
        return [];
    }
}

// --- 渲染和事件綁定 ---

// **【最終安全渲染函式】**
function renderProducts(products) {
    productsGrid.innerHTML = ''; // 清空舊內容

    if (products.length === 0) {
        productsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #666;">目前沒有商品可顯示</div>`;
        return;
    }

    const fragment = document.createDocumentFragment(); // 使用文檔碎片以提高性能
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        card.dataset.link = product.link || '/'; // 將連結存在 dataset 中

        // 圖片區塊
        const imageDiv = document.createElement('div');
        imageDiv.className = 'product-image';
        imageDiv.innerHTML = `
            ${getProductImageHTML(product.image)}
            <span class="product-category">${getCategoryName(product.category)}</span>
            ${getCountdownBadge(product.displayTime)}`;

        // 商品資訊區塊 - 【安全核心】
        const infoDiv = document.createElement('div');
        infoDiv.className = 'product-info';

        const nameH3 = document.createElement('h3');
        nameH3.className = 'product-name';
        nameH3.textContent = product.name; // <-- 安全！

        const priceDiv = document.createElement('div');
        priceDiv.className = 'product-price';
        priceDiv.textContent = `NT$ ${product.price.toLocaleString()}`; // <-- 安全！

        const descP = document.createElement('p');
        descP.className = 'product-description';
        descP.textContent = product.description; // <-- 安全！

        infoDiv.append(nameH3, priceDiv, descP);

        // 底部指示器
        const linkIndicatorDiv = document.createElement('div');
        linkIndicatorDiv.className = 'product-link-indicator';
        linkIndicatorDiv.innerHTML = getBottomIndicator(product.displayTime);

        card.append(imageDiv, infoDiv, linkIndicatorDiv);
        fragment.appendChild(card);
    });

    productsGrid.appendChild(fragment); // 一次性插入所有卡片
}

// **【事件委託處理】**
productsGrid.addEventListener('click', (event) => {
    const productCard = event.target.closest('.product-card');
    if (!productCard) return;

    const link = productCard.dataset.link;
    if (!link || link === '/') {
        console.log('商品點擊，但沒有設定連結');
        return;
    }
    
    // **【安全連結驗證】**
    if (isUrlTrusted(link)) {
        window.location.href = link;
    } else {
        console.warn('已阻止不安全的跳轉:', link);
        // 可選：給用戶一個提示
        // alert('此連結來源不受信任，已阻止跳轉。');
    }
});


function isUrlTrusted(url) {
    // 允許內部相對路徑
    if (url.startsWith('/') && !url.startsWith('//')) {
        return true;
    }
    try {
        const urlObj = new URL(url);
        // 只允許 https
        if (urlObj.protocol !== 'https:') return false;
        // 檢查域名是否在白名單中
        return TRUSTED_ORIGINS.includes(urlObj.hostname);
    } catch (e) {
        return false; // 無效的 URL 格式
    }
}


// --- 動態導航按鈕 ---
function generateNavButtons(products) {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    const categories = ['all', ...new Set(products.map(p => p.category))];
    navMenu.innerHTML = '';

    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.dataset.category = category;
        btn.textContent = category === 'all' ? '全部' : getCategoryName(category);
        if (category === currentCategory) btn.classList.add('active');
        navMenu.appendChild(btn);
    });
    bindNavEvents();
}

function bindNavEvents() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    navMenu.addEventListener('click', (event) => {
        const target = event.target.closest('.nav-btn');
        if (!target) return;

        // 更新按鈕樣式
        navMenu.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        target.classList.add('active');
        
        currentCategory = target.dataset.category;
        filterAndRenderProducts();
    });
}

function filterAndRenderProducts() {
    const filtered = currentCategory === 'all'
        ? productsData.products
        : productsData.products.filter(p => p.category === currentCategory);
    renderProducts(filtered);
}


// --- 輔助函式 ---
function getCategoryName(category) {
    const categoryNames = { 'merchandise': '週邊', 'line': '貼圖', 'group-buy': '團購', 'clothes': '衣服' };
    return categoryNames[category] || category;
}

function getProductImageHTML(imagePath) {
    // 這裡的 onerror 內聯腳本是安全的，因為它不包含任何來自外部的數據
    return `<img src="${imagePath}" alt="商品圖片" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentNode.insertAdjacentHTML('beforeend', '<span style=\\'font-size:3rem; color:#ccc;\\'>🎵</span>');">`;
}

function getCountdownBadge(displayTime) {
    if (!displayTime || !displayTime.trim()) return '';
    try {
        const [_, endDateStr] = displayTime.split(' to ');
        if (!endDateStr) return '';
        const endDate = new Date(endDateStr.trim());
        endDate.setHours(23, 59, 59, 999);
        const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return '<span class="countdown-badge expired">已結束</span>';
        if (daysLeft === 0) return '<span class="countdown-badge today">今天結束</span>';
        if (daysLeft <= 3) return `<span class="countdown-badge urgent">還有 ${daysLeft} 天</span>`;
        if (daysLeft <= 7) return `<span class="countdown-badge warning">還有 ${daysLeft} 天</span>`;
        return `<span class="countdown-badge normal">還有 ${daysLeft} 天</span>`;
    } catch (e) { return ''; }
}

function getBottomIndicator(displayTime) {
    if (!displayTime || !displayTime.trim()) return '<span>點擊查看詳情 →</span>';
    try {
        const [start, end] = displayTime.split(' to ').map(s => s.trim());
        const formatDate = (d) => new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
        return `<span class="date-range">📅 ${formatDate(start)} - ${formatDate(end)}</span>`;
    } catch (e) { return '<span>點擊查看詳情 →</span>'; }
}