# GCPプロジェクトセットアップ手順

## 1. GCPプロジェクトの作成

### ブラウザで作業
1. https://console.cloud.google.com にアクセス
2. Googleアカウントでログイン（なければ作成）
3. 上部のプロジェクトセレクタをクリック → 「新しいプロジェクト」

### プロジェクト情報
- **プロジェクト名**: Rakuten RMS RPA
- **プロジェクトID**: `rakuten-rms-rpa-20250707`（自動生成されたものでOK）

## 2. 必要なAPIを有効化

プロジェクトが作成されたら、左メニューから「APIとサービス」→「ライブラリ」で以下を検索して有効化：

1. **Cloud Run API**
2. **Container Registry API** 
3. **Cloud Storage API**
4. **Firestore API**
5. **Cloud Build API**

各APIで「有効にする」ボタンをクリック

## 3. Cloud Storageバケットの作成

1. 左メニュー → 「Cloud Storage」→「バケット」
2. 「作成」をクリック
3. 設定:
   - **バケット名**: `rakuten-rms-data-[プロジェクトID]`
   - **場所**: asia-northeast1（東京）
   - **ストレージクラス**: Standard
   - 他はデフォルトのまま

## 4. Firestoreの設定

1. 左メニュー → 「Firestore」
2. 「データベースの作成」
3. 設定:
   - **モード**: ネイティブモード
   - **ロケーション**: asia-northeast1

## 5. サービスアカウントの作成

1. 左メニュー → 「IAMと管理」→「サービスアカウント」
2. 「サービスアカウントを作成」
3. 設定:
   - **名前**: rakuten-rms-rpa-sa
   - **ID**: 自動生成のまま
   - **説明**: Rakuten RMS RPA Service Account

4. ロールを追加:
   - Cloud Run 管理者
   - Storage 管理者
   - Cloud Datastore ユーザー
   - サービス アカウント ユーザー

5. 完了

## 6. サービスアカウントキーの作成

1. 作成したサービスアカウントをクリック
2. 「キー」タブ → 「鍵を追加」→「新しい鍵を作成」
3. **JSON**を選択
4. ダウンロードされたJSONファイルを保存

## 7. 課金の有効化

Cloud Runを使用するには課金アカウントが必要です：
1. 左メニュー → 「お支払い」
2. 「お支払いアカウントをリンク」
3. クレジットカード情報を入力

※ 無料枠があるため、小規模な使用では料金はほとんど発生しません

## 8. GitHub Secretsの設定

https://github.com/senjinshuji/rakuten-rms-rpa/settings/secrets/actions

以下を追加：

### GCP_PROJECT_ID
作成したプロジェクトID（例: `rakuten-rms-rpa-20250707`）

### GCS_BUCKET_NAME  
作成したバケット名（例: `rakuten-rms-data-rakuten-rms-rpa-20250707`）

### GCP_SA_KEY
ダウンロードしたJSONファイルの内容を**そのまま全てコピー**して貼り付け

## 9. デプロイの実行

全ての設定が完了したら：

1. 何か小さな変更を加えてコミット
```bash
git add .
git commit -m "Trigger deployment"
git push
```

2. https://github.com/senjinshuji/rakuten-rms-rpa/actions でデプロイ状況を確認

## 完了確認

デプロイが成功すると、ActionsページでCloud RunのURLが表示されます。
そのURLにアクセスして動作確認してください。

## トラブルシューティング

- **権限エラー**: サービスアカウントのロールを再確認
- **API無効エラー**: 必要なAPIが有効化されているか確認
- **課金エラー**: 課金アカウントがリンクされているか確認