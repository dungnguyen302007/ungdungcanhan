# 💰 Quản Lý Chi Tiêu Cá Nhân

Ứng dụng web hiện đại giúp quản lý thu chi cá nhân với giao diện đẹp mắt và tính năng đồng bộ đám mây.

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://dungnguyen302007.github.io/ungdungcanhan/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7-orange.svg)](https://firebase.google.com/)

![App Screenshot](https://via.placeholder.com/800x400/FFE4E6/333333?text=Ứng+Dụng+Quản+Lý+Chi+Tiêu)

## ✨ Tính Năng

- 📊 **Dashboard trực quan** - Xem tổng quan thu chi, số dư hiện tại
- 💸 **Quản lý giao dịch** - Thêm, sửa, xóa các khoản thu/chi
- 📁 **Phân loại chi tiêu** - 8 danh mục sẵn có (Ăn uống, Nhà ở, Y tế, v.v.)
- 📈 **Thống kê & biểu đồ** - Phân tích xu hướng chi tiêu theo tháng
- 🔄 **Đồng bộ đám mây** - Dữ liệu lưu trên Firebase Firestore
- 🎨 **Giao diện đẹp mắt** - Pink gradient background, animations mượt mà
- 🔢 **Định dạng số tiền** - Hiển thị dễ đọc với dấu phân cách hàng nghìn
- 📱 **Responsive** - Hoạt động tốt trên mọi thiết bị

## 🚀 Công Nghệ Sử Dụng

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 7** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library
- **Recharts** - Chart library
- **React Hot Toast** - Notifications

### State Management
- **Zustand** - Lightweight state management
- **Zustand Persist** - Local storage persistence

### Backend & Database
- **Firebase Auth** - Authentication (Google Sign-in)
- **Firebase Firestore** - NoSQL database

### Utilities
- **date-fns** - Date manipulation
- **clsx + tailwind-merge** - Conditional styling

## 📦 Cài Đặt

### Prerequisites
- Node.js 18+ 
- npm hoặc yarn

### Bướ cài đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/dungnguyen302007/ungdungcanhan.git
   cd ungdungcanhan
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Cấu hình Firebase**
   
   a. Tạo file `.env` từ template:
   ```bash
   cp .env.example .env
   ```
   
   b. Cập nhật `.env` với Firebase credentials của bạn:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   # ... các biến khác
   ```

4. **Chạy development server**
   ```bash
   npm run dev
   ```
   
   Mở [http://localhost:5173](http://localhost:5173) để xem ứng dụng.

## 🛠️ Commands

| Command | Mô tả |
|---------|-------|
| `npm run dev` | Chạy dev server với HMR |
| `npm run build` | Build cho production |
| `npm run preview` | Preview production build |
| `npm run lint` | Chạy ESLint |
| `npm run deploy` | Deploy lên GitHub Pages |

## 📁 Cấu Trúc Thư Mục

```
src/
├── components/        # React components
│   ├── Analytics/    # Biểu đồ & thống kê
│   ├── Auth/         # Login/Authentication
│   ├── Dashboard/    # Overview cards
│   ├── Layout/       # Header, AppShell, Navigation
│   └── Transactions/ # Form & list giao dịch
├── hooks/             # Custom React hooks
├── lib/               # External integrations (Firebase)
├── store/             # Zustand stores
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
│   ├── analytics.ts  # Tính toán thống kê
│   ├── format.ts     # Format currency & date
│   └── ...
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## 🎯 Workflow Development

1. Tạo branch mới cho feature:
   ```bash
   git checkout -b feature/ten-feature
   ```

2. Thực hiện thay đổi và commit:
   ```bash
   git add .
   git commit -m "feat: mô tả ngắn gọn"
   ```

3. Push và tạo Pull Request:
   ```bash
   git push origin feature/ten-feature
   ```

4. Sau khi merge, deploy tự động lên GitHub Pages.

## 🌐 Deployment

### GitHub Pages

Dự án đã được cấu hình deploy tự động lên GitHub Pages:

```bash
npm run deploy
```

Live URL: [https://dungnguyen302007.github.io/ungdungcanhan/](https://dungnguyen302007.github.io/ungdungcanhan/)

## 📝 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👨‍💻 Tác Giả

**Dung Nguyen**

- GitHub: [@dungnguyen302007](https://github.com/dungnguyen302007)

## 🙏 Acknowledgments

- Design inspiration from modern fintech apps
- Firebase for backend infrastructure
- Vite team for amazing developer experience

---

**Made with ❤️ by Dung Nguyen**
