let isProcessing = false;
let unfollowedCount = 0;
let currentLimit = null;

async function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    });
}

async function unfollowUser(button) {
    try {
        button.click();
        await sleep(300);

        const confirmButton = document.querySelector('[data-testid="confirmationSheetConfirm"]');
        if (confirmButton) {
            confirmButton.click();
            unfollowedCount++;
            chrome.runtime.sendMessage({
                type: 'UPDATE_STATUS',
                unfollowed: unfollowedCount
            });
        }
        await sleep(500);
    } catch (error) {
        console.error('Unfollow error:', error);
    }
}

async function processUsers() {
    while (isProcessing) {
        try {
            const userCells = document.querySelectorAll('[data-testid="UserCell"]');

            for (const cell of userCells) {
                if (!isProcessing) break;
                if (cell.hasAttribute('processed')) continue;

                const followsYou = Array.from(cell.querySelectorAll('span'))
                    .some(span => span.textContent === 'Seni takip ediyor');

                const followingButton = cell.querySelector('[data-testid*="-unfollow"]');

                if (!followsYou && followingButton) {
                    await unfollowUser(followingButton);
                }

                cell.setAttribute('processed', 'true');
            }

            window.scrollBy(0, 500);
            await sleep(500);

        } catch (error) {
            console.error('Process error:', error);
            await sleep(300);
        }
    }
}

// Content script mesajlarını dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startProcess") {
        console.log('Starting process...', request);
        isProcessing = true;
        unfollowedCount = 0;
        currentLimit = request.limit;

        // İşlenmiş işaretlerini temizle
        document.querySelectorAll('[processed]')
            .forEach(el => el.removeAttribute('processed'));

        processUsers();
    }
    else if (request.action === "stopProcess") {
        console.log('Stopping process...');
        isProcessing = false;
    }
});

// Twitter'ın API script'ini enjekte et
const script = document.createElement('script');
script.type = 'text/javascript';
script.src = chrome.runtime.getURL('app.js');
document.documentElement.appendChild(script);