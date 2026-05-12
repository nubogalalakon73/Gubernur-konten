# Gubernur Konten — Landing Page PRD

## Problem Statement
Premium cinematic landing page for the Indonesian political-academic ebook **"Gubernur Konten — Siapa Dalang, Siapa Wayang?"** by Didi Subandi & Yully Ambarsih Ekawardhani. Vibe: Netflix documentary + investigative magazine + academic journal. Goal: drive ebook sales, capture leads, route inquiries to WhatsApp AI Assistant.

## User Choices (locked)
- Pricing: placeholders (Rp 79k / 129k / 249k) — user will edit later
- Checkout: WhatsApp only (wa.me/628998553333), no Stripe
- Admin: no auth, accessible at `/admin`
- AI Assistant: mockup chat + WA CTA only (no live chatbot)
- Cover images: 2 artifact URLs (front + back) used in hero 3D mockup

## Architecture
- **Frontend** React + Tailwind + shadcn/ui — `/app/frontend/src/`
  - Routes: `/` (Landing) and `/admin`
  - 15 components under `src/components/`
  - Helpers: `src/lib/api.js`, `src/lib/useReveal.js`
- **Backend** FastAPI + MongoDB — `/app/backend/server.py`
  - `GET /api/` health
  - `GET /api/stats` — readers, downloads, rating, leads, cta_clicks
  - `POST /api/leads`, `GET /api/leads`, `DELETE /api/leads/{id}`, `GET /api/leads/export.csv`
  - `POST /api/cta` — CTA click tracking

## What's Been Implemented (Dec 2025)
- Hero with 3D book cover, dramatic headline, **three CTAs** (Beli, Baca Bab 1 Gratis → /bab1, Konsultasi WhatsApp), live stats
- Difference (about), 7-chapter editorial accordion timeline
- Viral Stats dashboard (95.5% vs 3.55 Juta animated counters)
- Audiences grid (8 personas), Testimonials (4 cards with rating)
- Formats showcase
- **Restructured Pricing**: Free Bab 1 (link → /bab1) · Per Bab Rp 10.000 (open chat) · Full Buku Rp 55.000 (open chat, PALING DIMINATI featured)
- AI Assistant mockup section
- **Interactive AI Chat Widget** (global, floating bottom-right):
  - Auto greeting on first open
  - 4 initial quick replies (Bab 1, Tanya Isi, Lihat Harga, WA)
  - Rule-based intent matching for free-text input (harga, tentang, rekomendasi by profession, wa, bayar, salam)
  - Purchase flow with payment quick replies (Transfer Bank, QRIS, WhatsApp Admin)
  - Cross-component trigger via `openChat()` event bus
  - CTA tracking → `/api/cta`
- **/bab1 reader page**:
  - Dark editorial, mobile-first, Source Serif Pro typography
  - Top progress bar (scroll %)
  - Sticky reading-time header + 'Full Buku 55K' button
  - Mid-article soft CTA after section 3
  - Locked chapter teasers (BAB 2-7)
  - 60%-scroll popup ("Pembaca yang menyelesaikan Bab 1...")
  - Light anti-copy (right-click block + copy injects watermark)
  - Faint repeating watermark behind text
  - SEO meta (title, description, OG) updated dynamically
  - Sticky bottom CTA bar
- Lead capture form (validates + saves to MongoDB + localStorage mirror + success popup)
- FAQ accordion, Urgency section with live countdown
- Footer (email, social placeholders, disclaimer)
- Sticky transparent→solid navbar with mobile menu + smooth scroll
- Admin dashboard `/admin`: stat cards, lead table, filter, delete, CSV export
- SEO: title, description, Open Graph, Twitter card meta

## Testing
- Backend pytest: 9/9 passed
- Frontend: all critical flows passed (testing_agent_v3 iteration 1)
- Test file: `/app/backend/tests/backend_test.py`

## Backlog / Next
- **P1** Replace pricing placeholders with final amounts from user
- **P1** Replace 3 social links (Instagram/TikTok/Facebook placeholders) with real URLs
- **P2** Add real AI chat widget (Claude/GPT) using Emergent LLM Key if user wants live chat
- **P2** Stripe / Midtrans / Xendit checkout integration
- **P2** Admin auth (password env-based) to protect lead database
- **P3** Email auto-reply to lead via Resend/SendGrid
- **P3** Rate limit on /api/leads + /api/cta to prevent spam
- **P3** Image gallery / quote shareable cards for socials
