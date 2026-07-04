import { initYoutube } from './modules/youtube.js';
import { initMedia } from './modules/media.js';
import { initQR } from './modules/qr.js';
import { initRoulette } from './modules/roulette.js';

document.addEventListener('DOMContentLoaded', () => {
    // 画面遷移の管理
    const views = document.querySelectorAll('.view');
    const cards = document.querySelectorAll('.card');
    const btnBack = document.getElementById('btn-back');
    const siteTitle = document.getElementById('site-title');

    function showView(viewId) {
        views.forEach(v => v.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
        if (viewId === 'view-home') {
            btnBack.classList.add('hidden');
        } else {
            btnBack.classList.remove('hidden');
        }
    }

    cards.forEach(card => {
        card.addEventListener('click', () => {
            showView(card.dataset.target);
        });
    });

    btnBack.addEventListener('click', () => showView('view-home'));
    siteTitle.addEventListener('click', () => showView('view-home'));

    // ダークモード切り替え
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️ ライトモード' : '🌙 ダークモード';
    });

    // 各モジュールの初期化
    initYoutube();
    initMedia();
    initQR();
    initRoulette();
});

// 共通トースト通知（エラー・成功メッセージ共通）
export function showToast(message, isError = false) {
    const toast = document.getElementById('error-toast');
    toast.textContent = message;
    toast.style.borderLeft = isError ? "5px solid #fa5252" : "5px solid #40c057";
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
