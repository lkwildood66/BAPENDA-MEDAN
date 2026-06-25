# Architecture & Technology Stack

**Sistem:** BAPENDA.HUB — Portal Pajak Daerah Kota Medan

---

## 1. Technology Stack

| Layer | Teknologi | Versi | Fungsi |
|-------|-----------|-------|--------|
| **Framework** | Next.js 15 | 15.x | Full-stack React framework (App Router) |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | TailwindCSS | 4.x | Utility-first CSS |
| **UI Components** | Custom + Lucide React | - | Ikon dan komponen UI |
| **Database** | PostgreSQL (Neon) | 16 | Database utama |
| **ORM** | Prisma | 6.x | Database access & migration |
| **Auth** | NextAuth.js 5 | 5.x (Beta) | Autentikasi (Credentials + Google) |
| **Payment** | Midtrans Snap | - | Payment gateway |
| **File Upload** | UploadThing | 7.x | Upload file (KTP, dokumen) |
| **Maps** | React Leaflet + Leaflet | - | GIS objek pajak |
| **Deployment** | Vercel | - | Hosting & CI/CD |

---

## 2. System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │ Next.js App  │  │ TailwindCSS  │  │   Client Components   │   │
│  │ Router (SSR) │  │ Responsive   │  │   - ChatbotWidget     │   │
│  │              │  │ Mobile-first │  │   - MapComponent      │   │
│  └──────┬───────┘  └──────────────┘  └───────────────────────┘   │
│         │                                                         │
│         │  SWR / fetch / Server Actions                           │
└─────────┼─────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────┐
│                       API LAYER (Next.js)                        │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Route Handlers  │  │  Server Actions  │  │  Middleware      │  │
│  │  /api/*          │  │  (form actions)   │  │  Auth Guard     │  │
│  │  /api/chatbot    │  │  (mutations)     │  │  Role Check     │  │
│  │  /api/payment    │  │                  │  │  CSRF           │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────┘  │
└──────────┼──────────────────────┼────────────────────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER (Lib)                          │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  auth.ts         │  │  chatbot.ts     │  │  prisma.ts      │  │
│  │  (NextAuth cfg)  │  │  (intent match)  │  │  (DB client)    │  │
│  │  session check   │  │  rate limit     │  │  query helpers  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  payment.ts     │  │  notification.ts│  │  uploadthing.ts  │  │
│  │  midtrans init  │  │  fire & forget  │  │  file upload     │  │
│  │  webhook verify │  │  in-app notif   │  │  image optimize  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  audit.ts       │  │  format.ts      │  │  constants.ts   │  │
│  │  logging crud   │  │  currency IDR   │  │  intents        │  │
│  │                  │  │  date ID        │  │  respons footer │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     DATA ACCESS LAYER (Prisma)                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    PostgreSQL (Neon)                         │ │
│  │                                                              │ │
│  │   Users ─── TaxObjects ─── Payments ─── Sppts               │ │
│  │     │            │             │           │                 │ │
│  │     ├────────────┴─────────────┴───────────┤                 │ │
│  │     │                                      │                 │ │
│  │   Complaints   Submissions   Notifications │                 │ │
│  │   News         Announcements               │                 │ │
│  │   ChatMessages PPIDRequests  ResearchRequests               │ │
│  │   AuditLogs    TaxAssessments              │                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                          │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ Midtrans  │  │ Google   │  │UploadThing│  │  OpenStreetMap │   │
│  │ Snap API  │  │ OAuth    │  │ S3-backed │  │  Tile Layer    │   │
│  │ Webhook   │  │ OpenID   │  │ Upload    │  │  LeafletJS     │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Architecture

### 3.1 Pages (App Router)

```
/app
├── page.tsx                    # Landing page / Beranda
├── layout.tsx                  # Root layout (= Providers + Navbar + Footer)
├── login/page.tsx              # Halaman login
├── register/page.tsx           # Halaman registrasi
├── dashboard/
│   ├── page.tsx                # Dashboard user
│   ├── tagihan/page.tsx        # Tagihan pajak
│   ├── bayar/page.tsx          # Pembayaran
│   ├── sppt/page.tsx           # SPPT saya
│   ├── pengajuan/page.tsx      # Pengajuan saya
│   ├── pengaduan/page.tsx      # Pengaduan saya
│   ├── ppid/page.tsx           # Permohonan informasi
│   └── profil/page.tsx         # Edit profil
├── admin/
│   ├── layout.tsx              # Admin layout (role guard)
│   ├── page.tsx                # Dashboard admin
│   ├── objek-pajak/page.tsx    # Manage objek pajak
│   ├── pengajuan/page.tsx      # Review pengajuan
│   ├── pengaduan/page.tsx      # Kelola pengaduan
│   ├── cms/page.tsx            # Berita & pengumuman
│   ├── sppt/page.tsx           # Terbitkan SPPT
│   └── ppid/page.tsx           # Kelola PPID
├── officer/
│   ├── layout.tsx              # Officer layout
│   ├── page.tsx                # Dashboard officer
│   ├── pendataan/page.tsx      # Pendataan lapangan
│   └── penilaian/page.tsx      # Penilaian pajak
└── developer/
    ├── layout.tsx              # Developer layout
    ├── page.tsx                # Dashboard developer
    ├── users/page.tsx          # Manage users
    └── logs/page.tsx           # Audit logs
```

### 3.2 Shared Components

```
/components
├── Providers.tsx          # SessionProvider + other contexts
├── Navbar.tsx             # Navigation bar
├── Footer.tsx             # Footer
├── ChatbotWidget.tsx      # Floating chatbot (global)
├── MapComponent.tsx       # React Leaflet map
├── DataTable.tsx          # Reusable table
├── Pagination.tsx         # Pagination
├── Modal.tsx              # Modal dialog
├── LoadingSpinner.tsx     # Loading state
├── EmptyState.tsx         # Empty state display
├── ErrorBoundary.tsx      # Error boundary
├── NotificationBell.tsx   # Notification dropdown
└── Sidebar.tsx            # Dashboard sidebar
```

---

## 4. Data Flow

### 4.1 Informational: Chatbot (Guest)

```
User → ChatbotWidget → POST /api/chatbot → Intent Router → Static Response → User
```

### 4.2 Personal Data: Chatbot (Authenticated)

```
User (login) → ChatbotWidget → POST /api/chatbot → Intent Router
  → Auth Gate (session.check()) → DB Query (Prisma) → Response → User
```

### 4.3 Payment Flow

```
User → Dashboard/Tagihan → Init Payment → Midtrans Snap
  → User Bayar → Midtrans Webhook → API Update → DB → Notif User
```

### 4.4 CMS Flow

```
Admin → CMS Page → Server Action CRUD → Prisma → DB
  → Revalidate Path → Static Page Update
```

---

## 5. Security Architecture

| Lapisan | Proteksi |
|---------|----------|
| **Transport** | HTTPS (Vercel + Neon SSL) |
| **Auth** | NextAuth JWT (encrypted), session expiry, CSRF token |
| **API** | Rate limiting (chatbot), spam detection, input validation |
| **Database** | Prepared statements (Prisma), parameterized queries |
| **File Upload** | UploadThing (serverless, malware scanning) |
| **Webhook** | Midtrans signature verification |
| **XSS** | React sanitization, CSP headers |
| **Role** | Middleware + layout-level role guard |

---

## 6. Performance Strategy

| Aspek | Strategi |
|-------|----------|
| **Rendering** | SSR untuk halaman publik, CSR untuk dashboard |
| **Caching** | Next.js ISR untuk berita/pengumuman |
| **Image** | UploadThing optimization, lazy loading |
| **Bundle** | Dynamic import untuk komponen berat (Map, Chatbot) |
| **DB** | Prisma connection pooling (Neon), indexed queries |
| **Font** | Next.js font optimization (Inter, Montserrat) |
