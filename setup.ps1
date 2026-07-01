# 명함 홈 — 최초 실행 스크립트
Write-Host "=== 명함 홈 설치 시작 ===" -ForegroundColor Cyan

Set-Location $PSScriptRoot

Write-Host "패키지 설치 중..." -ForegroundColor Yellow
npm install

Write-Host "데이터베이스 초기화 중..." -ForegroundColor Yellow
npx prisma db push

Write-Host ""
Write-Host "=== 완료! ===" -ForegroundColor Green
Write-Host "아래 명령어로 실행하세요:" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "브라우저에서 http://localhost:3000 을 여세요" -ForegroundColor White
