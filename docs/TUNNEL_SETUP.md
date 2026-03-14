# Cách 2: Cấu hình Tunnel (ngrok / Cloudflare) cho app chạy trên điện thoại thật

Dùng tunnel để điện thoại thật (iOS/Android) gọi API Backend mà **không cần cùng WiFi** và không cần nhập IP máy tính. Tunnel tạo một URL công khai (https) trỏ về máy bạn (localhost:5000).

**Đã cấu hình sẵn:** Trong **MO/.env** đã đặt `EXPO_PUBLIC_API_URL` theo dạng tunnel. Bạn chỉ cần **thay** giá trị đó bằng URL thật khi chạy ngrok hoặc Cloudflare (xem Bước 2 và 3 bên dưới).

---

## Tổng quan

1. **Backend (BE)** chạy trên máy bạn, lắng nghe port **5000**.
2. **Tunnel** (ngrok hoặc Cloudflare) tạo URL dạng `https://xxxx.ngrok-free.app` (hoặc `https://xxx.trycloudflare.com`) trỏ tới `http://localhost:5000`.
3. **App MO** đọc `EXPO_PUBLIC_API_URL` từ file `.env`, bạn đặt = URL tunnel → app gọi API qua tunnel.

---

## Bước 1: Chạy Backend (BE)

1. Mở terminal, vào thư mục Backend:
   ```bash
   cd BE
   ```
2. Cài dependency (nếu chưa):
   ```bash
   npm install
   ```
3. Kiểm tra file **BE/.env** có:
   - `PORT=5000` (hoặc port bạn dùng)
   - `MONGO_URI=...` (MongoDB Atlas)
4. Chạy server:
   ```bash
   npm run start
   ```
5. Thấy dòng kiểu: `Server listening on 0.0.0.0:5000` → BE đã sẵn sàng.

**Giữ terminal này chạy** (đừng tắt) trong suốt lúc test app.

---

## Bước 2: Chọn và chạy Tunnel

Chọn **một trong hai**: ngrok hoặc Cloudflare Tunnel.
`
### Cách A: Ngrok

1. **Cài ngrok**
   - Tải: https://ngrok.com/download  
   - Hoặc với npm: `npm install -g ngrok`
   - Đăng ký tài khoản miễn phí tại https://ngrok.com, lấy **Authtoken** trong Dashboard.

2. **Cấu hình token** (chỉ làm 1 lần):
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```
   (Thay `YOUR_AUTH_TOKEN` bằng token từ ngrok dashboard.)

3. **Chạy tunnel** (mở terminal mới, BE vẫn chạy ở terminal cũ):
   ```bash
   ngrok http 5000
   ```
   (Nếu BE chạy port khác, đổi `5000` cho đúng.)

4. Trong terminal ngrok sẽ có dạng:
   ```
   Forwarding   https://abc123.ngrok-free.app -> http://localhost:5000
   ```
   **Sao chép URL https** (vd: `https://abc123.ngrok-free.app`). **Không thêm dấu /** ở cuối.
`
### Cách B: Cloudflare Tunnel (cloudflared)

1. **Tải cloudflared**
   - Windows: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   - Hoặc tải trực tiếp: https://github.com/cloudflare/cloudflared/releases

2. **Chạy tunnel (quick, không cần tài khoản)**:
   ```bash
   cloudflared tunnel --url http://localhost:5000
   ```
   (Đổi `5000` nếu BE chạy port khác.)

3. Trong terminal sẽ có dòng kiểu:
   ```
   Your quick Tunnel has been created! Visit it at:
   https://random-words-xxx.trycloudflare.com
   ```
   **Sao chép URL https** (vd: `https://random-words-xxx.trycloudflare.com`). **Không thêm /** ở cuối.

**Giữ terminal tunnel chạy** (đừng tắt) khi test app. Mỗi lần chạy lại `ngrok http 5000` hoặc `cloudflared tunnel --url ...`, URL có thể đổi (đặc biệt Cloudflare quick tunnel).

---

## Bước 3: Cấu hình app MO (Expo)

1. Mở file **MO/.env** (nếu chưa có thì copy từ **MO/.env.example**).

2. Đặt **đúng một dòng** `EXPO_PUBLIC_API_URL` bằng URL tunnel vừa copy:
   ```env
   EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app
   ```
   hoặc (Cloudflare):
   ```env
   EXPO_PUBLIC_API_URL=https://random-words-xxx.trycloudflare.com
   ```

   **Lưu ý:**
   - Dùng **https**, không dùng http.
   - **Không** có dấu `/` ở cuối (không: `https://xxx.ngrok-free.app/`).
   - Không có khoảng trắng thừa.

3. (Tùy chọn) Xóa hoặc comment các dòng khác về API URL nếu không dùng (vd không cần `EXPO_PUBLIC_API_URL_ANDROID` khi dùng chung tunnel).

4. Lưu file **.env**.

---

## Bước 4: Chạy app và test trên điện thoại thật

1. Mở terminal mới, vào thư mục MO:
   ```bash
   cd MO
   ```

2. Chạy Expo **với xóa cache** (để đọc lại .env):
   ```bash
   npx expo start -c
   ```

3. Cài **Expo Go** trên điện thoại (iOS/Android) nếu chưa có.

4. **Kết nối điện thoại và máy tính cùng mạng** (WiFi hoặc USB), hoặc quét QR bằng Expo Go:
   - Terminal sẽ hiện QR code.
   - Mở Expo Go → quét QR (hoặc nhập URL hiển thị trong terminal).

5. Mở app trên điện thoại → nếu cấu hình đúng, app sẽ gọi API qua tunnel và hiển thị danh mục / sản phẩm từ BE (MongoDB Atlas).

---

## Kiểm tra nhanh

- Trên **máy tính**, mở trình duyệt:
  - `https://your-tunnel-url/api/categories`  
  (thay `your-tunnel-url` bằng URL tunnel thực tế.)
- Nếu trả về JSON (danh sách hoặc mảng) → tunnel và BE hoạt động đúng. App MO chỉ cần đúng `EXPO_PUBLIC_API_URL` trong .env.

---

## Lỗi thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| App báo lỗi mạng / timeout | Kiểm tra BE đang chạy (terminal BE), tunnel đang chạy (terminal ngrok/cloudflared). Đúng port (5000). |
| CORS / chặn request | BE đã cấu hình CORS cho tunnel (https). Nếu vẫn lỗi, kiểm tra BE có bật CORS cho origin tunnel. |
| .env không đổi sau khi sửa | Chạy lại Expo với cache: `npx expo start -c`. |
| URL tunnel đổi mỗi lần chạy | Với Cloudflare quick tunnel là bình thường. Mỗi lần chạy tunnel mới thì cập nhật lại **MO/.env** và `npx expo start -c`. Ngrok bản miễn phí cũng có thể đổi URL; bản trả phí có thể giữ tên miền cố định. |

---

## Tóm tắt thứ tự thao tác

1. **Terminal 1:** `cd BE` → `npm run start` (giữ chạy).  
2. **Terminal 2:** `ngrok http 5000` hoặc `cloudflared tunnel --url http://localhost:5000` (giữ chạy).  
3. Copy URL **https** từ tunnel (không slash cuối).  
4. **MO/.env:** `EXPO_PUBLIC_API_URL=https://...` (URL vừa copy).  
5. **Terminal 3:** `cd MO` → `npx expo start -c` → mở app trên điện thoại bằng Expo Go (quét QR hoặc nhập URL).

Sau khi làm đủ các bước trên, app trên điện thoại thật (iOS/Android) sẽ gọi API theo **Cách 2 – Tunnel** thành công.
