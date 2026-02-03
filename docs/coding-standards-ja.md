# コーディング規約とベストプラクティス

## モダンなJavaScriptイベントAPI

### ⚠️ 非推奨: initMouseEvent()

**使用しないでください** 非推奨の`initMouseEvent()`メソッド。このAPIは廃止され、Web標準から削除されています。

#### ❌ 非推奨のアプローチ（使用禁止）
```javascript
// 間違い - 非推奨API
const event = document.createEvent('MouseEvent');
event.initMouseEvent(
    'click', true, true, window, 0, 
    0, 0, 0, 0, 
    false, false, false, false, 
    0, null
);
element.dispatchEvent(event);
```

#### ✅ モダンなアプローチ（正しい）
```javascript
// 正しい - モダンなMouseEventコンストラクター
const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
    detail: 0,
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: null
});
element.dispatchEvent(event);
```

#### 🎯 シンプルな例
```javascript
// シンプルなイベントの場合、ほとんどのオプションを省略できます
const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true
});
element.dispatchEvent(clickEvent);
```

### その他のモダンなイベントコンストラクター

#### CustomEvent
```javascript
const customEvent = new CustomEvent('myevent', {
    bubbles: true,
    detail: { customData: 'value' }
});
element.dispatchEvent(customEvent);
```

#### KeyboardEvent
```javascript
const keyEvent = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    bubbles: true,
    cancelable: true
});
element.dispatchEvent(keyEvent);
```

#### FocusEvent
```javascript
const focusEvent = new FocusEvent('focus', {
    bubbles: true,
    relatedTarget: previousElement
});
element.dispatchEvent(focusEvent);
```

### なぜモダンなコンストラクター？

1. **クリーンな構文**: 位置引数ではなく名前付きパラメータ
2. **読みやすさ向上**: 自己文書化コード
3. **型安全性**: より良いIDE支援と型チェック
4. **標準準拠**: 現在のWeb標準に従っている
5. **将来性**: 非推奨や削除されない
6. **エラーが少ない**: 引数の順序を覚える必要がない

### 比較: 旧式 vs 新式

| 機能 | initMouseEvent() | MouseEvent() |
|---------|-----------------|--------------|
| ステータス | ❌ 非推奨 | ✅ 標準 |
| 構文 | 位置引数 | 名前付きオプション |
| 読みやすさ | 悪い | 優れている |
| 型安全性 | なし | あり |
| IDEサポート | 限定的 | 完全 |
| 将来性 | 削除済み | 安定 |

### ブラウザサポート

モダンなイベントコンストラクターはすべての主要ブラウザでサポートされています：
- ✅ Chrome 15+
- ✅ Firefox 11+
- ✅ Safari 6+
- ✅ Edge（全バージョン）
- ✅ Opera 15+

### ESLint設定

非推奨APIの使用を防ぐため、`.eslintrc.js`に以下を追加：

```javascript
rules: {
    'no-restricted-syntax': [
        'error',
        {
            selector: 'CallExpression[callee.property.name="initMouseEvent"]',
            message: 'initMouseEvent()は非推奨です。new MouseEvent()コンストラクターを使用してください。'
        },
        {
            selector: 'CallExpression[callee.property.name="initEvent"]',
            message: 'initEvent()は非推奨です。イベントコンストラクターを使用してください。'
        }
    ]
}
```

### 追加リソース

- [MDN: MouseEventコンストラクター](https://developer.mozilla.org/ja/docs/Web/API/MouseEvent/MouseEvent)
- [MDN: initMouseEvent（非推奨）](https://developer.mozilla.org/ja/docs/Web/API/MouseEvent/initMouseEvent)
- [Web標準: UIイベント](https://www.w3.org/TR/uievents/)

### 移行ガイド

プロジェクトで非推奨コードを見つけた場合：

1. **特定** - 非推奨メソッドの呼び出しを見つける
2. **置き換え** - モダンなコンストラクターに変更
3. **テスト** - 徹底的にテスト（イベントの動作は同じはず）
4. **更新** - 関連ドキュメントを更新
5. **実行** - ESLintで準拠を確認

### 移行例

**変更前:**
```javascript
function triggerClick(element) {
    const evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    element.dispatchEvent(evt);
}
```

**変更後:**
```javascript
function triggerClick(element) {
    const evt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    element.dispatchEvent(evt);
}
```

## 一般的なJavaScriptベストプラクティス

### モダンなES6+機能を使用

✅ **推奨:**
- `var`の代わりに`const`と`let`を使用
- コールバックにはアロー関数を使用
- 文字列にはテンプレートリテラルを使用
- オブジェクト/配列には分割代入を使用
- `apply()`の代わりにスプレッド演算子を使用
- ネストされたコールバックの代わりに`async/await`を使用

❌ **非推奨:**
- 変数宣言に`var`を使用
- `eval()`や`with`文を使用
- 非推奨APIを使用
- 不要なグローバル変数を作成

### コード構成

```javascript
// 良い - 明確な構造
const config = {
    enabled: true,
    timeout: 1000
};

function initialize(options) {
    const mergedConfig = { ...config, ...options };
    return setupApp(mergedConfig);
}

// 悪い - 乱雑な構造
var cfg = {}; cfg.en = true; cfg.to = 1000;
function init(o) { return setup(Object.assign(cfg, o)); }
```

### エラー処理

```javascript
// 良い - 適切なエラー処理
try {
    const result = riskyOperation();
    processResult(result);
} catch (error) {
    console.error('[PhotoShow] 操作に失敗しました:', error.message);
    fallbackBehavior();
}

// 悪い - エラー処理なし
const result = riskyOperation(); // 例外をスローする可能性
processResult(result);
```

### パフォーマンス

```javascript
// 良い - キャッシュされたセレクター
const viewer = document.querySelector('.photoshow-viewer');
if (viewer) {
    viewer.style.display = 'block';
    viewer.classList.add('active');
}

// 悪い - 複数のクエリ
if (document.querySelector('.photoshow-viewer')) {
    document.querySelector('.photoshow-viewer').style.display = 'block';
    document.querySelector('.photoshow-viewer').classList.add('active');
}
```

### アクセシビリティ

```javascript
// 良い - アクセシブル
const button = document.createElement('button');
button.setAttribute('aria-label', 'ビューワーを閉じる');
button.setAttribute('role', 'button');
button.addEventListener('click', closeViewer);

// 悪い - アクセシブルでない
const div = document.createElement('div');
div.onclick = closeViewer; // キーボードからアクセスできない
```

## コミットメッセージガイドライン

明確で説明的なコミットメッセージを使用：

```
タイプ: 短い説明（50文字以内）

必要に応じて長い説明。72文字で折り返します。
何を、なぜを説明し、どのようにではない。

- 箇条書きも可
- 現在形を使用：「機能を追加」ではなく「機能追加」
```

**タイプ:**
- `Fix:` バグ修正
- `Add:` 新機能
- `Update:` 既存機能の変更
- `Refactor:` コード再構成
- `Docs:` ドキュメントのみ
- `Style:` コードスタイルの変更
- `Test:` テストの追加/変更
- `Chore:` メンテナンスタスク

## 質問がありますか？

コーディング規約について質問がある場合：
1. このドキュメントを確認
2. 既存のコードで例を確認
3. GitHubディスカッションで質問
4. MDNドキュメントを参照

---

**最終更新:** 2026-02-03
**バージョン:** 1.0.0
