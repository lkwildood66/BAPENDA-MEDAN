# Deployment Guide

**Sistem:** BAPENDA.HUB — Portal Pajak Daerah Kota Medan  

---

## 1. Prerequisites

- Node.js 20.x+
- PostgreSQL 16 database (Neon or local)
- Midtrans merchant account
- UploadThing account
- Google OAuth credentials
- Vercel account (deployment)

---

## 2. Environment Variables

```env
# === Database ===
DATABASE_URL="postgresql://user:pass@host:5432/bapenda-medan"

# === NextAuth ===
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# Google OAuth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# === Midtrans ===
MIDTRANS_SERVER_KEY="your-server-key"
MIDTRANS_CLIENT_KEY="your-client-key"
MIDTRANS_IS_PRODUCTION=false

# === UploadThing ===
UPLOADTHING_SECRET="your-ut-secret"
UPLOADTHING_APP_ID="your-ut-app-id"

# === Next.js ===
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 3. Local Development

```bash
# 1. Clone & install
git clone https://github.com/org/bapenda-medan.git
cd bapenda-medan
npm install

# 2. Setup env
cp .env.example .env
# isi DATABASE_URL dan credentials lain

# 3. Setup database
npx prisma generate
npx prisma db push    # dev — langsung sync schema
# atau
npx prisma migrate dev --name init  # production-style migration

# 4. Seed data (jika ada)
npx prisma db seed

# 5. Run dev server
npm run dev
# → http://localhost:3000
```

### Database Migration Workflow
```bash
# Buat migration baru
npx prisma migrate dev --name add-tax-location

# Apply ke production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

---

## 4. Production Build

```bash
# Build
npm run build

# Test production build locally
npm run start
```

### Build Checks
- Pastikan `npm run build` sukses tanpa error
- Cek TypeScript: `npx tsc --noEmit`
- Cek lint: `npm run lint`

---

## 5. Vercel Deployment

### 5.1 Setup
1. Push repository ke GitHub
2. Import project di Vercel dashboard
3. Set Framework: Next.js
4. Set Build Command: `npx prisma generate && next build`
5. Set Node.js version: 20.x

### 5.2 Environment Variables (Vercel)
Tambahkan semua env variables dari section 2 di Vercel project settings → Environment Variables.

### 5.3 Database Migration
```bash
# Setelah deploy, jalankan:
npx prisma migrate deploy
```
> Untuk Vercel, tambahkan script di `vercel.json` atau jalankan manual via terminal.

### 5.4 Post-Deploy Checklist
- [ ] Database migration berhasil
- [ ] Login/registrasi berfungsi
- [ ] Chatbot merespon
- [ ] Midtrans payment flow OK
- [ ] File upload OK
- [ ] Maps render OK
- [ ] CMS CRUD berfungsi
- [ ] Role-based access OK

---

## 6. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npx tsc --noEmit
```

---

## 7. Database Backups

### Neon (Built-in)
- Automatic daily backups
- Point-in-time recovery (7 days)
- Enable branch protection for production

### Manual Export
```bash
pg_dump "connection-string" > backup_$(date +%Y%m%d).sql
```

---

## 8. Monitoring & Logging

| Layanan | Metrik | Tools |
|---------|--------|-------|
| Vercel | Response time, error rate, traffic | Vercel Analytics |
| Neon | Connection pool, query performance | Neon Monitoring |
| Midtrans | Transaction status, webhook health | Midtrans Dashboard |
| Audit Log | User actions, system changes | Custom AuditLog table |

---

## 9. Rollback Strategy

### Code Rollback
```bash
git revert HEAD --no-edit
git push origin main
```
Vercel auto-deploy — gunakan Vercel dashboard untuk promote previous deployment.

### Database Rollback
```bash
npx prisma migrate diff --from-migration <migration-name> --to-schema-datamodel prisma/schema.prisma
# Generate rollback SQL, review, apply manually
```

---

## 10. Scaling Considerations

| Aspek | Current | Scale Target |
|-------|---------|-------------|
| Database | 1 instance Neon (0.5GB) | Neon scale up (3GB) |
| Serverless | 512MB RAM (Vercel) | 1GB+ RAM |
| CDN | Vercel Edge Network | Vercel Pro (global) |
| File Storage | UploadThing Hobby | UploadThing Pro (250GB) |
| Rate Limit | In-memory Map | Redis-based distributed |
