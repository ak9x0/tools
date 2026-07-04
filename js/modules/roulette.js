import { showToast } from '../app.js';

export function initRoulette() {
    const canvas = document.getElementById('roulette-canvas');
    const ctx = canvas?.getContext('2d');
    const btnSpin = document.getElementById('btn-spin');
    const txtItems = document.getElementById('roulette-items');
    const resBadge = document.getElementById('roulette-result');
    const logList = document.getElementById('roulette-log');
    const btnCopyHistory = document.getElementById('btn-copy-history');

    let isSpinning = false;
    const history = [];

    // パセリデータ（項目名と重み）を解析する関数
    function parseItems() {
        const lines = txtItems.value.split('\n');
        const parsed = [];
        lines.forEach(line => {
            const parts = line.split(',');
            const name = parts[0]?.trim();
            const weight = parseFloat(parts[1]?.trim()) || 1; // 指定がない場合は重み1
            if (name) parsed.push({ name, weight });
        });
        return parsed;
    }

    // ルーレット盤面の描画ロジック
    function drawRoulette(currentAngle = 0, items = []) {
        if (!ctx) return;
        ctx.clearRect(0, 0, 300, 300);
        if (items.length === 0) return;

        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        const centerX = 150, centerY = 150, radius = 130;
        let startAngle = currentAngle;

        items.forEach((item, idx) => {
            const angleSize = (item.weight / totalWeight) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + angleSize);
            ctx.closePath();

            // 適当なカラーパターンを割り振る
            ctx.fillStyle = `hsl(${(idx * 360 / items.length)}, 70%, 60%)`;
            ctx.fill();
            ctx.stroke();

            // テキストの描画
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + angleSize / 2);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(item.name.substring(0, 6), radius / 2, 5);
            ctx.restore();

            startAngle += angleSize;
        });

        // 針の描画（上向き固定）
        ctx.beginPath();
        ctx.moveTo(150, 10);
        ctx.lineTo(145, 30);
        ctx.lineTo(155, 30);
        ctx.closePath();
        ctx.fillStyle = '#ff3e3e';
        ctx.fill();
    }

    // 初期状態のダミー描画
    setTimeout(() => {
        const defaultItems = parseItems();
        drawRoulette(0, defaultItems);
    }, 500);

    btnSpin?.addEventListener('click', () => {
        if (isSpinning) return;
        const items = parseItems();
        if (items.length === 0) return showToast('項目を入力してください。', true);

        isSpinning = true;
        resBadge.classList.add('hidden');
        btnSpin.disabled = true;

        let angle = 0;
        let speed = 0.3 + Math.random() * 0.2; // 初速のランダム化
        const friction = 0.002; // 減速率

        function animate() {
            angle += speed;
            speed -= friction;

            drawRoulette(angle, items);

            if (speed > 0) {
                requestAnimationFrame(animate);
            } else {
                // 当選判定の計算
                isSpinning = false;
                btnSpin.disabled = false;

                const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
                // 針の位置（真上＝1.5 * Math.PI）に対する相対的な角度を導出
                const normalizedAngle = (2 * Math.PI - (angle % (2 * Math.PI)) + 1.5 * Math.PI) % (2 * Math.PI);
                
                let currentAngleSum = 0;
                let winner = items[0];

                for (let i = 0; i < items.length; i++) {
                    const size = (items[i].weight / totalWeight) * Math.PI * 2;
                    if (normalizedAngle >= currentAngleSum && normalizedAngle < currentAngleSum + size) {
                        winner = items[i];
                        break;
                    }
                    currentAngleSum += size;
                }

                // 当選演出
                resBadge.textContent = `🎉 当選: ${winner.name}`;
                resBadge.classList.remove('hidden');
                
                // 履歴に追加
                history.push(winner.name);
                const li = document.createElement('li');
                li.textContent = `${history.length}回目: ${winner.name}`;
                logList.appendChild(li);
                btnCopyHistory.classList.remove('hidden');
            }
        }
        animate();
    });

    btnCopyHistory?.addEventListener('click', () => {
        navigator.clipboard.writeText(history.join('\n'));
        showToast('履歴をコピーしました！');
    });
}
