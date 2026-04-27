#!/bin/bash
set -e

REPO="jellydn/vscode-whichkey"

echo "🔐 Setup GitHub Secrets for VSCode Extension Publishing"
echo "========================================================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "   Install it from: https://cli.github.com/"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "❌ Not logged into GitHub CLI."
    echo "   Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Function to set secret
set_secret() {
    local name=$1
    local url=$2
    local docs=$3

    echo "📋 Setting up: $name"
    echo "   Purpose: $docs"
    echo "   Get token from: $url"
    echo ""

    # Check if already set
    if gh secret list --repo "$REPO" | grep -q "^$name\b"; then
        echo "   ℹ️  $name is already set. Override? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "   Skipped."
            echo ""
            return
        fi
    fi

    echo "   Paste your $name token (input will be hidden):"
    read -rs token
    echo ""

    if [ -z "$token" ]; then
        echo "   ❌ Empty token provided. Skipped."
        echo ""
        return
    fi

    echo "$token" | gh secret set "$name" --repo "$REPO"
    echo "   ✅ $name set successfully!"
    echo ""
}

echo "This script will help you set up the required secrets for publishing"
echo "to the VSCode Marketplace and Open VSX Registry."
echo ""
echo "Repository: $REPO"
echo ""

# VSCE_PAT
set_secret "VSCE_PAT" \
    "https://dev.azure.com/microsoft/" \
    "Personal Access Token for VSCode Marketplace (Azure DevOps)"

echo "   📖 To create VSCE_PAT:"
echo "      1. Go to https://dev.azure.com/microsoft/"
echo "      2. Sign in with your Microsoft account"
echo "      3. Go to User Settings → Personal Access Tokens"
echo "      4. Create a new token with 'Marketplace' scope (Publish)"
echo "      5. Organization: All accessible organizations"
echo "      6. Copy the token and paste it above"
echo ""

# OVSX_PAT
set_secret "OVSX_PAT" \
    "https://open-vsx.org/" \
    "Personal Access Token for Open VSX Registry"

echo "   📖 To create OVSX_PAT:"
echo "      1. Go to https://open-vsx.org/"
echo "      2. Sign in with your GitHub account"
echo "      3. Go to your Profile → Settings"
echo "      4. Click 'Add New Token' under 'Personal Access Tokens'"
echo "      5. Give it a name like 'vscode-whichkey'"
echo "      6. Copy the token and paste it above"
echo ""

# Verify
echo "========================================================"
echo "🔍 Verifying secrets in repository:"
echo ""
gh secret list --repo "$REPO"

echo ""
echo "✅ Setup complete!"
echo ""
echo "To release a new version:"
echo "   git tag v0.12.1"
echo "   git push origin v0.12.1"
echo ""
