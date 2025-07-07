# GitHubへのプッシュ手順

GitHubはパスワード認証を廃止したため、Personal Access Token（PAT）が必要です。

## 1. Personal Access Tokenの作成

1. GitHubにログイン（https://github.com）
2. 右上のプロフィールアイコン → Settings
3. 左メニューの一番下「Developer settings」
4. 「Personal access tokens」→「Tokens (classic)」
5. 「Generate new token」→「Generate new token (classic)」
6. 以下を設定:
   - Note: `rakuten-rms-rpa`
   - Expiration: 90 days（または任意）
   - Select scopes: `repo`（全てチェック）
7. 「Generate token」をクリック
8. **表示されたトークンをコピー**（二度と表示されません！）

## 2. トークンを使ってプッシュ

ターミナルで以下を実行:

```bash
# リモートURLをトークン付きに変更
git remote set-url origin https://senjinshuji:[YOUR_TOKEN]@github.com/senjinshuji/rakuten-rms-rpa.git

# プッシュ
git push -u origin main
```

`[YOUR_TOKEN]`の部分を、コピーしたトークンに置き換えてください。

## 3. 成功したら

プッシュが成功したら:
1. https://github.com/senjinshuji/rakuten-rms-rpa にアクセス
2. コードがアップロードされていることを確認
3. `deploy-manual.md`の手順に従ってGCP設定を行う

## セキュリティ注意事項

- Personal Access Tokenは安全に保管してください
- トークンを含むコマンドは履歴に残るため、作業後は履歴をクリアすることを推奨
- 定期的にトークンを更新してください