#!/bin/bash

# GitHubにプッシュするスクリプト
echo "GitHubリポジトリを作成してプッシュします..."

# リポジトリを作成（手動で行う必要があります）
echo "================================================"
echo "手動で以下を実行してください："
echo ""
echo "1. ブラウザで https://github.com/new にアクセス"
echo "2. Repository name: rakuten-rms-rpa"
echo "3. Publicを選択"
echo "4. 'Create repository'をクリック"
echo ""
echo "リポジトリを作成したら、Enterを押してください..."
read -p ""

# HTTPSでプッシュ
echo "プッシュを実行します..."
echo ""
echo "以下のコマンドをターミナルで直接実行してください："
echo ""
echo "git push https://senjinshuji@github.com/senjinshuji/rakuten-rms-rpa.git main"
echo ""
echo "ユーザー名: senjinshuji"
echo "パスワード: あなたのPAT (github_pat_...)"
echo ""
echo "または、GitHub Desktopアプリを使用することも可能です。"