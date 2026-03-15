# Deploy TechShop lên Vercel

## 1. FE deploy lên Vercel

- Root Directory: `FE`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### FE Environment Variables

- `VITE_API_BASE_URL=https://your-be-project.vercel.app`
- `VITE_GOOGLE_CLIENT_ID=your_google_client_id` nếu FE web có dùng Google Sign-In

## 2. BE deploy lên Vercel

- Root Directory: `BE`
- Framework Preset: `Other`
- Vercel sẽ dùng `vercel.json` và `api/index.js`

### BE Environment Variables

- `MONGO_URI=your_mongodb_atlas_uri`
- `JWT_SECRET=your_jwt_secret`
- `FRONTEND_URL=https://your-fe-project.vercel.app`
- `GOOGLE_CLIENT_ID=your_google_client_id`
- `NODE_ENV=production`
- `API_URL=https://your-be-project.vercel.app`

## 3. Lưu ý quan trọng

- FE deploy trên Vercel chạy ổn với cấu hình hiện tại.
- BE deploy trên Vercel có thể chạy cho các API MongoDB/JWT thông thường.
- Chức năng upload ảnh local hiện tại KHÔNG phù hợp với Vercel vì filesystem là ephemeral.
- Route upload trong `BE/routes/upload.js` đang lưu file vào thư mục local `uploads`, nên ảnh upload có thể lỗi hoặc mất sau khi function restart.

## 4. Khuyến nghị cho production

- Nếu cần upload ảnh ổn định: chuyển sang Cloudinary, S3 hoặc Supabase Storage.
- Nếu muốn giữ nguyên cách upload local của Express: deploy BE lên Railway/Render thay vì Vercel.

## 5. Trình tự deploy nhanh

1. Tạo project FE trên Vercel, chọn thư mục `FE`
2. Set env `VITE_API_BASE_URL`
3. Deploy FE
4. Tạo project BE trên Vercel, chọn thư mục `BE`
5. Set toàn bộ env backend
6. Deploy BE
7. Quay lại FE, cập nhật `VITE_API_BASE_URL` đúng domain BE nếu cần rồi redeploy
