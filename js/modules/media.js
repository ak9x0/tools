import { showToast } from '../app.js';

export function initMedia() {
    // ドラッグ＆ドロップの共通設定関数
    function setupDropzone(zoneId, inputId, callback) {
        const zone = document.getElementById(zoneId);
        const input = document.getElementById(inputId);
        if(!zone || !input) return;

        zone.addEventListener('click', () => input.click());
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            if(e.dataTransfer.files.length > 0) callback(e.dataTransfer.files);
        });
        input.addEventListener('change', () => {
            if(input.files.length > 0) callback(input.files);
        });
    }

    // --- 3. 画像形式変換 ---
    let processedImgBlob = null;
    const imgQuality = document.getElementById('img-quality');
    const imgQualityVal = document.getElementById('img-quality-val');
    imgQuality?.addEventListener('input', (e) => imgQualityVal.textContent = e.target.value);

    setupDropzone('img-dropzone', 'img-file-input', (files) => {
        const file = files[0];
        if (!file.type.startsWith('image/')) return showToast('画像ファイルを選択してください。', true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const format = document.getElementById('img-target-format').value;
                const quality = parseFloat(imgQuality.value);

                canvas.toBlob((blob) => {
                    processedImgBlob = blob;
                    document.getElementById('res-img-box').classList.remove('hidden');
                    showToast('画像の変換に成功しました。');
                }, format, quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('btn-dl-img')?.addEventListener('click', () => {
        if (!processedImgBlob) return;
        const ext = document.getElementById('img-target-format').value.split('/')[1];
        const a = document.createElement('a');
        a.href = URL.createObjectURL(processedImgBlob);
        a.download = `converted_image.${ext}`;
        a.click();
    });

    // --- 4. 音声形式変換 (WAV出力ロジック) ---
    let processedAudioBlob = null;
    const loaderAudio = document.getElementById('loader-audio');

    setupDropzone('audio-dropzone', 'audio-file-input', async (files) => {
        const file = files[0];
        if (!file.type.startsWith('audio/')) return showToast('音声ファイルを選択してください。', true);

        loaderAudio.classList.remove('hidden');
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            
            // WAVバイナリの生成
            processedAudioBlob = bufferToWav(audioBuffer);
            document.getElementById('res-audio-box').classList.remove('hidden');
            showToast('WAVへの変換が完了しました。');
        } catch {
            showToast('音声の解析に失敗しました。', true);
        } finally {
            loaderAudio.classList.add('hidden');
        }
    });

    document.getElementById('btn-dl-audio')?.addEventListener('click', () => {
        if (!processedAudioBlob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(processedAudioBlob);
        a.download = 'converted_audio.wav';
        a.click();
    });

    // --- 5. ファイル圧縮 & ZIP化 ---
    let compressedZipBlob = null;
    const loaderComp = document.getElementById('loader-comp');

    setupDropzone('comp-dropzone', 'comp-file-input', async (files) => {
        loaderComp.classList.remove('hidden');
        const zip = new JSZip();
        
        for (let file of files) {
            // 画像かつ軽量化を狙う場合
            if (file.type.startsWith('image/')) {
                const blob = await compressImageBuffer(file);
                zip.file(`compressed_${file.name}`, blob);
            } else {
                zip.file(file.name, file);
            }
        }

        zip.generateAsync({ type: 'blob' }).then((content) => {
            compressedZipBlob = content;
            loaderComp.classList.add('hidden');
            document.getElementById('res-comp-box').classList.remove('hidden');
            showToast('圧縮処理（ZIP化）が完了しました。');
        });
    });

    document.getElementById('btn-dl-comp')?.addEventListener('click', () => {
        if (!compressedZipBlob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(compressedZipBlob);
        a.download = 'archive.zip';
        a.click();
    });
}

// クライアントサイドWAVエンコーダのヘルパー関数
function bufferToWav(buffer) {
    let numOfChan = buffer.numberOfChannels,
        length = buffer.length * numOfChan * 2 + 44,
        bufferArr = new ArrayBuffer(length),
        view = new DataView(bufferArr),
        channels = [], i, sample,
        offset = 0,
        pos = 0;

    function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
    function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // ファイルサイズ - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16);         // チャンクサイズ
    setUint16(1);          // linear PCM
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // バイトレート
    setUint16(numOfChan * 2);                     // ブロック境界
    setUint16(16);                                // 16-bit
    setUint32(0x61746164);                        // "data" chunk
    setUint32(length - pos - 4);

    for (i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }
    return new Blob([bufferArr], { type: 'audio/wav' });
}

// 画像をCanvas経由で品質を下げて圧縮するヘルパー関数
function compressImageBuffer(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.6);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
