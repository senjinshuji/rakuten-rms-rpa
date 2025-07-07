#!/bin/bash

echo "楽天RMS売上取得RPA セットアップスクリプト"
echo "========================================"

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 必要な情報を収集
echo -e "${YELLOW}必要な情報を入力してください:${NC}"
read -p "GitHubユーザー名: " GITHUB_USERNAME
read -p "GCPプロジェクトID: " GCP_PROJECT_ID
read -p "GCPリージョン (デフォルト: asia-northeast1): " GCP_REGION
GCP_REGION=${GCP_REGION:-asia-northeast1}

# GitHub CLIがインストールされているか確認
if ! command -v gh &> /dev/null; then
    echo -e "${RED}GitHub CLIがインストールされていません。${NC}"
    echo "以下のコマンドでインストールしてください:"
    echo "brew install gh"
    exit 1
fi

# gcloud CLIがインストールされているか確認
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}gcloud CLIがインストールされていません。${NC}"
    echo "https://cloud.google.com/sdk/docs/install を参照してインストールしてください。"
    exit 1
fi

# GitHubにログイン
echo -e "${GREEN}GitHubにログイン中...${NC}"
gh auth login

# GitHubリポジトリを作成
echo -e "${GREEN}GitHubリポジトリを作成中...${NC}"
gh repo create rakuten-rms-rpa --public --source=. --remote=origin --push

# GCPプロジェクトを設定
echo -e "${GREEN}GCPプロジェクトを設定中...${NC}"
gcloud config set project $GCP_PROJECT_ID

# 必要なAPIを有効化
echo -e "${GREEN}必要なGCP APIを有効化中...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Cloud Storageバケットを作成
BUCKET_NAME="rakuten-rms-data-${GCP_PROJECT_ID}"
echo -e "${GREEN}Cloud Storageバケットを作成中: ${BUCKET_NAME}${NC}"
gsutil mb -p $GCP_PROJECT_ID -l $GCP_REGION gs://${BUCKET_NAME}/

# Firestoreデータベースを作成
echo -e "${GREEN}Firestoreデータベースを作成中...${NC}"
gcloud firestore databases create --region=$GCP_REGION

# サービスアカウントを作成
SA_NAME="rakuten-rms-rpa-sa"
SA_EMAIL="${SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

echo -e "${GREEN}サービスアカウントを作成中...${NC}"
gcloud iam service-accounts create $SA_NAME \
    --display-name="Rakuten RMS RPA Service Account"

# 必要な権限を付与
echo -e "${GREEN}サービスアカウントに権限を付与中...${NC}"
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

# サービスアカウントキーを作成
echo -e "${GREEN}サービスアカウントキーを作成中...${NC}"
gcloud iam service-accounts keys create ./service-account-key.json \
    --iam-account=$SA_EMAIL

# GitHub Secretsを設定
echo -e "${GREEN}GitHub Secretsを設定中...${NC}"
gh secret set GCP_PROJECT_ID --body="$GCP_PROJECT_ID"
gh secret set GCS_BUCKET_NAME --body="$BUCKET_NAME"
gh secret set GCP_SA_KEY < ./service-account-key.json

# .envファイルを作成
echo -e "${GREEN}.envファイルを作成中...${NC}"
cat > .env << EOF
GCP_PROJECT_ID=$GCP_PROJECT_ID
GCS_BUCKET_NAME=$BUCKET_NAME
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
NEXT_PUBLIC_API_URL=http://localhost:3000
HEADLESS=true
EOF

echo -e "${GREEN}セットアップが完了しました！${NC}"
echo ""
echo "次のステップ:"
echo "1. ローカルで開発サーバーを起動: npm run dev"
echo "2. GitHubにプッシュして自動デプロイ: git push origin main"
echo "3. GitHub Actionsでデプロイ状況を確認: https://github.com/${GITHUB_USERNAME}/rakuten-rms-rpa/actions"
echo ""
echo -e "${YELLOW}重要: service-account-key.jsonは秘密情報です。Gitにコミットしないでください。${NC}"