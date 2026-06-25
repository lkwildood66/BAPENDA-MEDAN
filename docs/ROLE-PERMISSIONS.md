# Role & Permission Matrix

**Sistem:** BAPENDA.HUB — Portal Pajak Daerah Kota Medan

---

## 1. Role Hierarchy

```
DEVELOPER (Super Admin)
    │
    ├── ADMIN (Staf BAPENDA)
    │       │
    │       ├── OFFICER (Petugas Lapangan)
    │
    └── MAHASISWA (Peneliti)
    
USER (Wajib Pajak) — role dasar, tidak memiliki akses manajemen
```

---

## 2. Permission Matrix

| Fitur / Halaman | Guest | USER | MAHASISWA | OFFICER | ADMIN | DEVELOPER |
|----------------|-------|------|-----------|---------|-------|-----------|
| **Publik** | | | | | | |
| Beranda / Landing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Berita & Pengumuman | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chatbot (info umum) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Autentikasi** | | | | | | |
| Registrasi | ✅ | - | - | - | - | - |
| Login | ✅ | - | - | - | - | - |
| Edit Profil | - | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Dashboard** | | | | | | |
| Dashboard User | - | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tagihan Pajak | - | ✅ | ✅ | - | ✅ | ✅ |
| Bayar Pajak | - | ✅ | ✅ | - | ✅ | ✅ |
| SPPT Digital | - | ✅ | ✅ | - | ✅ | ✅ |
| Riwayat Pembayaran | - | ✅ | ✅ | - | ✅ | ✅ |
| **Layanan** | | | | | | |
| Pengajuan (Keberatan) | - | ✅ | - | - | - | - |
| Pengaduan | - | ✅ | ✅ | - | ✅ | ✅ |
| PPID (Informasi) | - | ✅ | ✅ | - | ✅ | ✅ |
| Riset & Penelitian | - | - | ✅ | - | ✅ | ✅ |
| **Chatbot Personal** | | | | | | |
| Cek Tagihan via Chat | - | ✅ | ✅ | - | ✅ | ✅ |
| Cek SPPT via Chat | - | ✅ | ✅ | - | ✅ | ✅ |
| Status Pengajuan | - | ✅ | - | - | ✅ | ✅ |
| Lokasi Objek Pajak | - | - | - | ✅ | ✅ | ✅ |
| **Admin** | | | | | | |
| Dashboard Admin | - | - | - | - | ✅ | ✅ |
| Kelola Objek Pajak | - | - | - | ✅ | ✅ | ✅ |
| Kelola Pengajuan | - | - | - | - | ✅ | ✅ |
| Kelola Pengaduan | - | - | - | - | ✅ | ✅ |
| Kelola CMS (Berita) | - | - | - | - | ✅ | ✅ |
| Terbitkan SPPT | - | - | - | - | ✅ | ✅ |
| Proses PPID | - | - | - | - | ✅ | ✅ |
| Rekap Pembayaran | - | - | - | - | ✅ | ✅ |
| **Officer** | | | | | | |
| Pendataan Lapangan | - | - | - | ✅ | ✅ | ✅ |
| Penilaian Pajak | - | - | - | ✅ | ✅ | ✅ |
| Verifikasi Objek | - | - | - | ✅ | ✅ | ✅ |
| **Developer** | | | | | | |
| Dashboard Developer | - | - | - | - | - | ✅ |
| Kelola Pengguna | - | - | - | - | - | ✅ |
| Audit Log | - | - | - | - | - | ✅ |
| Monitoring Kinerja | - | - | - | - | - | ✅ |
| System Config | - | - | - | - | - | ✅ |

---

## 3. Route Protection Strategy

```
3 Levels of Access Control:
```

### Level 1: Middleware (Edge)
- Cek session valid
- Redirect ke login jika belum login akses /dashboard, /admin, /officer, /developer
- Route:
  - `/dashboard/*` → session required
  - `/admin/*` → role ADMIN / DEVELOPER
  - `/officer/*` → role OFFICER / ADMIN / DEVELOPER
  - `/developer/*` → role DEVELOPER only

### Level 2: Layout Guard (Server Component)
```tsx
// app/admin/layout.tsx
const session = await auth()
if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'DEVELOPER')) {
  redirect('/login')
}
```

### Level 3: Component-Level (Client)
```tsx
// Chatbot intent gate
const { data: session } = useSession()
if (intent === 'tagihan' && !session) {
  return respondWithLoginPrompt()
}
```

---

## 4. Role-Based UI Components

### 4.1 Navigation Bar
| Menu | Guest | USER | MAHASISWA | OFFICER | ADMIN | DEVELOPER |
|------|-------|------|-----------|---------|-------|-----------|
| Beranda | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard | - | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin Panel | - | - | - | - | ✅ | ✅ |
| Officer Panel | - | - | - | ✅ | ✅ | ✅ |
| Developer Panel | - | - | - | - | - | ✅ |
| Login / Profil | Login | Profil | Profil | Profil | Profil | Profil |

### 4.2 Chatbot Quick Actions
| Role | Quick Action Buttons |
|------|---------------------|
| Guest | Info Pajak, Tarif, Alamat, Berita |
| USER | Cek Tagihan, Bayar Pajak, SPPT, Pengaduan |
| MAHASISWA | Riset, Info Publik, Berita, Kontak |
| OFFICER | Data Pajak, Pendataan, Penilaian, Map |
| ADMIN | Objek Pajak, Pengajuan, CMS, Laporan |
| DEVELOPER | Monitoring, Users, Logs, Config |

### 4.3 Chatbot Intents by Role
| Role | Available Intents |
|------|------------------|
| Guest | salam, info_berita, info_pengumuman, tarif_pajak, denda, npwpd, keberatan, jenis_pajak_daerah, alamat_kontak, website_medsos |
| USER | All Guest + tagihan, bayar_pajak, sppt, pengajuan, pengaduan, ppid |
| MAHASISWA | All Guest + tagihan, bayar_pajak, sppt, pengaduan, ppid |
| OFFICER | All Guest + lokasi_objek, pendataan, penilaian |
| ADMIN | All roles + kelola_pengguna, kelola_pengajuan, kelola_cms |
| DEVELOPER | All roles + monitoring |

---

## 5. Data Access Rules

| Data | Guest | USER | MAHASISWA | OFFICER | ADMIN | DEVELOPER |
|------|-------|------|-----------|---------|-------|-----------|
| User sendiri | - | R/W | R/W | R/W | R/W | R/W |
| User lain | - | - | - | - | R | R/W |
| Objek Pajak sendiri | - | R | R | R | R/W | R/W |
| Objek Pajak lain | - | - | - | R (tugas) | R/W | R/W |
| Pembayaran sendiri | - | R | R | - | R | R |
| Semua Pembayaran | - | - | - | - | R | R |
| SPPT sendiri | - | R | R | - | R/W | R/W |
| CMS | R | R | R | R | R/W | R/W |
| Audit Log | - | - | - | - | - | R |
| Notifikasi sendiri | - | R/W | R/W | R/W | R/W | R/W |

*R = Read, W = Write, `-` = No Access*
