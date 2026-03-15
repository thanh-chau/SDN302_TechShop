# Gộp tunnel: 1 ngrok cho cả BE + FE (port 5000)

Khi bật `SERVE_FE=1` trong BE/.env, backend vừa serve API vừa serve giao diện FE (build). Chỉ cần **1 tunnel** ngrok → port 5000.

## Các bước

1. **Build FE** (chỉ cần khi đổi code FE):
   ```bash
   cd FE
   npm run build
   ```

2. **Chạy BE** (port 5000):
   ```bash
   cd BE
   npm start
   ```

3. **Chạy 1 tunnel ngrok**:
   ```bash
   ngrok http 5000
   ```
   (Hoặc dùng full path / script: `.\scripts\ngrok-fe.ps1` đổi port trong script thành 5000.)

4. **Cấu hình MO**: Trong MO/.env đặt **cùng URL** cho cả API và trang Admin:
   - `EXPO_PUBLIC_API_URL=https://xxx.ngrok-free.dev`
   - `EXPO_PUBLIC_WEB_ADMIN_URL=https://xxx.ngrok-free.dev`

Sau đó mở app MO: API gọi qua ngrok, Trang quản trị (WebView) cũng load từ cùng URL đó.
