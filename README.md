# macos-web

[🇯🇵 日本語](./README.md) · [🇰🇷 한국어](./README.ko.md) · [🇺🇸 English](./README.en.md)

ウェブ上で動作する macOS デスクトップのクローン。React 19 + TypeScript + Vite ベース。

## 主な機能

- **Dock** - Finder、Safari、メモ、ターミナル、App Store、Mail アプリを起動
- **Window** - ドラッグ、リサイズ、最小化、フォーカス(z-index) 管理
- **Spotlight** - アプリの検索と起動
- **MenuBar / Control Center** - 上部メニューバーとコントロールセンター
- **Widgets** - 時計、天気、カレンダーなどのデスクトップウィジェット
- **Stickies** - ドラッグ/リサイズ/色変更が可能な付箋メモ (localStorage に保存)
- **i18n** - 韓国語 / 英語 / 日本語 対応
- **モバイルビュー** - 640px 以下で iOS ホーム画面スタイルのグリッド表示

## 技術スタック

### コア
- react ^19.2.4 / react-dom ^19.2.4
- typescript ~6.0.2
- vite ^8.0.4

### スタイリング
- tailwindcss ^4.2.2
- @tailwindcss/vite ^4.2.2

### 状態管理 / ルーティング
- @tanstack/react-query ^5.99.0
- @tanstack/react-query-persist-client ^5.99.0
- @tanstack/query-async-storage-persister ^5.99.0
- @tanstack/react-router ^1.168.10

### インタラクション / UI
- @dnd-kit/core ^6.3.1
- @dnd-kit/sortable ^10.0.0
- @dnd-kit/utilities ^3.2.2
- lucide-react ^1.7.0

### 国際化 / ユーティリティ
- i18next ^26.0.4
- react-i18next ^17.0.2
- @js-temporal/polyfill ^0.5.1
- axios ^1.15.0

### ターミナル / MDX
- @xterm/xterm ^6.0.0
- @xterm/addon-fit ^0.11.0
- @mdx-js/react ^3.1.1
- @mdx-js/rollup ^3.1.1

### 品質管理 / 計測
- oxlint ^1.59.0
- prettier ^3.8.1 (※ oxformat への移行予定)
- vitest ^4.1.3
- lighthouse ^13.1.0
- chrome-launcher ^1.2.1

> **プロジェクトの方針**: oxc ベースのエコシステム (oxlint / oxformat 等) を全面採用し、
> Rust 製ツールによる高速なフロントエンド開発環境の実用性を検証することも目的の一つ。
> テストは vitest を使用予定。

## 開発

```bash
pnpm install
pnpm dev          # 開発サーバー
pnpm build        # 本番ビルド
pnpm lint         # oxlint
pnpm format       # prettier
pnpm lighthouse   # Lighthouse 計測
```

## プロジェクト構成

```
src/
  components/    # Dock、Window、Spotlight、各アプリウィンドウ
  hooks/         # useStickies などのカスタムフック
  contexts/      # React Context
  i18n/          # 翻訳リソース
  lib/           # ユーティリティ
apps/api/        # Hono ベースの BFF (予定)
docs/            # 作業計画ドキュメント
```

## パフォーマンス

Lighthouse 100 点 / バンドルサイズ最適化のため、Dock のアプリは `React.lazy` で遅延読み込み。
Lighthouse の計測は CPU 4 倍スロットリング (`cpuSlowdownMultiplier: 4`) で実施。
