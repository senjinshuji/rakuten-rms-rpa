#!/bin/bash

# macOS用GitHub CLIインストールスクリプト
echo "GitHub CLIをインストールします..."

# Homebrewがインストールされているか確認
if command -v brew &> /dev/null; then
    echo "Homebrewを使用してインストールします..."
    brew install gh
else
    echo "Homebrewがインストールされていません。"
    echo "手動でインストールする場合は以下を実行してください："
    echo ""
    echo "1. Homebrewをインストール:"
    echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    echo ""
    echo "2. GitHub CLIをインストール:"
    echo "brew install gh"
    echo ""
    echo "または、直接バイナリをダウンロード:"
    echo "https://github.com/cli/cli/releases"
fi