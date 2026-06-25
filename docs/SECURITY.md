# Security Document

**Sistem:** BAPENDA.HUB — Portal Pajak Daerah Kota Medan  

---

## 1. Security Architecture

### Defense in Depth Layers
```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Edge / Network                                │
│  → HTTPS (TLS 1.3), DDoS Protection (Vercel)          │
│  → CSP Headers, Rate Limiting (API endpoint)           │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Authentication & Authorization               │
│  → NextAuth JWT (encrypted, signed)                    │
│  → Role-based access control (RBAC)                    │
│  → Session management (24h expiry, httpOnly cookie)    │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Application Security                          │
│  → Input validation (server-side)                      │
│  → XSS prevention (React escaping)                     │
│  → CSRF tokens                                         │
│  → SQL injection prevention (Prisma parameterized)     │
├─────────────────────────────────────────────────────────┤
│  Layer 4: API Security                                  │
│  → Rate limiting per IP per endpoint                   │
│  → Spam detection (repeated pattern)                   │
│  → Webhook signature verification (Midtrans HMAC)      │
├─────────────────────────────────────────────────────────┤
│  Layer 5: Data Security                                 │
│  → Password hashing (bcrypt, 12 rounds)                │
│  → Sensitive data masked in logs                       │
│  → HTTPS only cookies                                  │
│  → Audit logging for data mutations                    │
├─────────────────────────────────────────────────────────┤
│  Layer 6: Infrastructure                                │
│  → Vercel (SOC 2 compliant)                            │
│  → Neon (SSL enforced, IP allowlist)                   │
│  → UploadThing (malware scanning, signed uploads)      │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Security

### 2.1 Password Policy
| Aturan | Spesifikasi |
|--------|-------------|
| Minimum length | 8 karakter |
| Complexity | Minimal 1 huruf + 1 angka |
| Hashing | bcrypt (salt rounds: 12) |
| Max login attempts | 5 sebelum lockout 15 menit |
| Session expiry | 24 jam (JWT) |
| Refresh token | Tidak digunakan (session-based) |

### 2.2 JWT Configuration
- Algorithm: HS256
- Encryption: A256GCM (NextAuth default)
- Expiry: 24 hours
- Storage: httpOnly, secure, sameSite cookie
- Contains: userId, role, email

---

## 3. API Security

### 3.1 Input Validation
- All API inputs validated server-side
- Length limits enforced (message: 1000 chars)
- Type checking (string, number, boolean)
- XSS patterns escaped before storage

### 3.2 Rate Limiting
```typescript
// Chatbot rate limit config
const RATE_LIMIT_WINDOW = 15 * 60 * 1000  // 15 menit
const MAX_REQUESTS_PER_WINDOW = 10
```

### 3.3 Spam Detection
```typescript
// Heuristic: jika user mengirim pesan yang sama > 3x dalam 5 menit
const SPAM_THRESHOLD = 3
const SPAM_WINDOW = 5 * 60 * 1000
```

### 3.4 Webhook Security (Midtrans)
```typescript
const isValidSignature = (
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean => {
  const hash = crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest('hex')
  return hash === signatureKey
}
```

---

## 4. Data Security

### 4.1 Sensitive Data
| Data | Protection | Storage |
|------|-----------|---------|
| Password | bcrypt hashed | Never plaintext |
| NIK | Encrypted at rest | Masked in logs |
| Token Midtrans | Server-side only | Never exposed to client |
| JWT Secret | Environment variable | Vercel encrypted env |

### 4.2 Database Security
- SSL enforced (Neon)
- Connection pooling with limited max connections
- Prepared statements via Prisma
- No raw SQL queries
- Audit log for all CRUD operations on sensitive tables

### 4.3 File Upload Security
- Upload via UploadThing (not directly to server)
- File type whitelist: PDF, JPG, PNG (max 5MB)
- Malware scanning (UploadThing built-in)
- Signed upload URLs (pre-signed, time-limited)

---

## 5. GDPR / UU PDP Compliance

| Prinsip | Implementasi |
|---------|-------------|
| **Consent** | User menyetujui syarat & ketentuan saat registrasi |
| **Right to access** | User dapat melihat data pribadi di Profil |
| **Right to rectification** | User dapat mengubah data pribadi (nama, alamat, dll) |
| **Right to erasure** | Admin dapat menonaktifkan akun (soft delete via isActive) |
| **Data portability** | Data dapat diexport via API (future) |
| **Data breach notification** | Logging + notifikasi (future implementation) |
| **Data minimization** | Hanya data esensial yang dikumpulkan |
| **Storage limitation** | Data dihapus/dinonaktifkan setelah tidak diperlukan |

---

## 6. Security Headers

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.uploadthing.com https://*.tile.openstreetmap.org; connect-src 'self' https://*.midtrans.com;" }
]
```

---

## 7. Incident Response

| Phase | Action | Timeline |
|-------|--------|----------|
| **Detection** | Monitoring alert / user report | Immediate |
| **Analysis** | Assess severity, affected data | < 1 hour |
| **Containment** | Revoke affected credentials/sessions | < 2 hours |
| **Eradication** | Fix vulnerability, deploy patch | < 24 hours |
| **Recovery** | Restore from backup, verify integrity | < 48 hours |
| **Post-mortem** | Document incident, update security | < 1 week |

---

## 8. Security Checklist

- [ ] HTTPS enabled (Vercel default)
- [ ] JWT secrets in env vars (not in code)
- [ ] Database SSL enforced
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] XSS prevention (React auto-escaping)
- [ ] CSRF protection (NextAuth built-in)
- [ ] Password hashing (bcrypt)
- [ ] File upload restricted (type + size)
- [ ] Webhook signature verification
- [ ] Security headers configured
- [ ] Audit logging for sensitive operations
- [ ] Role-based access control
- [ ] Session expiry (24h)
- [ ] No secrets in git history
