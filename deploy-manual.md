# 手動デプロイ手順

## 1. GitHubリポジトリの作成

1. ブラウザで https://github.com/new にアクセス
2. 以下の情報で作成:
   - Repository name: `rakuten-rms-rpa`
   - Public を選択
   - 他の設定はデフォルトのまま
3. 「Create repository」をクリック

## 2. コードをプッシュ

ターミナルで以下を実行:

```bash
# 既にリモートが設定されているので、直接プッシュ
git push -u origin main
```

パスワードを求められたら：
- Username: senjinshuji
- Password: senjin4649

## 3. GitHub Secretsの設定

リポジトリページで:
1. Settings タブをクリック
2. 左メニューの「Secrets and variables」→「Actions」をクリック
3. 「New repository secret」をクリックして以下を追加:

### 必要なSecrets:
- **GCP_PROJECT_ID**: あなたのGCPプロジェクトID
- **GCP_SA_KEY**: サービスアカウントキーのJSON内容（後述）
- **GCS_BUCKET_NAME**: `rakuten-rms-data-[PROJECT_ID]`

## 4. Google Cloud設定

### 4.1 プロジェクトIDを確認
```bash
# GCPコンソールで確認するか、既存のプロジェクトIDを使用
```

### 4.2 必要なAPIを有効化
GCPコンソール（https://console.cloud.google.com）で:
1. APIとサービス → ライブラリ
2. 以下を検索して有効化:
   - Cloud Run API
   - Container Registry API
   - Cloud Storage API
   - Firestore API
   - Cloud Build API

### 4.3 サービスアカウントの作成
1. IAMと管理 → サービスアカウント
2. 「サービスアカウントを作成」
3. 名前: `rakuten-rms-rpa-sa`
4. 以下のロールを付与:
   - Cloud Run 管理者
   - Storage 管理者
   - Cloud Datastore ユーザー
   - サービス アカウント ユーザー

### 4.4 サービスアカウントキーの作成
1. 作成したサービスアカウントをクリック
2. 「キー」タブ → 「鍵を追加」→ 「新しい鍵を作成」
3. JSON形式を選択してダウンロード
4. ダウンロードしたJSONファイルの内容をコピー
5. GitHub Secretsの `GCP_SA_KEY` に貼り付け

### 4.5 Cloud Storageバケットの作成
```bash
# GCPコンソールで作成するか、以下のコマンドを使用
# gsutil mb gs://rakuten-rms-data-[PROJECT_ID]
```

## 5. デプロイの実行

1. すべての設定が完了したら、GitHubでmainブランチにプッシュ
2. Actions タブでデプロイの進行状況を確認
3. 成功すると、Cloud RunのURLが表示される

## トラブルシューティング

- デプロイが失敗する場合は、GitHub ActionsのログでエラーメッセージCLASSを確認
- 権限エラーの場合は、サービスアカウントのロールを再確認
- APIが有効化されていないエラーの場合は、必要なAPIを有効化

## 完了後

デプロイが成功したら:
1. 表示されたCloud RunのURLにアクセス
2. 楽天のログイン情報を入力してテスト
3. 正常に動作することを確認