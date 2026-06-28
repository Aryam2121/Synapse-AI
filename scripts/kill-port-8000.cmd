@echo off
setlocal enabledelayedexpansion
echo Checking port 8000...

for /f "tokens=5" %%a in ('C:\Windows\System32\netstat.exe -ano ^| C:\Windows\System32\findstr.exe ":8000" ^| C:\Windows\System32\findstr.exe "LISTENING"') do (
  echo Stopping PID %%a ...
  C:\Windows\System32\taskkill.exe /F /PID %%a 2>nul
)

REM Stop Python processes that may hold the API port
for /f "tokens=2" %%p in ('C:\Windows\System32\tasklist.exe /FI "IMAGENAME eq python.exe" /FO LIST ^| C:\Windows\System32\findstr.exe "PID:"') do (
  C:\Windows\System32\taskkill.exe /F /PID %%p 2>nul
)

ping 127.0.0.1 -n 3 >nul
C:\Windows\System32\netstat.exe -ano | C:\Windows\System32\findstr.exe ":8000" | C:\Windows\System32\findstr.exe "LISTENING" >nul
if %errorlevel%==0 (
  echo Warning: port 8000 may still be in use. Try closing other terminals or Task Manager ^(Python^).
  exit /b 1
)
echo Port 8000 is free.
exit /b 0
