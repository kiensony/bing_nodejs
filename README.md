# Microsoft Rewards Automation Tool (v5.0)

Công cụ tự động cày điểm Microsoft Rewards phiên bản 5.0, hỗ trợ đa tài khoản, chạy mượt mà trên nền tảng Chromium chống phát hiện bot.

---

## 🚀 Cách Cài Đặt & Sử Dụng (Dành Cho Người Mới)

### Bước 1: Yêu cầu cài đặt trước
- Cài đặt **Node.js** (phiên bản 24 trở lên): [Tải Node.js tại đây](https://nodejs.org/)
- Cài đặt **Git**: [Tải Git tại đây](https://git-scm.com/)

---

### Bước 2: Tải code về máy
Mở Terminal hoặc Command Prompt (CMD) và chạy lệnh:
```bash
git clone https://github.com/vanhobmt99/bing_nodejs.git
cd bing_nodejs
```

---

### Bước 3: Cấu hình tài khoản (.env)
1. Tạo một file tên là `.env` ở ngay thư mục gốc của dự án (ngang hàng với file `package.json`).
2. Điền thông tin các tài khoản cần chạy theo mẫu sau:

```env
# Tài khoản 1
ACCOUNT_1_EMAIL="email_1@outlook.com"
ACCOUNT_1_PASSWORD="mat_khau_1"

# Tài khoản 2
ACCOUNT_2_EMAIL="email_2@outlook.com"
ACCOUNT_2_PASSWORD="mat_khau_2"

# Bạn có thể thêm tiếp ACCOUNT_3, ACCOUNT_4,... tuỳ ý
```

> **Lưu ý:** File `.env` chứa mật khẩu cá nhân của bạn, đã được hệ thống ẩn hoàn toàn trên Git, tuyệt đối an toàn và không bị lộ lên mạng.

---

### Bước 4: Chạy Tool (Chỉ 1 Click)

👉 **Cách 1 (Dễ nhất - Khuyên dùng):**
- Nhấp đúp chuột trực tiếp vào file **`run.bat`**.
- File sẽ tự động kiểm tra, tự cài đặt thư viện, tự tải trình duyệt Chromium và tự chạy từ A đến Z!

👉 **Cách 2 (Chạy thủ công bằng lệnh):**
```bash
npm install
npm run install:browser
npm run build
npm start
```

---

## ⚙️ Các Tính Năng Nổi Bật

- **Tìm kiếm thông minh:** Tìm kiếm PC và Mobile với độ trễ ngẫu nhiên (12–30s), có cuộn trang và click link tin tức giả lập người thật để tối đa điểm **Bing Star Bonus (2,100 điểm)**.
- **Tự động làm nhiệm vụ:**
  - Daily Set, More Promotions, Keep Earning.
  - Tự động ăn các nhiệm vụ tuần (Exclusive Weekly Quests - Novw1, Novw2...).
  - Tự động duy trì chuỗi bảo vệ điểm (Streak Protection).
  - Tự động nhận thưởng khi hoàn thành (Auto Claim).
- **Cơ chế chống bot tiên tiến:**
  - Sử dụng trình duyệt ngầm Patchright chống phát hiện tự động hóa.
  - Tự động chia sẻ Cookie SSO giữa phiên Desktop và Mobile, hạn chế tối đa việc bị hỏi mã xác minh OTP.
- **Tiết kiệm thời gian:** Tự động phát hiện khi tài khoản đã đủ hạn ngạch tìm kiếm để dừng ngay lập tức, không spam tốn tài nguyên máy.
