# Product Requirements Document (PRD)

**Produk:** BAPENDA.HUB — Portal Pajak Daerah Kota Medan  
**Versi:** 1.0  
**Status:** Final  

---

## 1. Product Vision

**Vision Statement:**  
Menjadi platform digital perpajakan daerah terdepan yang memberikan pengalaman pelayanan publik modern, transparan, dan efisien bagi seluruh wajib pajak di Kota Medan.

**Tagline:**  
*"Pajak Mudah, Medan Maju"*

## 2. Product Goals

1. **Digitalisasi Layanan**: Mengalihkan 80% layanan perpajakan dari offline ke online dalam 1 tahun
2. **Peningkatan Kepatuhan**: Meningkatkan kepatuhan wajib pajak melalui kemudahan akses dan transparansi
3. **Efisiensi Internal**: Mengurangi waktu pemrosesan administrasi sebesar 60%
4. **Transparansi**: Menyediakan data dan informasi publik secara real-time
5. **Integrasi**: Menghubungkan seluruh stakeholder perpajakan dalam satu platform

## 3. Problem Statement

| Problem | Dampak | Solusi |
|---------|--------|--------|
| Wajib pajak kesulitan mengecek tagihan | Keterlambatan pembayaran, denda | Dashboard tagihan real-time |
| Proses pembayaran manual | Antrean panjang, waktu terbuang | Pembayaran online multi-metode |
| SPPT fisik mudah hilang | Kesulitan administrasi | SPPT digital, unduh kapan saja |
| Pengajuan/keberatan tidak terlacak | Ketidakpastian status | Tracking system real-time |
| Data objek pajak tersebar | Validitas data rendah | GIS-integrated database |
| Kurangnya informasi pajak | Rendahnya literasi pajak | Chatbot, CMS, PPID |

## 4. Success Metrics

| Metrik | Target | Pengukuran |
|--------|--------|------------|
| Jumlah WP terdaftar | 10.000 dalam 6 bulan | Database user count |
| Transaksi pembayaran online | 5.000/bulan | Payment records |
| Waktu pembayaran rata-rata | < 5 menit | Analytics |
| Tingkat kepuasan pengguna | > 85% | Survey feedback |
| Pengaduan terselesaikan | > 90% dalam 3 hari | Complaint resolution rate |
| Adopsi SPPT digital | > 70% WP aktif | Download vs total |
| Chatbot resolution rate | > 80% | Chatbot analytics |

## 5. User Personas

### Persona 1: Budi — Wajib Pajak (USER)
- **Usia**: 45 tahun
- **Pekerjaan**: Pemilik toko kelontong
- **Tech Literacy**: Dasar (bisa WA, mobile banking)
- **Pain Points**: Ribet bayar pajak ke kantor, SPPT sering hilang
- **Goals**: Cek tagihan cepat, bayar dari rumah, unduh SPPT

### Persona 2: Siti — Petugas Lapangan (OFFICER)
- **Usia**: 32 tahun
- **Pekerjaan**: Petugas Pendataan BAPENDA
- **Tech Literacy**: Menengah
- **Pain Points**: Data objek pajak tidak update, koordinasi manual
- **Goals**: Input data lapangan mobile, tracking penilaian

### Persona 3: Ahmad — Admin BAPENDA (ADMIN)
- **Usia**: 38 tahun
- **Pekerjaan**: Staf Administrasi Perpajakan
- **Tech Literacy**: Mahir
- **Pain Points**: Overload pengajuan manual, laporan rumit
- **Goals**: Dashboard monitoring, rekap otomatis

### Persona 4: Dina — Kepala BAPENDA (SUPER ADMIN)
- **Usia**: 50 tahun
- **Pekerjaan**: Kepala Badan
- **Tech Literacy**: Dasar
- **Pain Points**: Sulit memonitor kinerja, data tersebar
- **Goals**: Dashboard eksekutif, audit trail

## 6. Feature List & Priority

| Fitur | Prioritas | MVP? | Kompleksitas |
|-------|-----------|------|--------------|
| Autentikasi & Manajemen User | P0 | ✅ | Medium |
| Dashboard Wajib Pajak | P0 | ✅ | Medium |
| Objek Pajak CRUD | P0 | ✅ | Medium |
| Pembayaran Midtrans | P0 | ✅ | High |
| SPPT Digital | P0 | ✅ | Medium |
| Pengajuan Online | P0 | ✅ | Medium |
| CMS Berita/Pengumuman | P0 | ✅ | Low |
| Chatbot | P0 | ✅ | Medium |
| Notifikasi | P0 | ✅ | Low |
| Pengaduan Online | P1 | ✅ | Medium |
| PPID | P1 | ✅ | Medium |
| GIS & Pemetaan | P1 | ❌ | High |
| Dashboard Admin | P1 | ✅ | Medium |
| Dashboard Eksekutif | P2 | ❌ | Medium |
| Riset Mahasiswa | P2 | ❌ | Low |
| Mobile App | P3 | ❌ | Very High |

## 7. Product Roadmap

### Fase 1 — MVP (Bulan 1-2)
- Autentikasi & Role Management
- Dashboard Wajib Pajak
- Objek Pajak CRUD
- Pembayaran via Midtrans
- SPPT Digital
- Pengajuan Online
- CMS Berita & Pengumuman

### Fase 2 — Enhanced (Bulan 3-4)
- Chatbot & Asisten Digital
- Notifikasi Sistem
- Pengaduan Online
- PPID
- Dashboard Admin

### Fase 3 — Advanced (Bulan 5-6)
- GIS & Pemetaan Interaktif
- Zonasi Nilai Tanah
- Riset Mahasiswa
- Audit Log & Monitoring
- Dashboard Eksekutif

### Fase 4 — Future
- Mobile App
- Integrasi SIAK & Dukcapil
- AI/ML untuk prediksi
- E-Tanda Tangan
- Multi-bahasa

## 8. Risks and Mitigation

| Risiko | Dampak | Probabilitas | Mitigasi |
|--------|--------|--------------|----------|
| Keamanan data pengguna | Tinggi | Rendah | Enkripsi, NextAuth, audit log |
| Downtime sistem | Tinggi | Rendah | Railway HA, monitoring, backup |
| Adopsi pengguna rendah | Medium | Medium | Sosialisasi, UI/UX sederhana |
| Integrasi Midtrans gagal | Tinggi | Rendah | Sandbox testing, fallback manual |
| Kinerja lambat | Medium | Medium | SSR, caching, query optimization |
| Konflik data NOP | Medium | Rendah | Unique constraint, validasi ketat |

## 9. Acceptance Criteria

| Fitur | Kriteria |
|-------|----------|
| Login | User dapat login dengan email+password, session valid |
| Cek Tagihan | WP melihat tagihan pending dengan jumlah dan jatuh tempo |
| Bayar Pajak | User memilih tagihan, diarahkan ke Midtrans, status terupdate |
| SPPT | User dapat melihat dan mengunduh SPPT digital |
| Chatbot | Chatbot menjawab pertanyaan, menampilkan data personal jika login |
| Notifikasi | Notifikasi muncul saat event tertentu terjadi |
| Dashboard | Menampilkan data real-time dengan grafik interaktif |
