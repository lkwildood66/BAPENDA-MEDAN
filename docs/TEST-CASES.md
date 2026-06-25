# Test Cases

**Sistem:** BAPENDA.HUB — Portal Pajak Daerah Kota Medan

---

## 1. Chatbot Tests

### 1.1 Unit Test — Intent Matching
| ID | Input | Expected Intent | Kondisi |
|----|-------|----------------|---------|
| TC-CH-01 | "halo" | salam | Guest |
| TC-CH-02 | "siang" | salam | Guest |
| TC-CH-03 | "berita terbaru" | info_berita | Guest |
| TC-CH-04 | "info pajak daerah" | jenis_pajak_daerah | Guest |
| TC-CH-05 | "tarif pajak" | tarif_pajak | Guest |
| TC-CH-06 | "denda telat bayar" | denda | Guest |
| TC-CH-07 | "alamat bapenda" | alamat_kontak | Guest |
| TC-CH-08 | "tagihan saya" | tagihan | USER |
| TC-CH-09 | "cekTAGIHAN" | tagihan | USER |
| TC-CH-10 | "sppt 2025" | sppt | USER |
| TC-CH-11 | "bayar pajak" | bayar_pajak | USER |
| TC-CH-12 | "random text" | tidak_diketahui | Guest |
| TC-CH-13 | "" (empty) | 400 error | Guest |
| TC-CH-14 | "a".repeat(1001) | 400 error | Guest |

### 1.2 Integration Test — Chatbot API
| ID | Skenario | Langkah | Hasil |
|----|----------|---------|-------|
| TC-CH-15 | Guest bertanya info | POST /api/chatbot {message:"tarif pajak"} | 200, response text about tariffs |
| TC-CH-16 | Guest cek tagihan (tanpa login) | POST /api/chatbot {message:"tagihan saya"} | 200, response dengan login prompt |
| TC-CH-17 | User login cek tagihan | POST dengan session aktif, message "tagihan" | 200, data tagihan user |
| TC-CH-18 | Spam detection | 10 fast requests same message text | Rate limited at 429 |
| TC-CH-19 | Role-based response | USER bertanya "pendataan" | 200, response "akses khusus petugas" |
| TC-CH-20 | OFFICER cek lokasi objek | OFFICER login, "lokasi objek pajak" | 200, data objek pajak |

### 1.3 UI Test — Chatbot Widget
| ID | Skenario | Langkah | Ekspektasi |
|----|----------|---------|------------|
| TC-CH-UI-01 | Buka chatbot | Klik floating button | Panel terbuka dari kanan/bawah |
| TC-CH-UI-02 | Tutup chatbot | Klik [✕] | Panel tertutup |
| TC-CH-UI-03 | Kirim pesan | Ketik + Enter | Message muncul, typing indicator, response |
| TC-CH-UI-04 | Klik suggestion | Klik chip suggestion | Chip terkirim sebagai message |
| TC-CH-UI-05 | Empty state | Hapus semua history | Tampilkan empty state |
| TC-CH-UI-06 | Scroll otomatis | Kirim pesan baru | Scroll smooth ke bawah |
| TC-CH-UI-07 | Badge notifikasi | Ada pesan baru | Badge muncul di floating button |

---

## 2. Authentication Tests

| ID | Skenario | Langkah | Hasil |
|----|----------|---------|-------|
| TC-AUTH-01 | Register baru | Isi form registrasi valid | 201, redirect login |
| TC-AUTH-02 | Register duplikat email | Email sudah terdaftar | Error "email sudah digunakan" |
| TC-AUTH-03 | Register NIK invalid | NIK < 16 digit | Error validasi |
| TC-AUTH-04 | Login valid | Email + password benar | Redirect dashboard sesuai role |
| TC-AUTH-05 | Login invalid | Password salah | Error "email atau password salah" |
| TC-AUTH-06 | Akses tanpa login | Buka /dashboard | Redirect ke /login |
| TC-AUTH-07 | Akses admin sbg USER | Buka /admin | Redirect 403 |
| TC-AUTH-08 | Session expired | Login, tunggu > 24 jam | Redirect login |

---

## 3. Payment Tests

| ID | Skenario | Langkah | Hasil |
|----|----------|---------|-------|
| TC-PAY-01 | Init payment valid | Pilih tagihan → bayar | Redirect Midtrans Snap |
| TC-PAY-02 | Payment success | Bayar via Midtrans → webhook | Status PAID, notifikasi user |
| TC-PAY-03 | Payment failed | Bayar gagal | Status FAILED |
| TC-PAY-04 | Webhook invalid | Request tanpa signature valid | 401 Unauthorized |
| TC-PAY-05 | Bayar tagihan lunas | Coba bayar tagihan PAID | Error "tagihan sudah lunas" |

---

## 4. CMS Tests

| ID | Skenario | Langkah | Hasil |
|----|----------|---------|-------|
| TC-CMS-01 | Admin buat berita | Isi form, upload gambar, publish | 201, berita muncul di publik |
| TC-CMS-02 | Unpublish berita | Set isActive = false | Berita tidak muncul di publik |
| TC-CMS-03 | Guest lihat berita | GET /api/news | 200, daftar berita aktif |
| TC-CMS-04 | Edit berita | Admin edit judul | 200, slug otomatis update |

---

## 5. Role Access Tests

| ID | Skenario | Role | Hasil |
|----|----------|------|-------|
| TC-ROLE-01 | Akses developer panel | DEVELOPER | ✅ Allow |
| TC-ROLE-02 | Akses developer panel | ADMIN | ❌ Denied |
| TC-ROLE-03 | Akses admin panel | ADMIN | ✅ Allow |
| TC-ROLE-04 | Akses admin panel | OFFICER | ❌ Denied |
| TC-ROLE-05 | Akses officer panel | OFFICER | ✅ Allow |
| TC-ROLE-06 | Akses officer panel | USER | ❌ Denied |
| TC-ROLE-07 | Buat pengajuan | USER | ✅ Allow |
| TC-ROLE-08 | Buat pengajuan | MAHASISWA | ❌ Denied |

---

## 6. Performance Tests

| ID | Skenario | Target | Metrik |
|----|----------|--------|--------|
| TC-PERF-01 | Chatbot response time | < 2s | API response time (excl network) |
| TC-PERF-02 | Page load (LCP) | < 2.5s | Lighthouse LCP score |
| TC-PERF-03 | Database query index | < 100ms | Query execution time (Prisma) |
| TC-PERF-04 | Rate limit accuracy | 10 req/15m per IP | Hit 11th req → 429 |

---

## 7. Security Tests

| ID | Skenario | Langkah | Hasil |
|----|----------|---------|-------|
| TC-SEC-01 | XSS in chat | Input `<script>alert(1)</script>` | Escaped, rendered as text |
| TC-SEC-02 | SQL injection | Input `'; DROP TABLE--` | Parameterized query, no effect |
| TC-SEC-03 | CSRF mutation | Request from external site | Token invalid, 403 |
| TC-SEC-04 | Rate limit IP spam | 100 requests/min | 429 after threshold |
| TC-SEC-05 | Unauthorized API | Direct GET /api/ppid | 401 |
| TC-SEC-06 | Directory traversal | Input ../../../etc/passwd | Sanitized |

---

## 8. Mobile Responsiveness Tests

| ID | Viewport | Halaman | Ekspektasi |
|----|----------|---------|------------|
| TC-MOB-01 | 375×812 (iPhone) | Landing | Layout single column, bottom nav |
| TC-MOB-02 | 375×812 | Dashboard | Sidebar jadi bottom nav tabs |
| TC-MOB-03 | 375×812 | Tabel | Horizontal scroll / card layout |
| TC-MOB-04 | 768×1024 (iPad) | Landing | Grid 2 kolom |
| TC-MOB-05 | 768×1024 | Chatbot | Panel half-screen |
| TC-MOB-06 | 1440×900 | All pages | Max-width 1280px centered |
