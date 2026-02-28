#!/bin/bash
# Quick Deploy Script for Firebase Hosting
# Usage: bash deploy.sh

set -e

echo "🚀 SQUID TECH Deployment Script"
echo "================================"
echo ""

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI detected"

# Check if firebase project is linked
if [ ! -f ".firebaserc" ]; then
    echo "⚠️  No .firebaserc found. Running: firebase init hosting"
    firebase init hosting
fi

echo ""
echo "🔍 Running pre-flight checks..."

# Verify no REPLACE_ME placeholders
if grep -r "REPLACE_ME" src/ index.html &>/dev/null; then
    echo "❌ ERROR: Found 'REPLACE_ME' placeholders. Update Firebase config in src/main.js"
    exit 1
fi
echo "✅ No placeholder values found"

# Verify index.html exists
if [ ! -f "index.html" ]; then
    echo "❌ ERROR: index.html not found"
    exit 1
fi
echo "✅ index.html present"

# Verify src folder exists
if [ ! -d "src" ]; then
    echo "❌ ERROR: src/ folder not found"
    exit 1
fi
echo "✅ src/ folder present"

echo ""
echo "📦 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app is live! Check Firebase Console for URL."
echo "   Or run: firebase open hosting:site"
echo ""
echo "📝 Post-deployment checklist:"
echo "   [ ] Load app in browser"
echo "   [ ] Enter name and start game"
echo "   [ ] Verify leaderboard appears"
echo "   [ ] Submit a score"
echo "   [ ] Check Firestore for entry"
echo ""
