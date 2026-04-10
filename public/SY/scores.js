// 樂譜資料庫 (從外部 JSON 檔案載入)
let scoresData = { scores: [] };

// DOM 元素
const scoresGrid = document.getElementById('scoresGrid');
const scoresLoading = document.getElementById('scoresLoading');
const artistFilter = document.getElementById('artistFilter');

// 當前選中的歌手
let currentArtist = 'all';

// 載入樂譜資料
async function loadScores() {
    try {
        const response = await fetch('scores.json');
        if (!response.ok) {
            throw new Error('無法載入樂譜資料');
        }
        scoresData = await response.json();
        return scoresData.scores;
    } catch (error) {
        console.error('載入樂譜資料失敗:', error);
        // 如果載入失敗，顯示錯誤訊息
        scoresGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #e74c3c;">
                <p>⚠️ 載入樂譜資料失敗</p>
                <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">請檢查 scores.json 檔案是否存在</p>
            </div>
        `;
        return [];
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 載入樂譜資料
    const scores = await loadScores();
    
    // 隱藏載入畫面並顯示樂譜
    scoresLoading.classList.add('hidden');
    if (scores.length > 0) {
        // 生成歌手分類按鈕
        generateArtistFilter(scores);
        // 渲染樂譜
        renderScores(scores);
    }
});

// 渲染樂譜列表
function renderScores(scores) {
    if (scores.length === 0) {
        scoresGrid.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>目前沒有樂譜資料可顯示</p>
            </div>
        `;
        return;
    }
    
    // 根據當前選中的歌手過濾樂譜
    let filteredScores = scores;
    if (currentArtist !== 'all') {
        filteredScores = scores.filter(score => {
            if (Array.isArray(score.artist)) {
                // 如果是陣列，檢查是否包含選中的歌手
                return score.artist.includes(currentArtist);
            } else {
                // 如果是字串，直接比較
                return score.artist === currentArtist;
            }
        });
    }
    
    scoresGrid.innerHTML = filteredScores.map(score => `
        <div class="score-item" data-id="${score.id}">
            <div class="score-image">
                ${getScoreImage(score.image)}
            </div>
            <div class="score-content">
                <div class="score-info">
                    <div class="score-artist">${Array.isArray(score.artist) ? score.artist.join(', ') : score.artist}</div>
                    <h3 class="score-song-name">${score.songName}</h3>
                </div>
                <div class="score-links">
                    ${score.scoreLinks.map(link => `
                        <a href="${link.url}" class="score-link">
                            ${link.name}
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// 獲取樂譜圖片
function getScoreImage(imagePath) {
    const sanitizedPath = sanitizeImagePath(imagePath);
    return `<img src="${sanitizedPath}" alt="樂譜圖片" onerror="this.style.display='none'; this.parentNode.innerHTML='🎼'" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">`;
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

// 生成歌手分類按鈕
function generateArtistFilter(scores) {
    // 獲取所有唯一的歌手（處理陣列格式）
    const artistsSet = new Set();
    scores.forEach(score => {
        if (Array.isArray(score.artist)) {
            // 如果是陣列，添加每個歌手
            score.artist.forEach(artist => artistsSet.add(artist));
        } else {
            // 如果是字串，直接添加
            artistsSet.add(score.artist);
        }
    });
    const artists = [...artistsSet];
    
    // 清空現有按鈕
    artistFilter.innerHTML = '';
    
    // 添加「全部」按鈕
    const allBtn = document.createElement('button');
    allBtn.className = 'nav-btn active';
    allBtn.dataset.artist = 'all';
    allBtn.textContent = '全部';
    artistFilter.appendChild(allBtn);
    
    // 添加各歌手按鈕
    artists.forEach(artist => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.dataset.artist = artist;
        btn.textContent = artist;
        artistFilter.appendChild(btn);
    });
    
    // 綁定點擊事件
    bindFilterEvents();
}

// 綁定分類按鈕事件
function bindFilterEvents() {
    const filterButtons = document.querySelectorAll('.nav-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 更新按鈕狀態
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新當前歌手
            currentArtist = this.dataset.artist;
            
            // 重新渲染樂譜
            renderScores(scoresData.scores);
        });
    });
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
window.scoresData = scoresData;