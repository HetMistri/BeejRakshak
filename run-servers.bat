@echo off
setlocal

cd /d "%~dp0"

start "BeejRakshak Server" cmd /k "npm run dev:server"
start "BeejRakshak Client" cmd /k "npm run dev:client"
start "BeejRakshak Services" cmd /k "cd AIML && pip install -r requirements.txt && uvicorn AIML.main:app --reload"

endlocal
