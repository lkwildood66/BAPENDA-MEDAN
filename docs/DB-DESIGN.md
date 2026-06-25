# Database Design Document (DDD)

**Sistem:** BAPENDA.HUB — Portal Pajak Daerah Kota Medan  
**DBMS:** PostgreSQL 16 (Neon)  
**ORM:** Prisma 6.x  

---

## 1. Database Diagram (Prisma Schema)

Schema file: `prisma/schema.prisma`

**Enums:**
```prisma
enum Role {
  USER        // Wajib Pajak
  ADMIN       // Admin BAPENDA
  OFFICER     // Petugas Lapangan
  MAHASISWA   // Mahasiswa riset
  DEVELOPER   // Super Admin
}
```

---

## 2. Tabel & Spesifikasi Kolom

### 2.1 User
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | String (CUID) | PK | Primary key |
| name | String? | - | Nama lengkap |
| email | String? | UNIQUE | Email login |
| emailVerified | DateTime? | - | Verifikasi email |
| image | String? | - | URL foto profil |
| password | String? | bcrypt hash | Hash password |
| role | Role | DEFAULT USER | Role pengguna |
| nik | String? | UNIQUE | Nomor Induk Kependudukan |
| phone | String? | - | Nomor telepon |
| address | String? | - | Alamat |
| ktpUrl | String? | - | URL foto KTP |
| institution | String? | - | Institusi (mahasiswa) |
| isActive | Boolean | DEFAULT true | Status aktif |
| createdAt | DateTime | DEFAULT now() | Waktu buat |
| updatedAt | DateTime | @updatedAt | Waktu update |

### 2.2 TaxObject
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | String (CUID) | PK | Primary key |
| nop | String | UNIQUE | Nomor Objek Pajak (18 digit) |
| type | String | - | Jenis (PBB, BPHTB, PKB) |
| name | String | - | Nama objek |
| address | String | - | Alamat objek |
| luasTanah | Float? | - | Luas tanah (m²) |
| luasBangun | Float? | - | Luas bangunan (m²) |
| njop | Decimal(20,2)? | - | NJOP total |
| njoptkp | Decimal(20,2)? | - | NJOPTKP |
| status | String | DEFAULT 'ACTIVE' | Status objek |
| lat | Float? | - | Latitude |
| lng | Float? | - | Longitude |
| ownerId | String | FK → User.id | Pemilik |
| createdAt | DateTime | DEFAULT now() | - |
| updatedAt | DateTime | @updatedAt | - |

### 2.3 Payment
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | String (CUID) | PK | Primary key |
| invoiceNumber | String | UNIQUE | Nomor invoice |
| amount | Decimal(20,2) | - | Jumlah tagihan |
| taxPeriod | String | - | Tahun pajak |
| status | String | - | PENDING/PAID/FAILED |
| method | String? | - | Metode bayar |
| paidAt | DateTime? | - | Waktu bayar |
| expiredAt | DateTime | - | Jatuh tempo |
| notes | String? | - | Catatan |
| taxObjectId | String | FK → TaxObject.id | Objek pajak |
| userId | String | FK → User.id | Pembayar |
| createdAt | DateTime | DEFAULT now() | - |
| updatedAt | DateTime | @updatedAt | - |

### 2.4 Sppt
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | String (CUID) | PK | Primary key |
| spptNumber | String | UNIQUE | Nomor SPPT |
| taxPeriod | String | - | Tahun pajak |
| njop | Decimal(20,2) | - | NJOP |
| njoptkp | Decimal(20,2) | - | NJOPTKP |
| taxObjectVal | Decimal(20,2) | - | Pajak terutang |
| isDownloaded | Boolean | DEFAULT false | Status unduh |
| taxObjectId | String | FK → TaxObject.id | Objek pajak |
| userId | String | FK → User.id | Pemilik |
| createdAt | DateTime | DEFAULT now() | - |
| updatedAt | DateTime | @updatedAt | - |

### 2.5 TaxSubmission
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | String (CUID) | PK | Primary key |
| ticketNumber | String | UNIQUE | No. tiket (e.g., SUB-001) |
| type | String | - | KEBERATAN / PERUBAHAN |
| title | String | - | Judul |
| description | String (Text) | - | Deskripsi |
| documentUrl | String? | - | URL dokumen |
| status | String | DEFAULT 'PENDING' | Status |
| reviewNotes | String? | - | Catatan review |
| userId | String | FK → User.id | Pengaju |
| createdAt | DateTime | DEFAULT now() | - |
| updatedAt | DateTime | @updatedAt | - |

### 2.6 Complaint
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | String (CUID) | PK | Primary key |
| ticketNumber | String | UNIQUE | No. tiket |
| subject | String | - | Subjek |
| description | String (Text) | - | Deskripsi |
| category | String | - | Kategori |
| priority | String | DEFAULT 'NORMAL' | Prioritas |
| status | String | DEFAULT 'OPEN' | Status |
| response | String? | - | Tanggapan |
| isAnonymous | Boolean | DEFAULT false | Anonim? |
| userId | String | FK → User.id | Pelapor |
| createdAt | DateTime | DEFAULT now() | - |
| updatedAt | DateTime | @updatedAt | - |

### 2.7 PPIDRequest
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | String (CUID) | PK | Primary key |
| ticketNumber | String | UNIQUE | No. tiket |
| title | String | - | Judul permohonan |
| description | String (Text) | - | Deskripsi |
| informationType | String | - | Jenis info |
| urgency | String | DEFAULT 'NORMAL' | Urgensi |
| status | String | DEFAULT 'OPEN' | Status |
| response | String? | - | Jawaban |
| userId | String | FK → User.id | Pemohon |
| createdAt | DateTime | DEFAULT now() | - |
| updatedAt | DateTime | @updatedAt | - |

### 2.8 Notification
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | String (CUID) | PK | Primary key |
| title | String | - | Judul |
| message | String (Text) | - | Isi |
| type | String | - | INFO/SUCCESS/WARNING/ERROR |
| category | String | DEFAULT 'SYSTEM' | Kategori |
| isRead | Boolean | DEFAULT false | Status baca |
| userId | String | FK → User.id | Penerima |
| createdAt | DateTime | DEFAULT now() | - |
| updatedAt | DateTime | @updatedAt | - |

### 2.9 ChatMessage
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | String (CUID) | PK | Primary key |
| userId | String? | - | Pengirim (nullable) |
| role | String? | - | Role saat kirim |
| message | String (Text) | - | Isi pesan |
| sender | String | - | USER / BOT |
| createdAt | DateTime | DEFAULT now() | - |

### 2.10 News
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | String (CUID) | PK | Primary key |
| slug | String | UNIQUE | URL slug |
| title | String | - | Judul |
| summary | String (Text) | - | Ringkasan |
| content | String (Text) | - | Konten |
| image | String? | - | URL gambar |
| category | String | - | Kategori |
| isActive | Boolean | DEFAULT true | Status publikasi |
| viewCount | Int | DEFAULT 0 | Jumlah dilihat |
| authorId | String | FK → User.id | Penulis |
| createdAt | DateTime | DEFAULT now() | - |
| updatedAt | DateTime | @updatedAt | - |

### 2.11 AuditLog
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | String (CUID) | PK | Primary key |
| action | String | - | Aksi yang dilakukan |
| table | String | - | Tabel yang diubah |
| recordId | String | - | ID record |
| userId | String | FK → User.id | Pelaku |
| oldValue | Json? | - | Nilai lama |
| newValue | Json? | - | Nilai baru |
| createdAt | DateTime | DEFAULT now() | - |

---

## 3. Index Strategy

| Tabel | Index | Kolom | Tipe |
|-------|-------|-------|------|
| User | idx_user_email | email | UNIQUE |
| User | idx_user_nik | nik | UNIQUE |
| TaxObject | idx_taxobject_nop | nop | UNIQUE |
| TaxObject | idx_taxobject_owner | ownerId | INDEX |
| Payment | idx_payment_user | userId | INDEX |
| Payment | idx_payment_status | status | INDEX |
| Payment | idx_payment_invoice | invoiceNumber | UNIQUE |
| Sppt | idx_sppt_user | userId | INDEX |
| Sppt | idx_sppt_period | taxPeriod | INDEX |
| Notification | idx_notif_user | userId | INDEX |
| Notification | idx_notif_read | isRead | INDEX |
| AuditLog | idx_audit_action | action | INDEX |
| AuditLog | idx_audit_time | createdAt | INDEX |

---

## 4. Audit Fields Convention

Setiap tabel master dan transaksi memiliki:
```
createdAt  DateTime  @default(now())   # Waktu pembuatan record
updatedAt  DateTime  @updatedAt         # Waktu terakhir update
```

Audit log diimplementasikan secara eksplisit via model `AuditLog` untuk operasi penting (CRUD data sensitif, perubahan status, pembayaran).

---

## 5. Soft Delete Strategy

Sistem menggunakan **hard delete** untuk data transaksional (ChatMessage, Notification) dan **soft delete** untuk data master melalui kolom `isActive`:
- User: `isActive = false` untuk menonaktifkan akun
- TaxObject: `status = 'INACTIVE'` untuk menonaktifkan objek
- News/Announcement: `isActive = false` untuk menarik publikasi
