@echo off
setlocal
cd /d "%~dp0"
echo.
echo NEW LIFE Phase 33 を開始します。
echo Googleの再ログインが必要な場合だけ、ブラウザ操作を求めます。
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\newlife-deploy\run-phase33-local.ps1"
set EXITCODE=%ERRORLEVEL%
echo.
if not "%EXITCODE%"=="0" (
  echo Phase 33 は途中で停止しました。上の赤い案内だけ確認してください。
) else (
  echo Phase 33 の技術工程は完了しました。GitHub側でPR作成が続きます。
)
echo.
pause
exit /b %EXITCODE%
