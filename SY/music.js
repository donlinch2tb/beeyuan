// 音樂藝人資料庫 (從外部 JSON 檔案載入)
let musicData = { artists: [] };

// DOM 元素
const artistsGrid = document.getElementById('artistsGrid');
const musicLoading = document.getElementById('musicLoading');

// 載入藝人資料
async function loadArtists() {
    try {
        const response = await fetch('music.json');
        if (!response.ok) {
            throw new Error('無法載入藝人資料');
        }
        musicData = await response.json();
        return musicData.artists;
    } catch (error) {
        console.error('載入藝人資料失敗:', error);
        // 如果載入失敗，顯示錯誤訊息
        artistsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #e74c3c;">
                <p>⚠️ 載入藝人資料失敗</p>
                <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">請檢查 music.json 檔案是否存在</p>
            </div>
        `;
        return [];
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 載入藝人資料
    const artists = await loadArtists();
    
    // 隱藏載入畫面並顯示藝人
    musicLoading.classList.add('hidden');
    if (artists.length > 0) {
        renderArtists(artists);
    }
});

// 渲染藝人卡片
function renderArtists(artists) {
    if (artists.length === 0) {
        artistsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #666;">
                <p>目前沒有藝人資料可顯示</p>
            </div>
        `;
        return;
    }
    
    artistsGrid.innerHTML = artists.map(artist => `
        <div class="artist-card" data-id="${artist.id}" data-link="${artist.link || '/'}">
            <div class="artist-image">
                ${getArtistImage(artist.image)}
            </div>
            <div class="artist-info">
                <h3 class="artist-name">${artist.name}</h3>
            </div>
            <div class="artist-link-indicator">
                <span>點擊聆聽音樂 →</span>
            </div>
        </div>
    `).join('');
    
    // 綁定藝人卡片點擊事件
    bindArtistClickEvents();
}

// 獲取藝人圖片
function getArtistImage(imagePath) {
    const sanitizedPath = sanitizeImagePath(imagePath);
    return `<img src="${sanitizedPath}" alt="藝人圖片" onerror="this.style.display='none'; this.parentNode.innerHTML='🎤'" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">`;
}

// 圖片路徑安全驗證
function sanitizeImagePath(path) {
    if (!path || typeof path !== 'string') {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn46kPC90ZXh0Pjwvc3ZnPg==';
    }
    
    // 移除潛在的危險字符
    const cleaned = path.replace(/[<>'"]/g, '');
    
    // 檢查是否為有效的 URL 或相對路徑
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('images/') || cleaned.startsWith('data:')) {
        return cleaned;
    }
    
    // 如果不是有效路徑，返回預設圖片
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wf46kPC90ZXh0Pjwvc3ZnPg==';
}

// 綁定藝人卡片點擊事件
function bindArtistClickEvents() {
    // 移除舊的事件監聽器（如果存在）
    artistsGrid.removeEventListener('click', handleArtistGridClick);
    // 添加新的事件監聽器
    artistsGrid.addEventListener('click', handleArtistGridClick);
}

// 處理藝人網格點擊事件
function handleArtistGridClick(event) {
    // 找到被點擊的藝人卡片
    const artistCard = event.target.closest('.artist-card');
    if (!artistCard) return;
    
    const link = artistCard.dataset.link;
    console.log('點擊藝人，連結:', link);
    
    if (link && link !== '/') {
        // 驗證連結安全性
        if (isValidUrl(link)) {
            console.log('連結驗證通過，正在跳轉...');
            window.location.href = link;
        } else {
            console.warn('不安全的連結被阻止:', link);
            alert('抱歉，此連結暫時無法使用，請稍後再試。');
        }
    } else {
        console.log('藝人點擊，但沒有設定連結');
    }
}

// URL 安全驗證
function isValidUrl(url) {
    // 允許的域名白名單
    const allowedDomains = [
        'music.youtube.com',
        'youtube.com',
        'www.youtube.com',
        'spotify.com',
        'open.spotify.com'
    ];
    
    try {
        const urlObj = new URL(url);
        
        // 只允許 https 協議
        if (urlObj.protocol !== 'https:') {
            console.warn('只允許 HTTPS 連結:', url);
            return false;
        }
        
        // 檢查域名是否在白名單中
        const isAllowedDomain = allowedDomains.some(domain => 
            urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
        );
        
        if (!isAllowedDomain) {
            console.warn('域名不在允許清單中:', urlObj.hostname);
            return false;
        }
        
        return true;
    } catch (e) {
        console.warn('無效的 URL 格式:', url);
        return false;
    }
}

// 導出資料供其他用途使用
window.musicData = musicData;