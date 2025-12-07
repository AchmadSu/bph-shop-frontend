# React + Vite Project Setup Guide

Panduan ini membantu Anda menjalankan project React dengan Vite versi **7.2.6** dan Node / npm versi **10.9.0+**.

---

## 📌 Prasyarat
Pastikan perangkat Anda sudah terinstall:

- **Node.js** minimal versi `18+`
- **npm** minimal versi `10.9.0`

Cek versi dengan perintah berikut:
```bash
node -v
npm -v
```

---

## 📥 Clone / Pull Repository
Jika belum clone repository:
```bash
git clone <repository-url>
cd <project-folder>
```
Jika sudah dan ingin update:
```bash
git pull origin main
```

---

## 📦 Install Dependencies
Jalankan perintah berikut:
```bash
npm install
```
Jika ada error dependency, bisa coba:
```bash
npm install --force
```

---

## ⚙️ Konfigurasi Environment
Jika project menyediakan file `.env.example`, lakukan langkah berikut:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi API, Base URL, atau environment lain sesuai kebutuhan.

---

## 🚀 Menjalankan Development Server
Untuk menjalankan Vite development server:
```bash
npm run dev
```
Secara default akan berjalan pada:
```
http://localhost:5173/
```

Jika port sudah digunakan, Anda dapat menentukan port lain:
```bash
npm run dev -- --port=3000
```

---

## 📦 Build untuk Production
Untuk build aplikasi:
```bash
npm run build
```
Output build biasanya ada pada folder `dist/`.

Jika ingin melakukan preview build sebelum deploy:
```bash
npm run preview
```

---

## 🔧 Troubleshooting
| Masalah | Solusi |
|--------|--------|
| `npm install` error | Gunakan `npm install --legacy-peer-deps` atau update Node.js |
| Port conflict / server tidak jalan | Jalankan `npm run dev -- --port=3001` |
| Error modul tidak ditemukan | Jalankan `npm install` kembali atau `rm -rf node_modules && npm install` |

---

## 🧪 Optional Scripts
Jika ada script tambahan dalam `package.json`, jalankan dengan format:
```bash
npm run <script-name>
```

---

## 🔗 Integrasi API dengan Backend (Laravel, Node, dll.)
Jika aplikasi ini menggunakan backend API (misalnya Laravel, Express, NestJS, dll.), pastikan Anda:

### 1️⃣ Menentukan Base URL API
Atur base URL di file `.env`:
```
VITE_API_URL=http://localhost:8000/api
```
*Gunakan URL deploy (misalnya VPS atau domain) saat production.*

---

### 2️⃣ Contoh Pemanggilan API (Axios)
Jika project ini menggunakan Axios, buat file API helper, contoh:
```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true // opsional untuk auth berbasis cookie
});

export default api;
```

Penggunaan:
```javascript
const response = await api.get("/products");
console.log(response.data);
```

---

### 3️⃣ Handling Authentication
Jika backend menggunakan JWT, Sanctum, atau token-based authentication:
```javascript
const login = async () => {
  const response = await api.post("/login", {
    email,
    password
  });

  localStorage.setItem("token", response.data.token);
  api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
};
```

---

### 4️⃣ Integrasi Secure Cookie (Jika backend pakai Sanctum / HttpOnly)
Tambahkan konfigurasi credential:
```javascript
axios.defaults.withCredentials = true;
```
Dan pastikan backend sudah mengizinkan CORS.

---

## 🎉 Selesai
Project React + Vite berhasil dijalankan.
Jika mengalami error atau butuh bantuan, bisa hubungi tim developer atau cek dokumentasi Vite:
https://vite.dev

