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
    const btnNocookie = document.getElementById('btn-nocookie');
    const outNocookie = document.getElementById('yt-out-nocookie');
    const boxNocookie = document.getElementById('res-yt-nocookie-box');
    const btnCopyNocookie = document.getElementById('btn-copy-nocookie');

    btnNocookie?.addEventListener('click', () => {
        const id = extractYoutubeId(inputNocookie.value);
        if (!id) return showToast('無効なYouTube URLです。', true);

        outNocookie.value = `https://www.youtube-nocookie.com/embed/${id}`;
        boxNocookie.classList.remove('hidden');
    });

    btnCopyNocookie?.addEventListener('click', () => {
        navigator.clipboard.writeText(outNocookie.value);
        showToast('URLをコピーしました！');
    });

    // --- 2. サムネイル取得機能（自動フォールバック搭載） ---
    const inputThumb = document.getElementById('yt-url-thumb');
    const btnThumb = document.getElementById('btn-yt-thumb');
    const boxThumb = document.getElementById('res-yt-thumb-box');
    const imgThumb = document.getElementById('yt-thumb-img');
    const btnOpenThumb = document.getElementById('btn-open-thumb');
    const btnDlThumb = document.getElementById('btn-dl-thumb');
    const loader = document.getElementById('loader-thumb');

    btnThumb?.addEventListener('click', () => {
        const id = extractYoutubeId(inputThumb.value);
        if (!id) return showToast('無効なYouTube URLです。', true);

        loader.classList.remove('hidden');
        boxThumb.classList.add('hidden');

        // フォールバック順の解像度リスト
        const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'default'];
        let currentIdx = 0;

        function tryLoadImage() {
            if (currentIdx >= qualities.length) {
                loader.classList.add('hidden');
                showToast('サムネイルの取得に失敗しました。', true);
                return;
            }
            const testImg = new Image();
            const imgUrl = `https://img.youtube.com/vi/${id}/${qualities[currentIdx]}.jpg`;

            testImg.onload = () => {
                // YouTubeは存在しない高画質画像に対して120x90のダミー画像を返す仕様があるためそれを検知
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
            testImg.src = imgUrl;
        }
        tryLoadImage();
    });

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
