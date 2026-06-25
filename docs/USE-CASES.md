# Use Case Diagram Documentation

**Sistem:** BAPENDA.HUB — Portal Pajak Daerah Kota Medan

---

## 1. Actor Definitions

| Actor | Role | Deskripsi |
|-------|------|-----------|
| **Wajib Pajak** | USER, MAHASISWA | Pengguna umum yang terdaftar, memiliki objek pajak |
| **Petugas** | OFFICER | Petugas lapangan BAPENDA untuk pendataan & penilaian |
| **Admin** | ADMIN | Staf administrasi BAPENDA |
| **Super Admin** | DEVELOPER | Kepala/pengelola sistem dengan akses penuh |
| **Pengunjung** | Guest | User belum login, akses terbatas |

---

## 2. Use Case: Super Admin

| ID | Use Case | Actor | Deskripsi |
|----|----------|-------|-----------|
| UC-SA-01 | Login Sistem | Super Admin | Autentikasi ke dalam sistem |
| UC-SA-02 | Kelola Pengguna | Super Admin | CRUD semua pengguna, aktivasi/non-aktifasi |
| UC-SA-03 | Lihat Statistik Sistem | Super Admin | Dashboard monitoring seluruh sistem |
| UC-SA-04 | Lihat Audit Log | Super Admin | Riwayat aktivitas seluruh pengguna |
| UC-SA-05 | Kelola Role | Super Admin | Ubah role pengguna |
| UC-SA-06 | Monitoring Kinerja | Super Admin | Laporan dan analitik sistem |

### UC-SA-01: Login Sistem
- **Trigger**: Super Admin membuka halaman login
- **Precondition**: Akun sudah terdaftar dengan role DEVELOPER
- **Main Flow**:
  1. Sistem menampilkan halaman login
  2. Admin memasukkan email dan password
  3. Sistem memvalidasi kredensial
  4. Sistem membuat session JWT
  5. Sistem mengarahkan ke dashboard Super Admin
- **Alternative Flow**: Email/password salah → tampilkan pesan error
- **Postcondition**: Session aktif, dashboard ditampilkan

### UC-SA-04: Lihat Audit Log
- **Trigger**: Super Admin memilih menu Audit Log
- **Precondition**: Sudah login sebagai DEVELOPER
- **Main Flow**:
  1. Super Admin membuka menu Audit Log
  2. Sistem menampilkan daftar log terbaru (action, user, timestamp)
  3. Admin dapat memfilter berdasarkan aksi, tanggal, atau user
  4. Admin dapat melihat detail perubahan (old/new value)
- **Postcondition**: Data audit log ditampilkan

---

## 3. Use Case: Admin

| ID | Use Case | Deskripsi |
|----|----------|-----------|
| UC-AD-01 | Login Sistem | Autentikasi sebagai ADMIN |
| UC-AD-02 | Kelola Objek Pajak | CRUD objek pajak, input NOP, NJOP |
| UC-AD-03 | Proses Pengajuan | Verifikasi dan review pengajuan WP |
| UC-AD-04 | Proses Pengaduan | Tanggapi dan selesaikan pengaduan |
| UC-AD-05 | Kelola CMS | Buat/edit/hapus berita & pengumuman |
| UC-AD-06 | Lihat Dashboard Admin | Monitoring data pajak, WP, pembayaran |
| UC-AD-07 | Terbitkan SPPT | Generate SPPT digital untuk WP |
| UC-AD-08 | Proses PPID | Tanggapi permohonan informasi publik |
| UC-AD-09 | Rekap Pembayaran | Lihat laporan pembayaran pajak |

### UC-AD-02: Kelola Objek Pajak
- **Trigger**: Admin memilih menu Objek Pajak
- **Precondition**: Login sebagai ADMIN
- **Main Flow**:
  1. Admin melihat daftar objek pajak (pencarian berdasarkan NOP/nama)
  2. Admin memilih Tambah Baru
  3. Sistem menampilkan form input: NOP, nama, alamat, luas tanah, luas bangunan, NJOP, pemilik
  4. Admin mengisi dan menyimpan
  5. Sistem menyimpan ke database
  6. Sistem mencatat audit log
- **Alternative Flow**: NOP sudah ada → tampilkan error duplikasi
- **Postcondition**: Objek pajak baru tersimpan

### UC-AD-07: Terbitkan SPPT
- **Trigger**: Admin memilih terbitkan SPPT untuk WP
- **Precondition**: Objek pajak valid, WP terdaftar
- **Main Flow**:
  1. Admin memilih objek pajak dan tahun pajak
  2. Sistem menghitung pajak terutang (0.3% × (NJOP − NJOPTKP))
  3. Admin konfirmasi penerbitan
  4. Sistem generate SPPT dengan nomor unik
  5. Sistem kirim notifikasi ke WP
  6. SPPT tersedia untuk diunduh WP

---

## 4. Use Case: Petugas (OFFICER)

| ID | Use Case | Deskripsi |
|----|----------|-----------|
| UC-OF-01 | Login Sistem | Autentikasi sebagai OFFICER |
| UC-OF-02 | Pendataan Lapangan | Input data objek pajak dari lapangan |
| UC-OF-03 | Penilaian Pajak | Melakukan penilaian ulang NJOP |
| UC-OF-04 | Verifikasi Data | Verifikasi data objek pajak |
| UC-OF-05 | Lihat Objek Pajak | Melihat data objek pajak di wilayah tugas |

### UC-OF-02: Pendataan Lapangan
- **Trigger**: Petugas melakukan survey lapangan
- **Precondition**: Login sebagai OFFICER
- **Main Flow**:
  1. Petugas memilih menu Pendataan
  2. Petugas mencari objek pajak berdasarkan NOP/alamat
  3. Petugas mengupdate data: luas tanah, luas bangunan, kondisi properti
  4. Petugas dapat menandai lokasi di peta (GIS)
  5. Sistem menyimpan data dan membuat audit log
- **Postcondition**: Data objek pajak terupdate

---

## 5. Use Case: Wajib Pajak (USER)

| ID | Use Case | Deskripsi |
|----|----------|-----------|
| UC-WP-01 | Registrasi Akun | Mendaftar sebagai WP baru |
| UC-WP-02 | Login | Masuk ke portal |
| UC-WP-03 | Lihat Dashboard | Melihat ringkasan data pribadi |
| UC-WP-04 | Cek Tagihan | Melihat daftar tagihan aktif |
| UC-WP-05 | Bayar Pajak | Melakukan pembayaran online |
| UC-WP-06 | Lihat SPPT | Melihat daftar SPPT digital |
| UC-WP-07 | Unduh SPPT | Mengunduh SPPT format PDF |
| UC-WP-08 | Ajukan Pengajuan | Mengajukan keberatan/perubahan data |
| UC-WP-09 | Cek Status Pengajuan | Melacak status pengajuan |
| UC-WP-10 | Buat Pengaduan | Melaporkan kendala |
| UC-WP-11 | Cek Status Pengaduan | Melacak status pengaduan |
| UC-WP-12 | Edit Profil | Mengubah data diri |
| UC-WP-13 | Lihat Riwayat Pembayaran | Histori pembayaran |
| UC-WP-14 | Gunakan Chatbot | Bertanya ke asisten digital |
| UC-WP-15 | Ajukan PPID | Permohonan informasi publik |

### UC-WP-01: Registrasi Akun
- **Trigger**: Pengunjung membuka halaman registrasi
- **Precondition**: Belum memiliki akun
- **Main Flow**:
  1. Pengunjung klik "Daftar Baru"
  2. Sistem menampilkan form registrasi
  3. User mengisi: NIK, Email, No HP, Password
  4. Sistem validasi data (NIK & email unik)
  5. Sistem membuat akun baru dengan role USER
  6. Sistem menampilkan notifikasi sukses
- **Alternative Flow**: Email/NIK sudah terdaftar → error
- **Postcondition**: Akun baru terdaftar, user bisa login

### UC-WP-05: Bayar Pajak
- **Trigger**: WP memilih tagihan untuk dibayar
- **Precondition**: Login, memiliki tagihan PENDING
- **Main Flow**:
  1. WP melihat daftar tagihan aktif
  2. WP memilih tagihan yang akan dibayar
  3. Sistem menginisialisasi pembayaran via Midtrans
  4. WP diarahkan ke halaman pembayaran Midtrans
  5. WP memilih metode (VA, QRIS, E-Wallet)
  6. WP menyelesaikan pembayaran
  7. Midtrans mengirim webhook
  8. Sistem update status payment → PAID
  9. Sistem kirim notifikasi berhasil
- **Alternative Flow**: Pembayaran gagal → status FAILED, notifikasi gagal
- **Postcondition**: Tagihan lunas, notifikasi terkirim

### UC-WP-06: Lihat SPPT
- **Trigger**: WP memilih menu SPPT Saya
- **Precondition**: Login, memiliki SPPT terdaftar
- **Main Flow**:
  1. WP membuka menu SPPT Saya
  2. Sistem menampilkan daftar SPPT per tahun pajak
  3. WP melihat detail: objek pajak, NJOP, pajak terutang
  4. WP dapat mengunduh SPPT (PDF)
- **Postcondition**: Data SPPT ditampilkan

### UC-WP-08: Ajukan Pengajuan
- **Trigger**: WP ingin mengajukan keberatan/perubahan
- **Precondition**: Login
- **Main Flow**:
  1. WP memilih menu Pengajuan → Buat Baru
  2. WP memilih jenis: Keberatan / Perubahan Data
  3. WP mengisi form dan upload dokumen
  4. Sistem generate ticket number
  5. Sistem simpan dengan status PENDING
  6. Admin mendapat notifikasi pengajuan baru
- **Postcondition**: Pengajuan tersimpan, tiket diterbitkan

### UC-WP-14: Gunakan Chatbot
- **Trigger**: WP mengklik icon chatbot
- **Precondition**: Tidak ada (tersedia untuk semua pengunjung)
- **Main Flow**:
  1. WP klik floating button chatbot
  2. Panel chatbot terbuka dengan sapaan
  3. WP mengetik pertanyaan atau klik quick action
  4. Sistem mencocokkan intent berdasarkan keyword
  5. Sistem merespon dengan jawaban (informasi umum atau data personal jika login)
  6. Riwayat percakapan tersimpan
- **Postcondition**: Jawaban ditampilkan, history tersimpan

---

## 6. Use Case: Pengunjung (Guest)

| ID | Use Case | Deskripsi |
|----|----------|-----------|
| UC-GU-01 | Lihat Halaman Depan | Akses landing page |
| UC-GU-02 | Cari Informasi Publik | Lihat berita, pengumuman |
| UC-GU-03 | Gunakan Chatbot (Terbatas) | Tanya informasi umum |
| UC-GU-04 | Registrasi | Daftar menjadi WP |
| UC-GU-05 | Cek Pajak Cepat | Cek tagihan via NOP |
