import { showToast } from '../app.js';

// YouTube URLから動画IDを抽出する共通ロジック
function extractYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.trim().match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function initYoutube() {
    // --- 1. No-Cookie 変換機能の要素群 ---
    const inputNocookie = document.getElementById('yt-url-nocookie');
    const btnNocookie = document.getElementById('btn-yt-nocookie');
    const outNocookie = document.getElementById('yt-out-nocookie');
    const iframeNocookie = document.getElementById('yt-iframe-nocookie');
    const boxNocookie = document.getElementById('res-yt-nocookie-box');
    const btnCopyNocookie = document.getElementById('btn-copy-nocookie');

    // --- 2. サムネイル取得機能の要素群（★ここが必要でした！） ---
    const inputThumb = document.getElementById('yt-url-thumb');
    const btnThumb = document.getElementById('btn-yt-thumb');
    const boxThumb = document.getElementById('res-yt-thumb-box');
    const imgThumb = document.getElementById('yt-thumb-img');
    const btnOpenThumb = document.getElementById('btn-open-thumb');
    const btnDlThumb = document.getElementById('btn-dl-thumb');
    const loader = document.getElementById('loader-thumb');

    // --- 1. No-Cookie 変換処理 ---
    btnNocookie?.addEventListener('click', () => {
        const id = extractYoutubeId(inputNocookie.value);
        if (!id) return showToast('無効なYouTube URLです。', true);

        const embedUrl = `https://www.youtube-nocookie.com/embed/${id}`;
        
        outNocookie.value = embedUrl;
        iframeNocookie.src = embedUrl;
        boxNocookie.classList.remove('hidden');
    });

    btnCopyNocookie?.addEventListener('click', () => {
        navigator.clipboard.writeText(outNocookie.value);
        showToast('URLをコピーしました！');
    });

    // --- 2. サムネイル取得処理（自動フォールバック・リセット対策版） ---
    btnThumb?.addEventListener('click', () => {
        const id = extractYoutubeId(inputThumb.value);
        if (!id) return showToast('無効なYouTube URLです。', true);

        loader.classList.remove('hidden');
        boxThumb.classList.add('hidden');
        imgThumb.src = ''; // 読み込み開始前に一度リセットをかける

        // フォールバック順の解像度リスト
        const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'default'];
        let currentIdx = 0;

        function tryLoadImage() {
            if (currentIdx >= qualities.length) {
                loader.classList.add('hidden');
                showToast('サムネイルの取得に失敗しました。', true);
                return;
            }
            
            const imgUrl = `https://img.youtube.com/vi/${id}/${qualities[currentIdx]}.jpg`;
            const testImg = new Image();
            
            testImg.onload = () => {
                // YouTubeの仕様：存在しない高画質画像に対して120x90のダミー画像を返すのを検知
                if (testImg.naturalWidth <= 120 && qualities[currentIdx] !== 'default') {
                    currentIdx++;
                    tryLoadImage();
                } else {
                    imgThumb.src = imgUrl;
                    btnOpenThumb.href = imgUrl;
                    loader.classList.add('hidden');
                    boxThumb.classList.remove('hidden');
                }
            };
            
            testImg.onerror = () => {
                currentIdx++;
                tryLoadImage();
            };
            
            testImg.crossOrigin = 'anonymous'; 
            testImg.src = imgUrl;
        }
        
        tryLoadImage();
    });

    // サムネイルダウンロードボタンの処理（これも必要です）
    btnDlThumb?.addEventListener('click', async () => {
        try {
            const response = await fetch(imgThumb.src);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'youtube_thumbnail.jpg';
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            showToast('直接ダウンロードに失敗しました。右クリックまたは画像を開いて保存してください。', true);
        }
    });
}
