@echo off
chcp 65001 >nul
title MyX 摄影网站 一键发布
cd /d "%~dp0"

echo.
echo ============================================
echo   MyX 摄影网站 - 一键发布
echo ============================================
echo.

rem 查找 Git Bash（按常见安装路径探测）
set "GITBASH="
if exist "D:\Git\bin\bash.exe" set "GITBASH=D:\Git\bin\bash.exe"
if exist "C:\Program Files\Git\bin\bash.exe" set "GITBASH=C:\Program Files\Git\bin\bash.exe"
if exist "C:\Program Files (x86)\Git\bin\bash.exe" set "GITBASH=C:\Program Files (x86)\Git\bin\bash.exe"

if "%GITBASH%"=="" (
    echo 未找到 Git Bash，请确认已安装 Git。
    echo 可访问 https://git-scm.com 下载安装。
    echo.
    pause
    exit /b 1
)

echo 正在更新照片并发布，请稍候...
echo.
"%GITBASH%" -lc "cd '%CD:\=/%' && bash publish.sh %*"

echo.
echo ============================================
echo   操作结束，窗口将在 5 秒后关闭
echo ============================================
timeout /t 5 >nul
