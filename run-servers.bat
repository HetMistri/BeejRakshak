@echo off
setlocal

cd /d "%~dp0"

start "BeejRakshak Client" cmd /k "npm run dev:client"
start "BeejRakshak Services" cmd /k "cd AIML && pip install -r requirements.txt && uvicorn AIML.main:app --reload"

endlocal
