# QuadGrowth Portal

**Live at:** `project.quadgrowth.com.au`  
**Hosted on:** Vercel  
**Status:** Active development — Phase 1 MVP in progress

---

## What This Is

This repo contains two things:

| Path | URL | What it is |
|------|-----|------------|
| `/index.html` | `project.quadgrowth.com.au` | Product roadmap — 28 features across 3 phases. CEO + internal reference doc. |
| `/portal/index.html` | `project.quadgrowth.com.au/portal` | Client portal placeholder — shown to prospects and used while Phase 1 is built. |

---

## Repo Structure

```
quadgrowth-portal/
├── index.html          ← Roadmap doc (CEO-facing, internal strategy)
├── portal/
│   └── index.html      ← Client portal (placeholder → real portal)
├── assets/             ← Shared brand assets (CSS tokens, logo, etc.)
│   └── style.css
└── README.md           ← You are here
```

---

## Brand Tokens

All QuadGrowth pages use these values. Never deviate.

```css
--navy-dark: #111d33;   /* page background */
--navy:      #1B2A4A;   /* primary navy */
--gold:      #C8963E;   /* primary accent */
--gold-lt:   #E8B96A;   /* lighter gold */
--cream:     #F5F0E8;   /* light backgrounds + text on dark */
```

**Fonts:** Playfair Display (headings) · DM Sans (body)  
**Pricing (always accurate):** Starter AUD 1,500/mo · Growth AUD 2,500/mo · Scale AUD 4,000/mo  
**Avg patient value:** AUD 800–1,200/yr · Slot value: AUD 300–500

---

## Deployment

Deployed automatically via Vercel on every push to `main`.

**To deploy manually:**
```bash
git add .
git commit -m "your message"
git push origin main
```
Vercel picks it up within ~30 seconds. No build step required — plain HTML.

---

## Phase 1 — What to Build Next

The `/portal` directory will grow into the real client portal. Phase 1 features (all data via Airtable, no complex APIs):

- [ ] Overview / KPI summary cards
- [ ] Live lead feed (from Airtable via n8n)
- [ ] Monthly reports (written by campaign manager)
- [ ] Campaign status panel
- [ ] ROI calculator (JS, patient lifetime value × bookings)
- [ ] Next strategy call panel (Calendly link)
- [ ] Package & account info
- [ ] Journey timeline

Full feature breakdown and build rationale: `project.quadgrowth.com.au`

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Hosting | Vercel |
| Domain | quadgrowth.com.au (Vercel DNS) |
| Data (Phase 1) | Airtable |
| Automation | n8n |
| AI | Claude API (Anthropic) |
| Auth (Phase 2) | TBD — Supabase or Clerk |

---

*QuadGrowth · quadgrowth.com.au · Internal Confidential*