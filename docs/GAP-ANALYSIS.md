# Gap Analysis

**Sistem:** BAPENDA.HUB — Portal Pajak Daerah Kota Medan  

---

## 1. Current vs Target State

| Domain | Current State (v1.0) | Target State (v2.0) | Gap |
|--------|---------------------|---------------------|-----|
| **Chatbot** | 18+ intents, role-based response, rate limiting | NLP engine with intent confidence scoring, context-aware conversation | Rule-based regex vs NLP |
| **Pembayaran** | Midtrans Snap integration, webhook handling | Recurring payment, autodebet, multiple payment method fallback | No recurring payment |
| **GIS** | lat/lng field in TaxObject | Full interactive map with zone boundaries, heatmap, cluster markers | Limited GIS visualization |
| **CMS** | News & Announcement CRUD | Full CMS with categories, tags, featured image, rich text editor | Basic CMS |
| **Notifikasi** | In-app notification (DB) | Push notification (Web Push), Email notification, reminder | No push/email |
| **Dashboard** | Basic dashboard with stats | Advanced analytics, charts, export PDF/Excel, filter date range | No analytics |
| **SPPT Digital** | Manual generate via admin | Auto-generate SPPT each year, batch process, email delivery | No automation |
| **NPWPD** | Manual registration info in chatbot | Online NPWPD registration form, auto-approve, print card | No online registration |
| **Role Management** | Fixed roles, manual admin assignment | Invite system, role request, approval workflow, permission matrix UI | No self-service role |
| **Audit Log** | Database-level logging | Visual log viewer with filter, graph, anomaly detection | Basic logging |
| **PPID** | Submit request, admin response | Integrated with PPID database, categorization, SLA tracking | Manual workflow |
| **Performance** | Basic Prisma queries, no caching | Redis caching, query optimization, CDN static assets | No caching layer |

---

## 2. Gap Priority Matrix

| Gap | Dampak | Urgensi | Effort | Prioritas |
|-----|--------|---------|--------|-----------|
| NLP for chatbot | Medium | Medium | High | P3 |
| Recurring payment | Low | Low | High | P4 |
| GIS interactive map | Medium | Low | Medium | P3 |
| Push/email notification | High | High | Medium | **P1** |
| Dashboard analytics | Medium | Medium | Medium | P2 |
| Auto SPPT generation | High | High | Medium | **P1** |
| NPWPD online registration | Medium | High | Medium | P2 |
| Self-service role | Low | Low | Medium | P4 |
| Audit log viewer | Medium | Medium | Low | P2 |
| Caching layer | High | High | Medium | **P1** |
| Email notification | High | Medium | Low | P2 |
| Mobile app | Medium | Low | Very High | P4 |

---

## 3. Prioritized Recommendation

### P1 (Critical — Sprint 1–2)
| Gap | Solusi |
|-----|--------|
| **Push/Email Notification** | Integrasi Resend (email) + Web Push API. Auto-kirim notifikasi: tagihan jatuh tempo, pembayaran sukses, status pengajuan, pengumuman baru |
| **Auto SPPT Generation** | Cron job (Vercel Cron) setiap Januari: generate SPPT untuk semua objek pajak aktif berdasarkan NJOP tahun sebelumnya |
| **Caching Layer** | Upstash Redis untuk caching: daftar berita, pengumuman, tarif pajak. Implementasi Next.js ISR untuk halaman statis |

### P2 (High Priority — Sprint 3–4)
| Gap | Solusi |
|-----|--------|
| **Dashboard Analytics** | Integrasi Recharts untuk grafik: tren pembayaran, objek pajak per kecamatan, WP baru per bulan |
| **NPWPD Online Registration** | Form registrasi online dengan validasi NIK (via API Dukcapil), auto-generate NPWPD |
| **Audit Log Viewer** | Halaman monitoring dengan filter, search, export CSV |
| **Email Notification** | Resend API untuk notifikasi email: verifikasi akun, reset password, konfirmasi pembayaran |

### P3 (Medium Priority — Sprint 5–6)
| Gap | Solusi |
|-----|--------|
| **NLP Chatbot** | Integrasi OpenAI/Gemini API untuk flexibel intent matching, context memory |
| **GIS Interactive Map** | Leaflet heatmap layer, cluster markers, zone boundary GeoJSON overlay, search by location |

### P4 (Low Priority — Future)
| Gap | Solusi |
|-----|--------|
| **Recurring Payment** | Midtrans recurring API untuk autodebet bulanan/tahunan |
| **Self-service Role** | Role request form + admin approval workflow |
| **Mobile App** | React Native / Flutter app |

---

## 4. Technical Debt

| Area | Issue | Severity | Plan |
|------|-------|----------|------|
| **Chatbot intent matching** | Regex-based, fragile to input variation | Medium | Upgrade ke NLP (P3) |
| **Rate limiting** | In-memory (lost on restart) | Low | Migrate ke Redis (P1) |
| **No test suite** | No unit/integration tests | High | Setup Jest + Playwright (Sprint 1) |
| **Error handling** | Minimal error boundary | Medium | Add robust error boundaries (Sprint 2) |
| **Type safety** | Some `any` types in chatbot | Low | Strict TypeScript (ongoing) |
| **No migration seed** | No default data seed | Medium | Add seed script (Sprint 1) |

---

## 5. Market Comparison

| Fitur | BAPENDA.HUB | BAPENDA Kota Lain | Ideal State |
|-------|-------------|-------------------|-------------|
| Chatbot AI | ✅ Rule-based | ⬜ Jarang ada | ✅ NLP |
| Pembayaran Online | ✅ Midtrans | ⬜ Manual/ATM | ✅ Multi-method |
| GIS Pajak | ⬜ Basic lat/lng | ⬜ Jarang ada | ✅ Interactive map |
| SPPT Digital | ✅ Generate manual | ⬜ Paper-based | ✅ Auto + email |
| Notifikasi | ⬜ In-app only | ⬜ Tidak ada | ✅ Push + Email |
| Dashboard | ⬜ Basic | ⬜ Tidak ada | ✅ Advanced analytics |
| Mobile | ⬜ Tidak ada | ⬜ Tidak ada | ✅ Mobile app |
| PPID Online | ✅ Manual | ⬜ Tidak ada | ✅ Integrated system |

---

## 6. Success Metrics (KPI)

| Metrik | Current | Target (v2.0) | Cara Ukur |
|--------|---------|---------------|-----------|
| Chatbot response time | ~1.5s | < 1s | Vercel Analytics |
| Chatbot accuracy | 85% | > 95% | User feedback rating |
| Online payment rate | 60% | > 80% | DB: payment method |
| User adoption | 10K | > 50K | Active user count |
| SPPT digital delivery | 0% | > 90% | DB: isDownloaded |
| Notification delivery | 0% | > 95% | Notification log |
| Page load time (LCP) | 2.8s | < 2s | Lighthouse |
| System uptime | 99% | > 99.5% | Vercel Status |
