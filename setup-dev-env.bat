@echo off
chcp 65001 >nul
echo ========================================
echo   Tokamak zkEVM Playground Setup
echo ========================================
echo.

REM Set up git hooks
echo [SETUP] Setting up git hooks...
git config core.hooksPath .githooks
if exist .githooks\post-checkout (
    echo    [OK] post-checkout hook configured
)
if exist .githooks\post-merge (
    echo    [OK] post-merge hook configured  
)

REM Check .cursorrules
if exist .cursorrules (
    echo [OK] .cursorrules found - Cursor will auto-apply coding rules
) else (
    echo [ERROR] .cursorrules not found!
)

REM Check PROMPT directory
if exist PROMPT (
    echo [OK] PROMPT directory found with coding guidelines
) else (
    echo [ERROR] PROMPT directory not found!
)

REM Install dependencies
if exist package.json (
    echo.
    echo [INSTALL] Installing dependencies...
    call npm install
    echo    [OK] Dependencies installed
)

echo.
echo ========================================
echo   [SUCCESS] Setup Complete!
echo ========================================
echo.
echo [RULES] Key Rules:
echo   * ALL comments must be in English
echo   * Use TypeScript strict typing
echo   * Implement proper error handling
echo   * Test cross-platform compatibility
echo.
echo [FILES] Reference Files:
echo   * .cursorrules (auto-applied by Cursor)
echo   * PROMPT\CODING_RULES.md (detailed guidelines)
echo   * PROMPT\CURSOR_PROMPT.md (AI instructions)
echo.
echo [TIP] Open 'tokamak-zk-evm-playground.code-workspace' in VS Code
echo       for optimal development experience!
echo.
pause