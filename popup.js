
// Gizli lisans anahtarı kaldırıldı
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('licenseButtons').style.display = 'none';
    document.getElementById('startProcess').style.display = 'block';
});

// Ücretsiz başlat (sınırsız unfollow)
document.getElementById('startProcess').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('twitter.com') && !tab.url.includes('x.com')) {
        document.getElementById('status').textContent = 'Bu eklenti sadece X/Twitter\'da çalışır!';
        return;
    }

    document.getElementById('startProcess').style.display = 'none';
    document.getElementById('stopProcess').style.display = 'block';
    document.getElementById('status').textContent = 'İşlem başladı...';

    chrome.tabs.sendMessage(tab.id, { 
        action: "startProcess",
        limit: null
    });
});

// Durdur
document.getElementById('stopProcess').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "stopProcess" });
    document.getElementById('startProcess').style.display = 'block';
    document.getElementById('stopProcess').style.display = 'none';
    document.getElementById('status').textContent = 
        `Takipten çıkarılan: ${document.getElementById('status').textContent.match(/\d+/) || 0}`;
});

// Status güncelleme
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPDATE_STATUS') {
        document.getElementById('status').textContent = 
            `Takipten çıkarılan: ${message.unfollowed}`;
    }
});