# BPH SHOP React + Vite Project Setup Guide

Panduan ini membantu Anda menjalankan project BPH SHOP React dengan Vite versi **7.2.6** dan Node / npm versi **10.9.0+**.

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
git clone https://github.com/AchmadSu/bph-shop-frontend
cd bph-shop-frontend
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
## Integrasi dengan Laravel API
Jangan lupa untuk menjalankan project Laravel BPH Shop, dapat anda lihat rinciannya melalui tautan berikut:

🔗 https://github.com/AchmadSu/bph-shop/blob/main/README.md

## 🎉 Selesai
Project React + Vite berhasil dijalankan.
Project BPH SHOP berhasil dijalankan. Jika terjadi error atau butuh penjelasan tambahan, silakan cek dokumentasi React Vite atau hubungi melalui: 

📩 Email: ecepentis@gmail.com

💬 WhatsApp: wa.me/6289658420438
