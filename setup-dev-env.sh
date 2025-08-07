#!/bin/bash

echo "========================================"
echo "   Tokamak zkEVM Playground Setup"
echo "========================================"
echo ""

# Set up git hooks
echo "🔧 Setting up git hooks..."
git config core.hooksPath .githooks
chmod +x .githooks/* 2>/dev/null

if [ -f ".githooks/post-checkout" ]; then
    echo "   ✅ post-checkout hook configured"
fi
if [ -f ".githooks/post-merge" ]; then
    echo "   ✅ post-merge hook configured"
fi

# Check .cursorrules
if [ -f ".cursorrules" ]; then
    echo "✅ .cursorrules found - Cursor will auto-apply coding rules"
else
    echo "❌ .cursorrules not found!"
fi

# Check PROMPT directory
if [ -d "PROMPT" ]; then
    echo "✅ PROMPT directory found with coding guidelines"
else
    echo "❌ PROMPT directory not found!"
fi

# Install dependencies
if [ -f "package.json" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    echo "   ✅ Dependencies installed"
fi

echo ""
echo "========================================"
echo "   🚀 Setup Complete!"
echo "========================================"
echo ""
echo "📋 Key Rules:"
echo "  • ALL comments must be in English"
echo "  • Use TypeScript strict typing"
echo "  • Implement proper error handling"
echo "  • Test cross-platform compatibility"
echo ""
echo "📁 Reference Files:"
echo "  • .cursorrules (auto-applied by Cursor)"
echo "  • PROMPT/CODING_RULES.md (detailed guidelines)"
echo "  • PROMPT/CURSOR_PROMPT.md (AI instructions)"
echo ""
echo "💡 Open 'tokamak-zk-evm-playground.code-workspace' in VS Code"
echo "   for optimal development experience!"
echo ""