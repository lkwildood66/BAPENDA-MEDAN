# Entity Relationship Diagram (ERD)

**Sistem:** BAPENDA.HUB — Portal Pajak Daerah Kota Medan

---

## 1. Daftar Entitas

| No | Entitas | Tipe | Deskripsi |
|----|---------|------|-----------|
| 1 | User | Master | Pengguna sistem (semua role) |
| 2 | Account | Transaksi | Akun OAuth/NextAuth |
| 3 | Session | Transaksi | Session pengguna |
| 4 | TaxObject | Master | Objek pajak (tanah/bangunan) |
| 5 | Payment | Transaksi | Pembayaran pajak |
| 6 | Sppt | Transaksi | Surat Pemberitahuan Pajak Terutang |
| 7 | TaxSubmission | Transaksi | Pengajuan (keberatan/perubahan) |
| 8 | Complaint | Transaksi | Pengaduan masyarakat |
| 9 | PPIDRequest | Transaksi | Permohonan informasi publik |
| 10 | ResearchRequest | Transaksi | Permohonan riset mahasiswa |
| 11 | News | Master | Berita CMS |
| 12 | Announcement | Master | Pengumuman CMS |
| 13 | Notification | Transaksi | Notifikasi pengguna |
| 14 | AuditLog | Log | Catatan audit sistem |
| 15 | ChatMessage | Transaksi | Pesan chatbot |
| 16 | ChatSession | Transaksi | Sesi chatbot |
| 17 | ObjectTaxLocation | Detail | Lokasi GIS objek pajak |
| 18 | LandValueZone | Master | Zona nilai tanah |
| 19 | PropertyMarket | Master | Data properti pasar |
| 20 | TaxAssessment | Transaksi | Penilaian pajak |

---

## 2. Entity Relationship Diagram (Text-based)

```
┌─────────────────┐       ┌──────────────────┐
│      User       │1──N──│    Account        │
│─────────────────│       │──────────────────│
│ id (PK)         │       │ id (PK)          │
│ name            │       │ userId (FK)      │
│ email (UQ)      │       │ provider         │
│ password (hash) │       │ providerAccountId│
│ role (enum)     │       └──────────────────┘
│ nik (UQ)        │
│ phone           │       ┌──────────────────┐
│ address         │1──N──│    Session        │
│ isActive        │       │──────────────────│
│ ktpUrl          │       │ id (PK)          │
│ institution     │       │ userId (FK)      │
└───────┬─────────┘       │ sessionToken     │
        │                 │ expires          │
        │                 └──────────────────┘
        │
        │ 1──N──┌──────────────────┐
        ├───────│   TaxObject      │
        │       │──────────────────│
        │       │ id (PK)          │
        │       │ nop (UQ)         │──1──┐
        │       │ type             │     │
        │       │ name             │     │
        │       │ address          │     │
        │       │ luasTanah        │     │
        │       │ luasBangun       │     │
        │       │ njop             │     │
        │       │ njoptkp          │     │
        │       │ status           │     │
        │       │ lat, lng         │     │
        │       │ ownerId (FK)──┐  │     │
        │       └──────┬────────┘  │     │
        │              │           │     │
        │              │ 1──N──┐   │     │
        │              ├──────┼───┼─────┤
        │              │      │   │     │
        │ 1──N──┐      │      │   │     │
        ├───────┤      │      │   │     │
        │       │      │      │   │     │
        │  ┌────┴──────┴──┐   │   │     │
        │  │ Payment      │   │   │     │
        │  │──────────────│   │   │     │
        │  │ id (PK)      │   │   │     │
        │  │ invoiceNumber │   │   │     │
        │  │ amount       │   │   │     │
        │  │ taxPeriod    │   │   │     │
        │  │ status       │   │   │     │
        │  │ method       │   │   │     │
        │  │ paidAt       │   │   │     │
        │  │ expiredAt    │   │   │     │
        │  │ taxObjectId  ├───┘   │     │
        │  │ userId (FK)──┤       │     │
        │  └──────────────┘       │     │
        │                         │     │
        │  ┌──────────────┐       │     │
        │  │ Sppt         │       │     │
        │  │──────────────│       │     │
        │  │ id (PK)      │       │     │
        │  │ spptNumber   │       │     │
        │  │ taxPeriod    │       │     │
        │  │ njop         │       │     │
        │  │ njoptkp      │       │     │
        │  │ taxObjectVal │       │     │
        │  │ taxObjectId  ├───────┘     │
        │  │ userId (FK)──┤             │
        │  └──────────────┘             │
        │                               │
        │  ┌──────────────────┐         │
        │  │ TaxSubmission    │         │
        │  │──────────────────│         │
        │  │ id (PK)          │         │
        │  │ ticketNumber     │         │
        │  │ type             │         │
        │  │ title            │         │
        │  │ description      │         │
        │  │ documentUrl      │         │
        │  │ status           │         │
        │  │ reviewNotes      │         │
        │  │ userId (FK)──────┤         │
        │  └──────────────────┘         │
        │                               │
        │  ┌──────────────────┐         │
        │  │ Complaint        │         │
        │  │──────────────────│         │
        │  │ id (PK)          │         │
        │  │ ticketNumber     │         │
        │  │ subject          │         │
        │  │ description      │         │
        │  │ category         │         │
        │  │ priority         │         │
        │  │ status           │         │
        │  │ isAnonymous      │         │
        │  │ userId (FK)──────┤         │
        │  └──────────────────┘         │
        │                               │
        │  ┌──────────────────┐         │
        │  │ PPIDRequest      │         │
        │  │──────────────────│         │
        │  │ id (PK)          │         │
        │  │ ticketNumber     │         │
        │  │ title            │         │
        │  │ description      │         │
        │  │ informationType  │         │
        │  │ status           │         │
        │  │ response         │         │
        │  │ userId (FK)──────┤         │
        │  └──────────────────┘         │
        │                               │
        │  ┌──────────────────┐         │
        │  │ ResearchRequest  │         │
        │  │──────────────────│         │
        │  │ id (PK)          │         │
        │  │ requestNumber    │         │
        │  │ title            │         │
        │  │ institution      │         │
        │  │ supervisorName   │         │
        │  │ status           │         │
        │  │ userId (FK)──────┤         │
        │  └──────────────────┘         │
        │                               │
        │  ┌──────────────────┐         │
        │  │ Notification     │         │
        │  │──────────────────│         │
        │  │ id (PK)          │         │
        │  │ title            │         │
        │  │ message          │         │
        │  │ type             │         │
        │  │ category         │         │
        │  │ isRead           │         │
        │  │ userId (FK)──────┤         │
        │  └──────────────────┘         │
        │                               │
        │  ┌──────────────────┐         │
        │  │ AuditLog         │         │
        │  │──────────────────│         │
        │  │ id (PK)          │         │
        │  │ action           │         │
        │  │ table            │         │
        │  │ recordId         │         │
        │  │ userId (FK)──────┤         │
        │  │ oldValue         │         │
        │  │ newValue         │         │
        │  └──────────────────┘         │
        │                               │
        │  ┌──────────────────┐         │
        │  │ News             │         │
        │  │──────────────────│         │
        │  │ id (PK)          │         │
        │  │ title            │         │
        │  │ slug (UQ)        │         │
        │  │ authorId (FK)────┤         │
        │  └──────────────────┘         │
        │                               │
        │  ┌──────────────────┐         │
        │  │ Announcement     │         │
        │  │──────────────────│         │
        │  │ id (PK)          │         │
        │  │ title            │         │
        │  │ slug (UQ)        │         │
        │  │ authorId (FK)────┤         │
        │  └──────────────────┘         │
        │                               │
        │  ┌──────────────────┐         │
        │  │ ChatMessage      │         │
        │  │──────────────────│         │
        │  │ id (PK)          │         │
        │  │ userId (FK, opt)─┤         │
        │  │ message          │         │
        │  │ sender           │         │
        │  └──────────────────┘         │
        │                               │
        │  ┌──────────────────┐         │
        │  │ TaxAssessment    │         │
        │  │──────────────────│         │
        │  │ id (PK)          │         │
        │  │ objectTaxId (FK)─┤──┐      │
        │  │ assessorId (FK)──┤  │      │
        │  │ oldNJOP          │  │      │
        │  │ newNJOP          │  │      │
        │  └──────────────────┘  │      │
        │                        │      │
        │  ┌─────────────────────┘      │
        │  │  ┌─────────────────────┐   │
        │  │  │ ObjectTaxLocation   │   │
        │  │  │─────────────────────│   │
        │  │  │ id (PK)             │   │
        │  └──│ objectTaxId (UQ,FK)─┘   │
        │     │ latitude, longitude     │
        │     │ polygonData             │
        │     └─────────────────────────┘
        │
        │     ┌─────────────────────────┐
        │     │ LandValueZone           │
        │     │─────────────────────────│
        │     │ id (PK)                 │
        │     │ zoneCode (UQ)           │
        │     │ zoneName                │
        │     │ polygonData             │
        │     │ valuePerMeter           │
        │     │ district, village       │
        │     └─────────────────────────┘
        │
        │     ┌─────────────────────────┐
        │     │ PropertyMarket          │
        │     │─────────────────────────│
        │     │ id (PK)                 │
        │     │ propertyType            │
        │     │ address, district       │
        │     │ marketPrice             │
        │     │ landArea, buildingArea  │
        │     │ latitude, longitude     │
        │     │ source                  │
        │     └─────────────────────────┘
```

---

## 3. Ringkasan Relasi

| Entity | Relasi | Entity | Tipe |
|--------|--------|--------|------|
| User | → | Account | One-to-Many |
| User | → | Session | One-to-Many |
| User | → | TaxObject | One-to-Many |
| User | → | Payment | One-to-Many |
| User | → | Sppt | One-to-Many |
| User | → | TaxSubmission | One-to-Many |
| User | → | Complaint | One-to-Many |
| User | → | PPIDRequest | One-to-Many |
| User | → | ResearchRequest | One-to-Many |
| User | → | Notification | One-to-Many |
| User | → | News | One-to-Many |
| User | → | Announcement | One-to-Many |
| User | → | AuditLog | One-to-Many |
| User | → | ChatMessage | One-to-Many |
| User | → | TaxAssessment | One-to-Many (as assessor) |
| TaxObject | → | Payment | One-to-Many |
| TaxObject | → | Sppt | One-to-Many |
| TaxObject | → | ObjectTaxLocation | One-to-One |
| TaxObject | → | TaxAssessment | One-to-Many |
