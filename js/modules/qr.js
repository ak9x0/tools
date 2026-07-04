import { showToast } from '../app.js';

export function initQR() {
    const btnGen = document.getElementById('btn-gen-qr');
    const qrText = document.getElementById('qr-text');
    const qrOutput = document.getElementById('qrcode-output');
    const boxQr = document.getElementById('res-qr-box');
    const btnDl = document.getElementById('btn-dl-qr');

    btnGen?.addEventListener('click', () => {
        const text = qrText.value.trim();
        if (!text) return showToast('文字列またはURLを入力してください。', true);

        qrOutput.innerHTML = ''; // 以前のQRをクリア

        const size = parseInt(document.getElementById('qr-size').value);
        const correctLevel = document.getElementById('qr-correct').value;

        // qrcode.jsライブラリのインスタンス化
        new QRCode(qrOutput, {
            text: text,
            width: size,
            height: size,
            correctLevel: QRCode.CorrectLevel[correctLevel]
        });

        boxQr.classList.remove('hidden');
        showToast('QRコードを生成しました。');
    });

    btnDl?.addEventListener('click', () => {
        // qrcode.jsが生成したimg要素からsrcを取得
        const img = qrOutput.querySelector('img');
        if (!img) return;

        const a = document.createElement('a');
        a.href = img.src;
        a.download = 'qrcode.png';
        a.click();
    });
}
