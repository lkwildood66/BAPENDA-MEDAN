# Dokumentasi Proyek BAPENDA.HUB

**Portal Pajak Daerah Kota Medan — Sistem Informasi Pajak Bumi dan Bangunan Perdesaan dan Perkotaan (PBB-P2)**

---

## Daftar Dokumen

| No | Dokumen | Deskripsi | File |
|----|---------|-----------|------|
| 1 | **SRS** | Software Requirements Specification | [`SRS.md`](./SRS.md) |
| 2 | **PRD** | Product Requirements Document | [`PRD.md`](./PRD.md) |
| 3 | **ERD** | Entity Relationship Diagram | [`ERD.md`](./ERD.md) |
| 4 | **DDD** | Database Design Document | [`DB-DESIGN.md`](./DB-DESIGN.md) |
| 5 | **UCD** | Use Case Diagram Documentation | [`USE-CASES.md`](./USE-CASES.md) |
| 6 | **ADD** | Activity Diagram Documentation | [`ACTIVITY-DIAGRAMS.md`](./ACTIVITY-DIAGRAMS.md) |
| 7 | **SAD** | System Architecture Document | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| 8 | **API** | API Documentation | [`API-DOCS.md`](./API-DOCS.md) |
| 9 | **RPM** | Role & Permission Matrix | [`ROLE-PERMISSIONS.md`](./ROLE-PERMISSIONS.md) |
| 10 | **UIX** | UI/UX Documentation | [`UI-UX.md`](./UI-UX.md) |
| 11 | **TCD** | Test Case Documentation | [`TEST-CASES.md`](./TEST-CASES.md) |
| 12 | **DOP** | Deployment & DevOps Documentation | [`DEPLOYMENT.md`](./DEPLOYMENT.md) |
| 13 | **SED** | Security Documentation | [`SECURITY.md`](./SECURITY.md) |
| 14 | **GAP** | Project Scope & Gap Analysis | [`GAP-ANALYSIS.md`](./GAP-ANALYSIS.md) |

---

## Hubungan Antar Dokumen

```
┌─────────────────────────────────────────────────────────────┐
│                      PRD (Product Vision)                     │
│  Menentukan "mengapa" sistem dibangun dan metrik kesuksesan   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      SRS (Software Spec)                      │
│  Menentukan "apa" yang harus dibangun secara teknis           │
└──────────┬──────────┬──────────┬──────────┬─────────────────┘
           │          │          │          │
           ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  ERD &   │ │  USE     │ │ARCHITEC- │ │  ROLE &  │
│   DDD    │ │  CASES   │ │  TURE    │ │PERMISSION│
│(Database)│ │(Alur      │ │(Teknis)  │ │  MATRIX  │
│          │ │ Fungsional│ │          │ │ (Akses)  │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │            │
     └────────────┼────────────┼────────────┘
                  │            │
                  ▼            ▼
     ┌────────────────────────────────────────┐
     │           IMPLEMENTASI                  │
     │  ┌────────┐ ┌────────┐ ┌──────────┐   │
     │  │  API   │ │ UI/UX  │ │ ACTIVITY │   │
     │  │   DOC  │ │  DOC   │ │ DIAGRAMS │   │
     │  └────────┘ └────────┘ └──────────┘   │
     └────────────────┬───────────────────────┘
                      │
                      ▼
     ┌────────────────────────────────────────┐
     │              PENGUJIAN                  │
     │  ┌────────┐ ┌────────┐ ┌──────────┐   │
     │  │  UNIT  │ │ INTEG- │ │   UAT    │   │
     │  │  TEST  │ │  RASI  │ │  TEST    │   │
     │  └────────┘ └────────┘ └──────────┘   │
     └────────────────┬───────────────────────┘
                      │
                      ▼
     ┌────────────────────────────────────────┐
     │           DEPLOYMENT & OPS              │
     │  ┌────────┐ ┌────────┐ ┌──────────┐   │
     │  │DEPLOY  │ │SECURI- │ │   GAP    │   │
     │  │  DOC   │ │  TY    │ │ ANALISIS │   │
     │  └────────┘ └────────┘ └──────────┘   │
     └────────────────────────────────────────┘
```

---

## Teknologi yang Digunakan

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Frontend | Next.js 15 (App Router) | ^15.0 |
| Bahasa | TypeScript | ^5.x |
| Styling | TailwindCSS | ^4.x |
| ORM | Prisma | ^6.x |
| Database | PostgreSQL (Neon) | 16.x |
| Autentikasi | NextAuth.js | ^4.x |
| Upload | UploadThing | ^7.x |
| Pembayaran | Midtrans Snap | REST API |
| Map/GIS | React Leaflet | ^4.x |
| Icon | Lucide React | ^0.x |
| Markdown | React Markdown | ^9.x |
| Deployment | Railway | Cloud |

---

## Struktur Proyek

```
BAPENDA-Medan/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── chatbot/              # Chatbot AI
│   │   ├── notifications/        # Notifikasi
│   │   ├── complaints/           # Pengaduan
│   │   ├── ppid/                 # Informasi Publik
│   │   ├── research/             # Riset Mahasiswa
│   │   ├── sppt/                 # SPPT Digital
│   │   ├── tax/                  # Pajak
│   │   ├── gis/                  # GIS & Geo-analytics
│   │   ├── cms/                  # Berita & Pengumuman
│   │   ├── admin/                # Admin Panel API
│   │   ├── payments/             # Pembayaran
│   │   └── uploadthing/          # File Upload
│   ├── dashboard/                # Halaman Dashboard
│   │   ├── admin/                # Admin Dashboard
│   │   └── mahasiswa/            # Mahasiswa Dashboard
│   ├── (landing)/                # Halaman Publik
│   ├── layout.tsx                # Root Layout
│   └── globals.css               # Global Styles
├── components/                   # UI Components
│   ├── ui/                       # Base UI (Button, Card, dll)
│   ├── dashboard/                # Dashboard Components
│   ├── ChatbotWidget.tsx         # Chatbot
│   ├── NotificationDropdown.tsx  # Notifikasi
│   ├── FileUpload.tsx            # Upload File
│   └── ...                       # Lainnya
├── lib/                          # Utility & Services
│   ├── services/                 # Business Logic Services
│   ├── auth.ts                   # NextAuth Config
│   ├── prisma.ts                 # Prisma Client
│   ├── utils.ts                  # Helper Functions
│   └── uploadthing.ts            # UploadThing Config
├── prisma/                       # Database
│   └── schema.prisma             # Prisma Schema
├── docs/                         # Dokumentasi
│   ├── README.md                 # Index Dokumen
│   ├── SRS.md                    # Software Requirements
│   ├── PRD.md                    # Product Requirements
│   └── ...                       # Lainnya
├── public/                       # Static Assets
├── types/                        # TypeScript Types
└── package.json                  # Dependencies
```
