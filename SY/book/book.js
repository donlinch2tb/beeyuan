document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('book.json');
        const data = await response.json();
        
        renderPages(data.pages);
        hideLoading();
    } catch (error) {
        console.error('載入失敗:', error);
        showError();
    }
});

function renderPages(pages) {
    const container = document.querySelector('.pages-list');
    
    container.innerHTML = pages.map(page => `
        <div class="page-card" onclick="window.location.href='${page.link}'">
            <div class="page-name">${page.name}</div>
            <div class="page-description">${page.description}</div>
        </div>
    `).join('');
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

function showError() {
    const container = document.querySelector('.pages-list');
    container.innerHTML = `
        <div style="text-align: center; padding: 50px; color: #e74c3c;">
            載入失敗，請重新整理頁面
        </div>
    `;
}