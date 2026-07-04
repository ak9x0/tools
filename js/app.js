import { initYoutube } from './modules/youtube.js';
import { initMedia } from './modules/media.js';
import { initQR } from './modules/qr.js';
import { initRoulette } from './modules/roulette.js';

document.addEventListener('DOMContentLoaded', () => {
    const views = document.querySelectorAll('.view');
    const cards = document.querySelectorAll('.card');
    const btnBack = document.getElementById('btn-back');
    const siteTitle = document.getElementById('site-title');

    function showView(viewId) {
        views.forEach(v => v.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
        
        if (viewId === 'view-home') {
            btnBack.classList.add('hidden');
            // トップに戻ったとき、すべてのツールの中身をリセットする
            resetAllTools();
        } else {
            btnBack.classList.remove('hidden');
        }
    }

    // 各ツールの中身を根こそぎリセットする関数
    function resetAllTools() {
        // --- 1. YouTube No-Cookie ---
        const iframeNocookie = document.getElementById('yt-iframe-nocookie');
        if (iframeNocookie) iframeNocookie.src = ''; 
        const inputNocookie = document.getElementById('yt-url-nocookie');
        if (inputNocookie) inputNocookie.value = '';
        document.getElementById('res-yt-nocookie-box')?.classList.add('hidden');

        // --- 2. YouTube サムネイル ---
        const inputThumb = document.getElementById('yt-url-thumb');
        if (inputThumb) inputThumb.value = '';
        const imgThumb = document.getElementById('yt-thumb-img');
        if (imgThumb) imgThumb.src = '';
        document.getElementById('res-yt-thumb-box')?.classList.add('hidden');

        // --- 3. 画像形式変換 ---
        const imgInput = document.getElementById('img-file-input');
        if (imgInput) imgInput.value = ''; 
        document.getElementById('res-img-box')?.classList.add('hidden');

        // --- 4. 音声形式変換 ---
        const audioInput = document.getElementById('audio-file-input');
        if (audioInput) audioInput.value = '';
        document.getElementById('res-audio-box')?.classList.add('hidden');

        // --- 5. ファイル圧縮 ---
        const compInput = document.getElementById('comp-file-input');
        if (compInput) compInput.value = '';
        document.getElementById('res-comp-box')?.classList.add('hidden');

        // --- 6. QRコード生成 ---
        const qrText = document.getElementById('qr-text');
        if (qrText) qrText.value = '';
        const qrOutput = document.getElementById('qrcode-output');
        if (qrOutput) qrOutput.innerHTML = '';
        document.getElementById('res-qr-box')?.classList.add('hidden');

        // --- 7. ルーレット ---
        document.getElementById('roulette-result')?.classList.add('hidden');

        // --- 8. お問い合わせ（埋め込みiframeのリセット） ---
        const contactIframe = document.getElementById('contact-iframe');
        if (contactIframe) {
            // 次回開いたときのために「読み込み中...」の表示を復活させる
            document.getElementById('loader-contact')?.classList.remove('hidden');
            // srcを再代入することで、フォームを送信後の画面から初期画面にリフレッシュする
            contactIframe.src = contactIframe.src;
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

    // ==========================================
    // 📢 お知らせポップアップ（モーダル）の制御
    // ==========================================
    const newsModal = document.getElementById('news-modal');
    const btnOpenNews = document.getElementById('btn-open-news');
    const btnCloseNews = document.getElementById('btn-close-news');

    // 1. アクセス時に自動でポップアップを表示
    if (newsModal) {
        newsModal.classList.remove('hidden');
    }

    // 2. 閉じるボタン（×）を押したとき
    btnCloseNews?.addEventListener('click', () => {
        newsModal.classList.add('hidden');
    });

    // 3. 背景の黒い部分をクリックしたときも閉じる
    newsModal?.addEventListener('click', (e) => {
        if (e.target === newsModal) {
            newsModal.classList.add('hidden');
        }
    });

    // 4. 「更新履歴を見る」ボタンを押したとき
    btnOpenNews?.addEventListener('click', () => {
        newsModal?.classList.remove('hidden');
    });
});

// 共通トースト通知
export function showToast(message, isError = false) {
    const toast = document.getElementById('error-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.borderLeft = isError ? "5px solid #fa5252" : "5px solid #40c057";
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
