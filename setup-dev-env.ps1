# Tokamak zkEVM Playground Setup Script for PowerShell
# This script sets up the development environment with proper Unicode support

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Tokamak zkEVM Playground Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set up git hooks
Write-Host "🔧 Setting up git hooks..." -ForegroundColor Yellow
git config core.hooksPath .githooks

if (Test-Path ".githooks\post-checkout") {
    Write-Host "   ✅ post-checkout hook configured" -ForegroundColor Green
} else {
    Write-Host "   ❌ post-checkout hook not found" -ForegroundColor Red
}

if (Test-Path ".githooks\post-merge") {
    Write-Host "   ✅ post-merge hook configured" -ForegroundColor Green
} else {
    Write-Host "   ❌ post-merge hook not found" -ForegroundColor Red
}

# Check .cursorrules
if (Test-Path ".cursorrules") {
    Write-Host "✅ .cursorrules found - Cursor will auto-apply coding rules" -ForegroundColor Green
} else {
    Write-Host "❌ .cursorrules not found!" -ForegroundColor Red
}

# Check PROMPT directory
if (Test-Path "PROMPT") {
    Write-Host "✅ PROMPT directory found with coding guidelines" -ForegroundColor Green
} else {
    Write-Host "❌ PROMPT directory not found!" -ForegroundColor Red
}

# Install dependencies
if (Test-Path "package.json") {
    Write-Host ""
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🚀 Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Key Rules:" -ForegroundColor Magenta
Write-Host "  • ALL comments must be in English" -ForegroundColor White
Write-Host "  • Use TypeScript strict typing" -ForegroundColor White
Write-Host "  • Implement proper error handling" -ForegroundColor White
Write-Host "  • Test cross-platform compatibility" -ForegroundColor White
Write-Host ""
Write-Host "📁 Reference Files:" -ForegroundColor Magenta
Write-Host "  • .cursorrules (auto-applied by Cursor)" -ForegroundColor White
Write-Host "  • PROMPT\CODING_RULES.md (detailed guidelines)" -ForegroundColor White
Write-Host "  • PROMPT\CURSOR_PROMPT.md (AI instructions)" -ForegroundColor White
Write-Host ""
Write-Host "💡 Open 'tokamak-zk-evm-playground.code-workspace' in VS Code" -ForegroundColor Cyan
Write-Host "   for optimal development experience!" -ForegroundColor Cyan
Write-Host "" 