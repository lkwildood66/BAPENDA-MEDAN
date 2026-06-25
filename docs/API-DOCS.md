# API Documentation

**Sistem:** BAPENDA.HUB — Portal Pajak Daerah Kota Medan  
**Base URL (Dev):** `http://localhost:3000`  
**Base URL (Prod):** `https://bapenda-medan.vercel.app`

---

## 1. Chatbot API

### POST /api/chatbot

Chatbot endpoint untuk menangani semua pertanyaan pengguna.

**Authentication:** Tidak diperlukan (namun response data personal membutuhkan session aktif)

**Rate Limit:** 10 requests per 15 menit per IP

**Request Body:**
```json
{
  "message": "string (wajib, 1-1000 karakter)",
  "sessionId": "string (opsional, untuk melanjutkan sesi)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "intent": "tagihan | bayar_pajak | sppt | ...",
    "response": {
      "text": "string (jawaban)",
      "suggestions": ["string", "string", ...]
    }
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Pesan tidak boleh kosong"
}
```

**Response (429):**
```json
{
  "success": false,
  "error": "Terlalu banyak permintaan. Silakan coba lagi nanti."
}
```

**Intent List:**

| Intent | Akses | Deskripsi |
|--------|-------|-----------|
| `salam` | Guest | Sapaan awal |
| `info_berita` | Guest | Berita terbaru dari database |
| `info_pengumuman` | Guest | Pengumuman terbaru dari database |
| `tarif_pajak` | Guest | Info tarif PBB, BPHTB, PKB |
| `denda` | Guest | Info denda keterlambatan |
| `npwpd` | Guest | Cara daftar NPWPD |
| `keberatan` | Guest | Prosedur keberatan pajak |
| `jenis_pajak_daerah` | Guest | Jenis-jenis pajak daerah |
| `alamat_kontak` | Guest | Alamat & kontak BAPENDA |
| `website_medsos` | Guest | Website & media sosial |
| `tagihan` | USER/MAHASISWA | Cek tagihan pajak user |
| `bayar_pajak` | USER | Cara & link bayar pajak |
| `sppt` | USER | Cek SPPT user |
| `pengajuan` | USER | Cek status pengajuan |
| `pengaduan` | USER | Buat pengaduan |
| `ppid` | USER | Info & link PPID |
| `lokasi_objek` | OFFICER | Data lokasi objek pajak |
| `pendataan` | OFFICER | Tugas pendataan |
| `penilaian` | OFFICER | Input penilaian |
| `kelola_pengguna` | ADMIN | Dashboard manajemen |
| `kelola_pengajuan` | ADMIN | Review pengajuan |
| `kelola_cms` | ADMIN | Kelola konten |
| `monitoring` | DEVELOPER | Statistik & log |
| `tidak_diketahui` | Guest | Fallback |

**Example Request:**
```bash
curl -X POST https://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "berapa tagihan pajak saya"}'
```

**Example Response (Authenticated):**
```json
{
  "success": true,
  "data": {
    "intent": "tagihan",
    "response": {
      "text": "Berikut tagihan pajak Anda, *Budi Santoso*:\n\n🏠 **Objek Pajak:** Rumah Tinggal Jl. Merdeka No. 10\n📋 **NOP:** 12.71.123.456.789-0123.4\n💰 **Total Tagihan:** Rp 2.450.000\n📅 **Jatuh Tempo:** 30 September 2026\n\n💡 *Silakan lakukan pembayaran sebelum jatuh tempo untuk menghindari denda.*",
      "suggestions": ["Bayar Sekarang", "Lihat SPPT", "Kembali ke Menu"]
    }
  }
}
```

---

## 2. Authentication API

### POST /api/auth/login

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):** Redirect ke dashboard sesuai role

### POST /api/auth/register

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (min 6)",
  "nik": "string (16 digit)",
  "phone": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil. Silakan login."
}
```

---

## 3. Payment API

### POST /api/payment/init

**Authentication:** Required (USER, ADMIN)

**Request Body:**
```json
{
  "paymentId": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "redirectUrl": "https://app.midtrans.com/snap/v4/redirection/..."
  }
}
```

### POST /api/payment/webhook

**Authentication:** Signature verification

**Request Body:** Midtrans notification payload

**Response (200):**
```json
{
  "success": true
}
```

---

## 4. CMS API

### GET /api/news

**Authentication:** Tidak diperlukan

**Query Parameters:**
| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| page | Int (opsional) | Halaman (default 1) |
| limit | Int (opsional) | Per halaman (default 10) |
| category | String (opsional) | Filter kategori |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "news": [
      {
        "id": "string",
        "title": "string",
        "slug": "string",
        "summary": "string",
        "image": "string?",
        "category": "string",
        "createdAt": "ISO datetime"
      }
    ],
    "total": 0,
    "page": 1,
    "totalPages": 1
  }
}
```

### GET /api/announcements

Sama seperti /api/news, untuk pengumuman.

### POST /api/admin/news (Admin only)

**Authentication:** Required (ADMIN, DEVELOPER)

**Request Body:**
```json
{
  "title": "string",
  "summary": "string",
  "content": "string (rich text)",
  "category": "string",
  "image": "string? (URL dari UploadThing)"
}
```

---

## 5. Tax Object API

### GET /api/tax-objects

**Authentication:** Required

**Query Parameters:**
| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| search | String (opsional) | Cari NOP/nama |
| page | Int (opsional) | Halaman |
| limit | Int (opsional) | Limit |

### GET /api/tax-objects/[nop]

**Authentication:** Required (USER: only own, ADMIN: all)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "nop": "12.71.123.456.789-0123.4",
    "type": "PBB",
    "name": "Rumah Tinggal",
    "address": "Jl. Merdeka No. 10, Medan",
    "luasTanah": 120,
    "luasBangun": 80,
    "njop": 250000000,
    "location": { "lat": 3.5951, "lng": 98.6788 }
  }
}
```

---

## 6. Error Codes

| HTTP Code | Deskripsi |
|-----------|-----------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validasi gagal) |
| 401 | Unauthorized (belum login) |
| 403 | Forbidden (role tidak sesuai) |
| 404 | Not Found |
| 429 | Rate Limit |
| 500 | Internal Server Error |

### Standard Error Response:
```json
{
  "success": false,
  "error": "String deskripsi error"
}
```

---

## 7. API Security Notes

- Semua endpoint kecuali public menggunakan NextAuth session check
- CSRF protection aktif untuk semua mutasi
- Webhook Midtrans diverifikasi via signature HMAC-SHA512
- Input di-escape sebelum disimpan ke database (Prisma prepared statements)
- File upload melewati UploadThing (tidak langsung ke server)
