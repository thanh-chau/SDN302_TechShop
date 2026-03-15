# Chay ngrok cho FE (port 5173) - dung khi chua add ngrok vao PATH
$ngrok = "C:\Users\gmt\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe"
if (-not (Test-Path $ngrok)) {
  Write-Host "Khong tim thay ngrok. Cap nhat duong dan trong scripts/ngrok-fe.ps1" -ForegroundColor Red
  exit 1
}
& $ngrok http 5173
