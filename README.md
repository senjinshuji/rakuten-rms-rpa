# 楽天RMS売上取得RPA

楽天RMSから売上データを自動取得し、グラフ表示するWebサービス

## 機能

- 楽天RMSへの自動ログイン（2段階認証対応）
- 売上データ・注文数の自動取得
- 日別売上推移グラフ
- CSVダウンロード機能
- Google Cloud Storage連携
- Firestore連携

## 技術スタック

- Next.js 15
- TypeScript
- Playwright（Webスクレイピング）
- Tailwind CSS
- Recharts（グラフ表示）
- Google Cloud Run
- GitHub Actions（CI/CD）

## セットアップ

### 1. 環境変数の設定

`.env.example`を`.env`にコピーして設定:

```bash
cp .env.example .env
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

## デプロイ

GitHub Actionsによる自動デプロイが設定されています。
mainブランチにプッシュすると自動的にCloud Runにデプロイされます。

## 使い方

1. ブラウザでアクセス
2. 楽天のログイン情報を入力
3. データ取得期間を選択
4. 「データ取得を開始」をクリック
5. 自動でデータ取得が完了したらダッシュボードへ遷移
6. グラフの確認・CSVダウンロード

## 注意事項

- ログイン情報は平文保存されません
- 2段階認証コードは手動入力が必要です
- Amazon/Qoo10対応は今後実装予定