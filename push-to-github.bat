@echo off
cd /d "%~dp0"
git config user.email "thdaudwlswkd@gmail.com"
git config user.name "thdaudwlswkd-eng"
git add -A
git commit -m "update"
git remote set-url origin https://thdaudwlswkd-eng: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@github.com/thdaudwlswkd-eng/tok-hanjang.git
git push origin main
echo.
echo Done!
pause
