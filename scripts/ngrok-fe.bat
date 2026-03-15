@echo off
REM Chay ngrok cho FE (port 5173) - dung khi chua add ngrok vao PATH
set NGROK_EXE=C:\Users\gmt\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe
if not exist "%NGROK_EXE%" (
  echo Khong tim thay ngrok. Cap nhat duong dan trong scripts/ngrok-fe.bat
  exit /b 1
)
"%NGROK_EXE%" http 5173
