# PhotoShow Userscript - Troubleshooting Guide

## 問題: ビューワーが表示されない

画像は検出されているがビューワーが表示されない場合、以下の手順で問題を診断してください。

## 診断手順

### 1. デバッグテストページを使用

```bash
# リポジトリのルートディレクトリで
open test-debug.html
```

このページは以下の機能を提供します:
- リアルタイムデバッグパネル（右上）
- コンソールログのキャプチャ
- イベントカウンター
- ステータス表示

### 2. ログの確認

画像にホバーして、以下のログが順番に表示されることを確認:

```
[時刻] Image detected: https://...
[時刻] showViewer called with: https://...
[時刻] HD URL: https://...
[時刻] Image dimensions: {width: 400, height: 300}
[時刻] Creating viewer
[時刻] Viewer appended to body
[時刻] Making viewer visible
[時刻] Viewer should now be visible
```

### 3. 問題の特定

#### ケース1: "Image detected" すら表示されない

**原因:**
- `shouldShowViewer` チェックで除外されている
- 画像サイズが最小サイズ (`thumbnailMinWidth`/`thumbnailMinHeight`) 未満
- `thumbnailTypes` 設定で無効化されている

**解決策:**
```javascript
// Settings UIで確認:
- thumbnailMinWidth: 48 (デフォルト)
- thumbnailMinHeight: 48 (デフォルト)
- thumbnailTypes.img: true
```

#### ケース2: "showViewer called" まで表示されるが止まる

**原因:**
- `state.config.enabled` が `false`
- `whitelistMode` が有効でサイト設定がない

**解決策:**
```javascript
// Settings UIで確認:
- Enable PhotoShow: チェック ON
- Whitelist Mode: チェック OFF (または当該サイトの設定を追加)
```

#### ケース3: "Image dimensions" が `{width: 0, height: 0}`

**原因:**
- 画像の読み込みに失敗
- CORS エラー
- 無効なURL

**解決策:**
- ブラウザの開発者ツールのネットワークタブを確認
- 画像URLが正しいか確認
- CORSエラーがないか確認

#### ケース4: "Creating viewer" まで行くが表示されない

**原因:**
- CSS が読み込まれていない
- z-index の問題
- 他の要素に隠されている

**解決策:**
```javascript
// ブラウザの開発者ツールで確認:
document.getElementById('photoshow-viewer')
// → 要素が存在するか？
// → style 属性に opacity: 0 がないか？
// → classList に 'photoshow-visible' が含まれているか？
```

#### ケース5: エラーメッセージが表示される

**原因:**
- JavaScript エラー
- 予期しない状態

**解決策:**
- エラーメッセージをコピー
- ブラウザのコンソールで詳細を確認
- GitHubでissueを報告

## よくある問題と解決策

### 問題: Assist-key モードで動作しない

**確認:**
```bash
# Settings UI で:
Viewer Trigger: "Assist Key" に設定
Assist Key: "Ctrl" / "Alt" / "Shift" のいずれか
```

**テスト:**
- 設定したキーを押しながら画像にホバー
- ログで "Image detected" が表示されるか確認

### 問題: 特定のサイトで動作しない

**確認:**
1. そのサイトがwhitelistまたはblacklistに含まれているか
2. サイト固有のCSS/JSが干渉していないか
3. 画像要素が通常のIMGタグか、背景画像か、リンクか

**解決策:**
```javascript
// Settings UI の Advanced タブで:
- Site Settings を確認
- Viewer Exceptions を確認
```

### 問題: 画像サイズが小さすぎて検出されない

**確認:**
```bash
# Settings UI の Viewer タブで:
Minimum Width: 48px (デフォルト)
Minimum Height: 48px (デフォルト)
```

**解決策:**
- 最小サイズを小さくする（例: 32px）
- またはその画像タイプを有効にする

## デバッグコマンド

ブラウザの開発者ツールのコンソールで以下を実行:

```javascript
// PhotoShow が初期化されているか確認
console.log('PhotoShow viewer:', document.getElementById('photoshow-viewer'));

// 現在の設定を確認
// (注: GM_getValue は userscript 内でのみ動作)

// ビューワーを手動で表示（テスト用）
const viewer = document.getElementById('photoshow-viewer');
if (viewer) {
    viewer.classList.add('photoshow-visible');
    viewer.style.opacity = '1';
    viewer.style.top = '100px';
    viewer.style.left = '100px';
    viewer.style.width = '400px';
    viewer.style.height = '300px';
}
```

## サポート

問題が解決しない場合:

1. `test-debug.html` のスクリーンショットを撮る
2. ブラウザのコンソールログをコピー
3. 使用しているブラウザとバージョンを記載
4. GitHubでissueを作成

## 関連ファイル

- `test-debug.html` - デバッグテストページ（このガイドで使用）
- `test-photoshow.html` - 基本テストページ
- `test-photoshow.sh` - 自動テストスクリプト
- `photoshow.user.js` - メインスクリプト
