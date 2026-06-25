# Software Requirements Specification (SRS)

**Sistem:** BAPENDA.HUB — Portal Pajak Daerah Kota Medan  
**Versi:** 1.0  
**Status:** Final  

---

## 1. Pendahuluan

### 1.1 Latar Belakang

Pemerintah Kota Medan melalui Badan Pendapatan Daerah (BAPENDA) mengelola penerimaan Pajak Bumi dan Bangunan Perdesaan dan Perkotaan (PBB-P2) serta pajak daerah lainnya. Proses pengelolaan yang masih manual menyebabkan inefisiensi dalam pendataan, pembayaran, dan pelaporan. BAPENDA.HUB hadir sebagai solusi digital terintegrasi untuk memodernisasi seluruh layanan perpajakan daerah.

### 1.2 Tujuan Sistem

1. Menyediakan platform digital terpadu untuk layanan perpajakan daerah
2. Mempermudah wajib pajak dalam mengecek tagihan, membayar pajak, dan mengunduh SPPT
3. Meningkatkan transparansi dan akuntabilitas pengelolaan pajak daerah
4. Mempercepat proses administrasi perpajakan
5. Menyediakan data analitik untuk pengambilan keputusan

### 1.3 Ruang Lingkup

Sistem mencakup:
- Manajemen pengguna multi-role (Super Admin, Admin, Petugas, Wajib Pajak)
- Manajemen objek pajak berbasis GIS
- Pembayaran pajak online via Midtrans
- Penerbitan SPPT digital
- Pengajuan dan pengaduan online
- CMS berita dan pengumuman
- Asisten digital (chatbot) perpajakan
- Notifikasi real-time
- Sistem Informasi Geografis pemetaan pajak
- Dashboard analitik dan monitoring

### 1.4 Definisi dan Istilah

| Istilah | Definisi |
|---------|----------|
| BAPENDA | Badan Pendapatan Daerah |
| PBB-P2 | Pajak Bumi dan Bangunan Perdesaan dan Perkotaan |
| SPPT | Surat Pemberitahuan Pajak Terutang |
| NOP | Nomor Objek Pajak |
| NJOP | Nilai Jual Objek Pajak |
| NJOPTKP | Nilai Jual Objek Tidak Kena Pajak |
| NPWPD | Nomor Pokok Wajib Pajak Daerah |
| SIPADA | Sistem Informasi Pajak Daerah |
| WP | Wajib Pajak |
| PPID | Pejabat Pengelola Informasi dan Dokumentasi |
| GIS | Geographic Information System |

---

## 2. Gambaran Umum Sistem

### 2.1 Arsitektur Sistem

Sistem menggunakan arsitektur **Server-Side Rendering (SSR)** dengan Next.js App Router. Database PostgreSQL dikelola via Prisma ORM. Autentikasi menggunakan NextAuth dengan JWT strategy. Deployment pada platform Railway.

### 2.2 Actor / User Role

| Role | Deskripsi |
|------|-----------|
| SUPER ADMIN (DEVELOPER) | Akses penuh ke seluruh sistem, manajemen pengguna, audit log |
| ADMIN | Manajemen objek pajak, pengajuan, pembayaran, CMS |
| OFFICER (PETUGAS) | Pendataan lapangan, penilaian objek, verifikasi |
| USER (WAJIB PAJAK) | Cek tagihan, bayar pajak, unduh SPPT, pengajuan, pengaduan |
| MAHASISWA | Sama dengan USER, akses riset |

### 2.3 Modul Sistem

1. **Autentikasi & Manajemen Pengguna** — Login, register, profile, role management
2. **Objek Pajak** — CRUD objek pajak, pencarian NOP, GIS mapping
3. **Pembayaran** — Tagihan, integrasi Midtrans, riwayat
4. **SPPT Digital** — Penerbitan, unduh, riwayat SPPT
5. **Pengajuan** — Keberatan, perubahan data, pelacakan status
6. **Pengaduan** — Laporan kendala, tanggapan petugas
7. **CMS** — Berita, pengumuman, konten statis
8. **Chatbot** — Asisten digital perpajakan
9. **Notifikasi** — Notifikasi sistem dan dashboard
10. **PPID** — Permohonan informasi publik
11. **Riset Mahasiswa** — Pengajuan riset
12. **GIS** — Pemetaan objek pajak, zonasi nilai tanah
13. **Dashboard Analitik** — Statistik, grafik, monitoring

---

## 3. Functional Requirements

### FR-01: Manajemen Pengguna
| ID | Deskripsi |
|----|-----------|
| FR-01.1 | Sistem harus menyediakan registrasi pengguna baru dengan NIK, Email, dan Password |
| FR-01.2 | Sistem harus menyediakan login dengan email dan password |
| FR-01.3 | Sistem harus mendukung role-based access control |
| FR-01.4 | Super Admin dapat mengelola (CRUD) seluruh pengguna |
| FR-01.5 | Pengguna dapat mengedit profil sendiri |
| FR-01.6 | Sistem harus menyediakan reset password |

### FR-02: Manajemen Objek Pajak
| ID | Deskripsi |
|----|-----------|
| FR-02.1 | Admin dapat menambahkan objek pajak baru |
| FR-02.2 | Setiap objek pajak memiliki NOP unik 18 digit |
| FR-02.3 | Objek pajak memiliki data: nama, alamat, luas tanah, luas bangunan, NJOP |
| FR-02.4 | Objek pajak dapat dipetakan dalam GIS |
| FR-02.5 | Wajib Pajak dapat melihat objek pajak miliknya |

### FR-03: Pembayaran Pajak
| ID | Deskripsi |
|----|-----------|
| FR-03.1 | Sistem menampilkan tagihan aktif wajib pajak |
| FR-03.2 | Pembayaran dapat dilakukan via Midtrans (VA, E-Wallet, QRIS) |
| FR-03.3 | Status pembayaran terupdate otomatis via webhook |
| FR-03.4 | Wajib Pajak dapat melihat riwayat pembayaran |
| FR-03.5 | Notifikasi dikirim saat pembayaran berhasil/gagal |

### FR-04: SPPT Digital
| ID | Deskripsi |
|----|-----------|
| FR-04.1 | Sistem menerbitkan SPPT digital untuk setiap objek pajak |
| FR-04.2 | SPPT dapat diunduh dalam format PDF |
| FR-04.3 | Wajib Pajak dapat melihat riwayat SPPT per tahun pajak |

### FR-05: Pengajuan
| ID | Deskripsi |
|----|-----------|
| FR-05.1 | Wajib Pajak dapat mengajukan keberatan pajak |
| FR-05.2 | Wajib Pajak dapat mengajukan perubahan data objek |
| FR-05.3 | Status pengajuan dapat dilacak (pending, diproses, disetujui, ditolak) |
| FR-05.4 | Admin dapat memproses dan memberikan tanggapan |

### FR-06: Pengaduan
| ID | Deskripsi |
|----|-----------|
| FR-06.1 | Wajib Pajak dapat membuat pengaduan |
| FR-06.2 | Pengaduan memiliki kategori: Pelayanan, Teknis Sistem, Pajak, Petugas |
| FR-06.3 | Status pengaduan dapat dilacak |
| FR-06.4 | Petugas dapat merespon pengaduan |

### FR-07: CMS (Content Management System)
| ID | Deskripsi |
|----|-----------|
| FR-07.1 | Admin dapat membuat, mengedit, menghapus berita |
| FR-07.2 | Admin dapat membuat, mengedit, menghapus pengumuman |
| FR-07.3 | Berita dan pengumuman tampil di halaman publik |
| FR-07.4 | Konten memiliki kategori dan status aktif/non-aktif |

### FR-08: Chatbot
| ID | Deskripsi |
|----|-----------|
| FR-08.1 | Chatbot tersedia di seluruh halaman aplikasi |
| FR-08.2 | Chatbot dapat menjawab pertanyaan umum perpajakan |
| FR-08.3 | Chatbot dapat menampilkan data personal (tagihan, SPPT) jika sudah login |
| FR-08.4 | Chatbot menyediakan quick action buttons |
| FR-08.5 | Chatbot role-aware (respons berbeda tiap role) |
| FR-08.6 | Riwayat percakapan tersimpan di database |

### FR-09: Notifikasi
| ID | Deskripsi |
|----|-----------|
| FR-09.1 | Notifikasi dikirim saat pembayaran berhasil |
| FR-09.2 | Notifikasi dikirim saat SPPT diterbitkan |
| FR-09.3 | Notifikasi dikirim saat pengajuan diproses |
| FR-09.4 | Notifikasi dikirim saat pengaduan ditanggapi |
| FR-09.5 | Pengguna dapat menandai notifikasi sebagai sudah dibaca |

### FR-10: GIS & Pemetaan
| ID | Deskripsi |
|----|-----------|
| FR-10.1 | Objek pajak ditampilkan dalam peta interaktif |
| FR-10.2 | Zonasi nilai tanah dapat divisualisasikan |
| FR-10.3 | Data properti pasar dapat ditampilkan |
| FR-10.4 | Filter dan pencarian spasial tersedia |

### FR-11: Dashboard & Analitik
| ID | Deskripsi |
|----|-----------|
| FR-11.1 | Dashboard menampilkan ringkasan data pengguna |
| FR-11.2 | Admin melihat statistik pembayaran dan pengajuan |
| FR-11.3 | Super Admin melihat audit log dan monitoring sistem |

### FR-12: PPID & Informasi Publik
| ID | Deskripsi |
|----|-----------|
| FR-12.1 | Pengguna dapat mengajukan permohonan informasi publik |
| FR-12.2 | Permohonan diproses oleh petugas PPID |
| FR-12.3 | Status permohonan dapat dilacak |

---

## 4. Non-Functional Requirements

| ID | Kategori | Deskripsi |
|----|----------|-----------|
| NFR-01 | Performance | Waktu muat halaman < 3 detik |
| NFR-02 | Performance | API response time < 500ms |
| NFR-03 | Security | Semua password di-hash dengan bcrypt |
| NFR-04 | Security | Session menggunakan JWT dengan expiry |
| NFR-05 | Security | Input harus divalidasi di client dan server |
| NFR-06 | Security | Proteksi terhadap SQL injection via Prisma ORM |
| NFR-07 | Security | Proteksi terhadap XSS via sanitasi input |
| NFR-08 | Availability | Sistem tersedia 99.5% (kecuali maintenance) |
| NFR-09 | Scalability | Mendukung minimal 10.000 pengguna simultan |
| NFR-10 | Usability | Antarmuka responsif (desktop & mobile) |
| NFR-11 | Usability | Bahasa Indonesia untuk seluruh antarmuka |
| NFR-12 | Maintainability | Kode menggunakan TypeScript strict |
| NFR-13 | Maintainability | Dokumentasi API lengkap |
| NFR-14 | Compliance | Mematuhi UU ITE dan regulasi perpajakan |
| NFR-15 | Data Integrity | Seluruh transaksi menggunakan database transaction |

---

## 5. Business Rules

| ID | Aturan |
|----|--------|
| BR-01 | Setiap objek pajak harus memiliki NOP unik |
| BR-02 | Satu NIK hanya dapat mendaftar satu akun |
| BR-03 | Pembayaran PBB menggunakan tarif 0.3% dari NJOP kena pajak |
| BR-04 | NJOPTKP ditetapkan Rp 12.000.000 per wajib pajak |
| BR-05 | Denda keterlambatan 2% per bulan, maksimal 24% |
| BR-06 | Status pengajuan: PENDING → IN_PROGRESS → APPROVED/REJECTED |
| BR-07 | Status pengaduan: OPEN → IN_PROGRESS → RESOLVED/CLOSED |
| BR-08 | Hanya admin yang dapat menerbitkan SPPT |
| BR-09 | Chatbot hanya menampilkan data milik pengguna yang login |

---

## 6. Security Requirements

| ID | Deskripsi |
|----|-----------|
| SR-01 | Autentikasi menggunakan NextAuth dengan JWT |
| SR-02 | Role-based access control pada setiap endpoint API |
| SR-03 | Server-side session validation |
| SR-04 | Rate limiting pada endpoint kritis (chatbot, login) |
| SR-05 | Input sanitasi pada semua input pengguna |
| SR-06 | Validasi tipe data di server |
| SR-07 | CORS configuration terbatas |
| SR-08 | Environment variable untuk secrets |

---

## 7. Performance Requirements

| Metrik | Target |
|--------|--------|
| Time to First Byte | < 800ms |
| API Response Time | < 500ms (p95) |
| Database Query Time | < 200ms |
| Concurrent Users | 10.000 |
| Chatbot Response | < 2 detik |
| File Upload Size | Maks 8MB (dokumen), 4MB (gambar) |
| Uptime | 99.5% |

---

## 8. Integration Requirements

| Integrasi | Tujuan | Metode |
|-----------|--------|--------|
| Midtrans Snap | Pembayaran online | REST API + Webhook |
| UploadThing | File upload | SDK + API Route |
| Neon PostgreSQL | Database | Prisma ORM |
| Railway | Hosting & Deployment | CLI + Git |

---

## 9. Future Development Requirements

| ID | Fitur | Prioritas |
|----|-------|-----------|
| FD-01 | Integrasi WhatsApp untuk notifikasi | Medium |
| FD-02 | Aplikasi mobile (React Native) | High |
| FD-03 | E-Tanda Tangan digital | Medium |
| FD-04 | Machine Learning untuk prediksi pajak | Low |
| FD-05 | Integrasi SIAK (kependudukan) | High |
| FD-06 | Dashboard real-time dengan WebSocket | Medium |
| FD-07 | Multi-bahasa (Inggris) | Low |
| FD-08 | OCR untuk upload SPPT fisik | Low |
