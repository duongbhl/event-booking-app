# Event Booking App

Một ứng dụng mẫu đặt vé & quản lý sự kiện (mobile-first) gồm Frontend (React Native + Expo) và Backend (Node.js + Express + TypeScript). Dự án cung cấp các tính năng cơ bản: đăng ký/đăng nhập, tìm kiếm sự kiện, xem chi tiết, đặt vé, bookmark, lịch cá nhân, bản đồ/định vị, chat nội bộ và thông báo.



## Tổng quan

Ứng dụng cho phép:
- Người dùng tìm, xem và lưu các sự kiện.
- Đặt vé (support flow miễn phí; có chỗ mở để tích hợp payment gateway).
- Xem lịch cá nhân với các sự kiện đã đặt/đã lưu.
- Hiển thị vị trí trên bản đồ và mở hướng dẫn đường bằng Google Maps.
- Trao đổi qua chat giữa người dùng và organizer (hiện dùng REST endpoints; có thể nâng cấp realtime).
- Nhận thông báo và quản lý lời mời.



---

## Yêu cầu trước khi chạy (Prerequisites)

- Node.js (LTS, ví dụ v18+)
- npm hoặc yarn
- MongoDB (local hoặc MongoDB Atlas)
- Expo CLI (nếu muốn chạy app trên thiết bị/emulator): `npm i -g expo-cli` hoặc dùng `npx expo`
- (Tùy chọn) Google Maps API key để bật chức năng bản đồ/geocoding

---

## Cài đặt & chạy dự án (Local Development)

> Giả sử bạn đã clone repo về máy:
> git clone https://github.com/duongbhl/event-booking-app.git

### 1. Backend (server)

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Tạo file `.env` (xem phần mẫu dưới). Ví dụ tối giản:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/event-booking
   JWT_SECRET=your_jwt_secret
   ```

4. Chạy server ở chế độ phát triển:
   ```bash
   npm run dev
   ```
   - Script `dev` dùng `ts-node-dev` để chạy `src/server.ts` với hot-reload.
   - Nếu muốn build & chạy production: cần transpile TypeScript (thiết lập build script / tsconfig) — repo hiện có `start: "node src/server.ts"` nhưng để chạy bản compiled nên bổ sung build step nếu cần.

5. Kiểm tra:
   - Mặc định server sẽ lắng nghe port trong `.env` (ví dụ `5000`).
   - Truy cập `http://localhost:5000` (hoặc các endpoint REST).

### 2. Frontend (mobile app)

1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Tạo file cấu hình môi trường (ví dụ `.env` hoặc cấu hình dùng trong code). Cần ít nhất:
   ```
   API_URL=http://<YOUR_BACKEND_HOST>:5000
   GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
   ```

   > Lưu ý: Expo xử lý biến môi trường khác nhau — tham khảo cách repo cấu hình (hoặc dùng `app.json` / `app.config.js` hoặc `react-native-dotenv`). Nếu repo không dùng thư viện dotenv ở frontend, bạn có thể chỉnh file `frontend/services/api` để point `baseURL`.

4. Chạy ứng dụng bằng Expo:
   ```bash
   npm run start
   # hoặc
   expo start
   ```
   - Mở trên thiết bị bằng Expo Go (quét QR code), hoặc mở Android emulator / iOS simulator.
   - Đảm bảo device có thể truy cập backend (khi dùng device thật, backend phải public hoặc trên cùng network; nếu dùng emulator Android, sử dụng `10.0.2.2` cho Android Studio emulator).

---

## Biến môi trường (Environment variables)

### Ví dụ backend `.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/event-booking
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development

# Email (nodemailer) - nếu dùng
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_email_password

# Google (server-side geocoding, optional)
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_API_KEY
```

### Ví dụ frontend `.env` (hoặc cấu hình tương đương)
```
API_URL=http://192.168.1.10:5000      # trỏ tới backend URL (hoặc https)
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_API_KEY
```

> Lưu ý bảo mật: Không commit file `.env` lên Git. Sử dụng `.env.example` để chia sẻ biến cần cấu hình.

---

## Cơ sở dữ liệu

- Dự án sử dụng MongoDB. Bạn có thể:
  - Cài MongoDB local và chạy `mongod`, hoặc
  - Dùng MongoDB Atlas và cập nhật `MONGO_URI` trong `.env`.

- Khuyến nghị index:
  - Text index cho `events.title`/`description`
  - 2dsphere/geo index cho trường coordinates
  - Index cho `users.email`, `events.date`, `bookings.user`...

- Seeding / dữ liệu mẫu:
  - Repo có thể chưa có script seed. Bạn có thể viết script seed đơn giản (node script) để tạo users, events, sample tickets, bookmarks.

---

## Một số lệnh hữu ích

- Backend
  - `npm run dev` — chạy server dev (ts-node-dev)
  - `npm start` — (theo package.json) run `node src/server.ts` (cần biên dịch .ts nếu chạy production)
- Frontend
  - `npm run start` — start Expo dev server
  - `npm run android` — mở trên Android (Expo)
  - `npm run ios` — mở trên iOS (Expo)

