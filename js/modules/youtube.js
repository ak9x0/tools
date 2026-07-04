import { showToast } from '../app.js';

// YouTube URLから動画IDを抽出する共通ロジック
function extractYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.trim().match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function initYoutube() {
    // --- 1. No-Cookie 変換機能 ---
    const inputNocookie = document.getElementById('yt-url-nocookie');
    const btnNocookie = document.getElementById('btn-yt-nocookie'); // 前回の修正を反映
    const outNocookie = document.getElementById('yt-out-nocookie');
    const iframeNocookie = document.getElementById('yt-iframe-nocookie'); // 👇 追加
    const boxNocookie = document.getElementById('res-yt-nocookie-box');
    const btnCopyNocookie = document.getElementById('btn-copy-nocookie');

    btnNocookie?.addEventListener('click', () => {
        const id = extractYoutubeId(inputNocookie.value);
        if (!id) return showToast('無効なYouTube URLです。', true);

        const embedUrl = `https://www.youtube-nocookie.com/embed/${id}`;
        
        outNocookie.value = embedUrl;
        iframeNocookie.src = embedUrl; // 👇 iframeにURLをセットして動画を読み込む
        boxNocookie.classList.remove('hidden');
    });

    btnCopyNocookie?.addEventListener('click', () => {
        navigator.clipboard.writeText(outNocookie.value);
        showToast('URLをコピーしました！');
    });

    // --- 2. サムネイル取得機能（以下はそのまま変更なし） ---
    // ... (省略)
}
