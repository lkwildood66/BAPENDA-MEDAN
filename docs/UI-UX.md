# UI/UX Design Document

**Sistem:** BAPENDA.HUB — Portal Pajak Daerah Kota Medan

---

## 1. Design Tokens

### 1.1 Color Palette
```
Primary     : #1E40AF (Biru Tua)    — Header, button utama, link
Primary Light: #3B82F6 (Biru)       — Hover, accent
Secondary   : #F59E0B (Amber)       — Highlight, badge status
Success     : #10B981 (Hijau)       — Lunas, success
Warning     : #F59E0B (Kuning)      — Pending, warning
Danger      : #EF4444 (Merah)       — Gagal, error
Neutral 50  : #F9FAFB               — Background
Neutral 100 : #F3F4F6               — Card background
Neutral 200 : #E5E7EB               — Border
Neutral 500 : #6B7280               — Secondary text
Neutral 900 : #111827               — Text utama
```

### 1.2 Typography
```
Font Utama  : Inter (sans-serif)    — Body, paragraf
Font Judul  : Montserrat (sans-serif) — Heading, navbar
Base Size   : 16px
Scaling     : 1.25 (Major Third)
```
- Body: Inter 16px, line-height 1.6
- H1: Montserrat 48px Bold
- H2: Montserrat 36px Bold
- H3: Montserrat 24px Semibold
- Small: Inter 14px

### 1.3 Spacing
- Container max: 1280px
- Grid gutter: 24px
- Section padding: 80px (desktop), 48px (mobile)
- Card padding: 24px

### 1.4 Shadows
```
Card shadow : 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
Dropdown    : 0 10px 15px -3px rgba(0,0,0,0.1)
Modal       : 0 25px 50px -12px rgba(0,0,0,0.25)
```

---

## 2. Layout Structure

### 2.1 Landing Page
```
┌─────────────────────────────────────────────────┐
│  Navbar (logo, menu, login button)              │
├─────────────────────────────────────────────────┤
│  Hero Section (ilustrasi + CTA)                │
├─────────────────────────────────────────────────┤
│  Quick Stats (total pajak, WP, layanan)        │
├─────────────────────────────────────────────────┤
│  Layanan Unggulan (grid 3 kartu)               │
│    ┌────────┐ ┌────────┐ ┌────────┐           │
│    │Bayar   │ │Cek     │ │Info    │           │
│    │Pajak   │ │Tagihan │ │Pajak  │           │
│    └────────┘ └────────┘ └────────┘           │
├─────────────────────────────────────────────────┤
│  Berita & Pengumuman (grid 2 kolom)            │
├─────────────────────────────────────────────────┤
│  Footer (kontak, link, medsos)                 │
└─────────────────────────────────────────────────┘
```

### 2.2 Dashboard User
```
┌─────────────────────────────────────────────────┐
│  Header (profil, notifikasi, logout)            │
├──────────────────────┬──────────────────────────┤
│  Sidebar             │  Main Content            │
│  ┌────────┐          │  ┌────────────────────┐  │
│  │ Beranda│          │  │ Ringkasan Stats    │  │
│  │ Tagihan│          │  └────────────────────┘  │
│  │ Bayar  │          │  ┌────────────────────┐  │
│  │ SPPT   │          │  │ Tagihan Aktif      │  │
│  │ Layanan│          │  └────────────────────┘  │
│  │ Profil │          │                          │
│  └────────┘          │                          │
└──────────────────────┴──────────────────────────┘
```

### 2.3 Chatbot Widget
```
┌──────────────────────────────────────────┐
│ Floating Button (kanan bawah)           │
│   ⬤ (dengan badge unread jika ada)      │
├──────────────────────────────────────────┤
│ Panel Chatbot (320-400px width)         │
│ ┌────────────────────────────────────┐   │
│ │ Header: Bapenda.HUB (gradient)    │   │
│ │ [✕] [─]                           │   │
│ ├────────────────────────────────────┤   │
│ │ Messages (scroll)                 │   │
│ │ ┌──────────────────────────────┐  │   │
│ │ │ Bot: Selamat datang...      │  │   │
│ │ └──────────────────────────────┘  │   │
│ │ ┌──────────────────────────────┐  │   │
│ │ │ User: berapa tagihan saya?  │  │   │
│ │ └──────────────────────────────┘  │   │
│ │ ┌──────────────────────────────┐  │   │
│ │ │ Bot: Berikut tagihan Anda.. │  │   │
│ │ └──────────────────────────────┘  │   │
│ ├────────────────────────────────────┤   │
│ │ Suggestions (chips)              │   │
│ │ [Cek Tagihan] [Bayar] [Info]    │   │
│ ├────────────────────────────────────┤   │
│ │ Input bar + Send button          │   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

---

## 3. Component States

### 3.1 Button
| State | Style |
|-------|-------|
| Default | bg-primary, text-white, rounded-lg |
| Hover | bg-primary-dark, shadow-md |
| Active | scale-95 |
| Disabled | opacity-50, cursor-not-allowed |
| Loading | spinner + reduced opacity |

### 3.2 Input Field
| State | Style |
|-------|-------|
| Default | border-neutral-200, bg-white |
| Focus | border-primary, ring-2 ring-primary/20 |
| Error | border-danger, ring-2 ring-danger/20 |
| Disabled | bg-neutral-100, cursor-not-allowed |
| Success | border-success, ring-2 ring-success/20 |

### 3.3 Card
| State | Style |
|-------|-------|
| Default | bg-white, rounded-xl, shadow-sm |
| Hover | shadow-md, translateY(-2px) interactive |

### 3.4 Chat Message
| Type | Alignment | Style |
|------|-----------|-------|
| Bot | Left | bg-neutral-100, rounded-br-xl |
| User | Right | bg-primary, text-white, rounded-bl-xl |
| Typing | Left | Bouncing dots animation |

---

## 4. Responsive Strategy

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640-1024px | 2 column grid, sidebar collapsible |
| Desktop | > 1024px | Multi column, full sidebar |
| Wide | > 1536px | Max-width container 1280px centered |

### Mobile Adaptation
- Sidebar: Bottom navigation bar
- Chatbot: Fullscreen panel (slide from bottom)
- Tables: Horizontal scroll + card view on mobile
- Navbar: Hamburger menu

---

## 5. Accessibility (a11y)

| Aspek | Implementasi |
|-------|-------------|
| Semantic HTML | `<nav>`, `<main>`, `<section>`, `<article>` |
| ARIA Labels | Icon buttons, interactive elements |
| Keyboard Nav | All focusable, tab order logical |
| Focus Visible | Custom focus ring (2px primary) |
| Color Contrast | All text ≥ 4.5:1 ratio |
| Screen Reader | `sr-only` for icon-only elements |
| Motion | `prefers-reduced-motion` respected |
| Form Labels | Explicit `<label>` for all inputs |

---

## 6. Animations & Transitions

| Element | Duration | Easing | Type |
|---------|----------|--------|------|
| Page transition | 300ms | ease-in-out | Fade + slide up |
| Modal open/close | 200ms | ease-out | Scale + fade |
| Dropdown | 150ms | ease-out | Fade + slide down |
| Chatbot panel | 300ms | ease-out | Slide up (mobile), scale (desktop) |
| Skeleton load | 1.5s | linear | Pulse opacity |
| Button hover | 100ms | ease | Background color |
| Toast notification | 300ms | ease-out | Slide in from right |
| Typing indicator | 1.2s | ease-in-out | Bounce dots |
