# 🛠️ マルチ便利ツールボックス (ToolBox)

ブラウザ上（クライアントサイド）だけで全ての処理が完結する、サーバー不要のWeb便利ツール集サイトです。
レスポンシブ対応、ダークモード機能を搭載しています。

## 🚀 搭載ツール一覧

1. **YouTube No-Cookie変換**：プライバシーに配慮した埋め込み用URLへの変換。
2. **YouTubeサムネイル取得**：動画URLから最高画質サムネイルを抽出（自動フォールバック機能付き）。
3. **画像形式変換**：PNG/JPEG/WEBPの相互変換および品質調整。
4. **音声形式変換**：ブラウザ標準APIを使用した高音質WAV形式への変換。
5. **ファイル圧縮**：画像の軽量化、および複数ファイルのZIPまとめ圧縮。
6. **QRコード生成**：サイズや誤り訂正レベルを指定できるQRコード作成。
7. **重み付きルーレット**：確率設定、アニメーション、履歴コピー機能付きルーレット。

## 🛠️ 使用技術

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6 Modules)
- **外部ライブラリ** (CDN経由で最小限のみ利用):
  - [JSZip](https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js) (ZIP圧縮処理)
  - [qrcode.js](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js) (QRコード生成)

## 📦 ディレクトリ構成

```text
├── index.html          # メイン画面
├── css/
│   └── style.css       # スタイルシート（ダークモード・レスポンシブ）
└── js/
    ├── app.js          # 全体管理・画面切り替え
    └── modules/        # 機能別モジュール
        ├── youtube.js
        ├── media.js
        ├── qr.js
        └── roulette.js
