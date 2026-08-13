@echo off
setlocal
cd /d %~dp0
start "AgriConnect API" cmd /k "cd /d %~dp0apps\api && node local-api.mjs"
start "AgriConnect Web" cmd /k "cd /d %~dp0 && python -m http.server 5500 --directory apps\web"
echo.
echo AgriConnect is starting...
echo Web: http://localhost:5500
 echo API: http://localhost:4000/api/health
pause
