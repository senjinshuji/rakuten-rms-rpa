# 楽天RMS売上取得RPA プロジェクト概要

## プロジェクト情報
- **GitHubリポジトリ**: https://github.com/senjinshuji/rakuten-rms-rpa
- **作成日**: 2025年7月7日
- **ステータス**: デプロイ準備完了

## 実装済み機能

### 1. Webアプリケーション（Next.js）
- ✅ ログイン情報入力画面
- ✅ 2段階認証対応
- ✅ 期間指定機能
- ✅ リアルタイムステータス表示
- ✅ 売上データグラフ表示（Recharts）
- ✅ CSVダウンロード機能

### 2. RPA機能（Playwright）
- ✅ 楽天RMS自動ログイン
- ✅ データ自動取得
- ✅ CSV保存
- ✅ エラーハンドリング

### 3. インフラ・CI/CD
- ✅ Docker対応（Cloud Run用）
- ✅ GitHub Actions自動デプロイ
- ✅ GCS/Firestore連携コード
- ✅ 環境変数管理

## ディレクトリ構造
```
rakuten-rms-rpa/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # UIコンポーネント
│   ├── lib/             # ユーティリティ
│   └── types/           # TypeScript型定義
├── playwright/          # RPAスクリプト
├── .github/workflows/   # CI/CD設定
├── Dockerfile          # Cloud Run用
└── ドキュメント各種
```

## 必要な設定

### GitHub Secrets
- `GCP_PROJECT_ID`: GCPプロジェクトID
- `GCP_SA_KEY`: サービスアカウントキー（JSON）
- `GCS_BUCKET_NAME`: Cloud Storageバケット名

### 環境変数（.env）
```
GCP_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=rakuten-rms-data-xxxxx
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

## デプロイ手順
1. GCPプロジェクト作成（gcp-setup.md参照）
2. GitHub Secrets設定
3. git pushで自動デプロイ

## 今後の拡張予定
- Amazon対応
- Qoo10対応
- より詳細な分析機能
- 複数店舗対応

## 開発・テスト
```bash
# 開発サーバー起動
npm run dev

# Playwrightスクリプト単体実行
npm run playwright
```

## 注意事項
- ユーザー認証情報は平文保存されない
- 2段階認証は手動入力が必要
- 本番環境ではHTTPS必須