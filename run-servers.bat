@echo off
setlocal

cd /d "%~dp0"

start "BeejRakshak Server" cmd /k "npm run dev:server"
start "BeejRakshak Client" cmd /k "npm run dev:client"

endlocal
