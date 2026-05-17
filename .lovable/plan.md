# Startup Kit — Strategy & Build Plan

## The opportunity (Semrush, Singapore database)

Founders search the registration topic far more than they search "virtual office". TASA already offers every piece they need next — corporate secretary, address, accounting, website. A "Startup Kit" hub turns that one search into a full-funnel entry point.

| Search term | Volume/mo | KDI | Intent |
|---|---|---|---|
| singapore company incorporation | 3,600 | medium | Ready-to-buy |
| company registration singapore | 2,900 | 31 (possible) | Ready-to-buy |
| how to start a business in singapore | 720 | 29 (easy) | Research |
| how to register a company in singapore | 720 | — | Research |
| how to register a company in singapore as foreigner | 590 | — | High-value foreigner segment |
| setting up a company in singapore | 1,000 | — | Research |
| corporate secretarial services singapore | 1,600 | — | Mid-funnel |
| best corporate secretarial services singapore | 4,400 | — | Comparison shoppers |
| web design singapore | 4,400 | 55 (hard) | Adjacent service |
| website development singapore | 2,400 | — | Adjacent service |
| startup singapore | 880 | 27 (easy) | Top-funnel |

Top SERP for "company registration singapore" is dominated by gov sites + Sleek, Wise, SBS, Incorp — beatable with a clear founder-journey hub plus dedicated cluster pages. Most rank with long-form guides, not service pages.

## Strategy: hub-and-spoke content cluster

Pillar page (the Startup Kit hub) sits at `/startup-kit` and links out to spoke pages. Spokes link back to the hub and across to each other. Google reads the cluster as topical authority on "starting a business in Singapore" and ranks each spoke for its own term.

```text
                    /startup-kit  (pillar)
       ┌──────────────┬─────┴──────┬──────────────┐
   Register a       Corporate    Virtual           Marketing &
   Company          Secretary    Office /          Website
   /startup-kit/    /startup-kit/ Registered       /startup-kit/
   register-        corporate-   Address           website-branding
   company-         secretary    /startup-kit/
   singapore                     registered-
                                 address
                ┌──────────────┴──────────────┐
            Accounting,                  Foreigner
            Tax & GST                    Setup Guide
            /startup-kit/                /startup-kit/
            accounting-tax               foreigner-guide
```

Each spoke targets one primary keyword + 3-5 related/question keywords from the Semrush data above.

## Keyword → page mapping

| Page | Primary keyword | Supporting question keywords |
|---|---|---|
| /startup-kit (pillar) | start a business in singapore | how to start a business in singapore (720); startup singapore (880); how to register a startup in singapore |
| /startup-kit/register-company-singapore | company registration singapore (2,900) | how to register a company in singapore (720); how to incorporate a company in singapore (140); how long / how much to register |
| /startup-kit/foreigner-guide | how to register a company in singapore as foreigner (590) | can foreigner register company in singapore (390); can foreigner incorporate singapore company without ep |
| /startup-kit/corporate-secretary | corporate secretarial services singapore (1,600) | is a corporate secretary compulsory in singapore; do i need a corporate secretary singapore; best corporate secretarial services singapore (4,400) |
| /startup-kit/registered-address | registered address service singapore (720) | virtual office singapore (1,300); already covered on home — internal link only |
| /startup-kit/accounting-tax | corporate tax filing singapore (research separately) | gst registration singapore; bookkeeping singapore |
| /startup-kit/website-branding | website development company singapore (1,600) | startup website singapore; branding for startups |

Skip going head-to-head on "web design singapore" (KDI 55, agency-dominated). Frame website/branding as a bundled deliverable inside the Startup Kit, not a standalone agency play.

## Nav placement

New top-level nav item **"Startup Kit"** between Services and Pricing, with a mega-menu listing the six pillars + a "Full Startup Kit (bundled)" CTA. Mobile = expandable group.

## Page anatomy (pillar)

1. Hero — "Everything a Singapore startup needs, in one kit." Two CTAs: *Get the Startup Kit* (bundled offer) / *Talk to us*.
2. The 6-step founder journey (Register → Address → Secretary → Accounting → Website → Marketing) with one card per pillar linking to its spoke page.
3. Bundled-package pricing teaser (links to /pricing with a `?bundle=startup` anchor).
4. "Foreigner setting up in Singapore?" callout linking to the foreigner spoke.
5. FAQ block (10 questions pulled from the Semrush question keywords above).
6. Final CTA + lead-capture form (name, email, stage: idea / registering / already registered).

## Spoke page anatomy (each)

H1 = exact target keyword. Intro answers the question in 50 words. Step-by-step body. "How TASA does this for you" service block. Cross-links to 2-3 sibling spokes. FAQ accordion. CTA.

## Schema & technical SEO

- Pillar: `Service` + `BreadcrumbList` + `FAQPage` JSON-LD.
- Spokes: `Article` or `HowTo` + `FAQPage` + `BreadcrumbList`.
- Update `SeoManager` route map for every new path.
- Add the new routes to `public/sitemap-static.xml` (or generator).
- Add the pillar + spokes to `public/llms.txt` under a new `## Startup Kit` section.
- Internal links: home hero adds a secondary CTA "Starting a company? See the Startup Kit". Pricing page adds a "Bundle for new startups" panel. Services page adds a top banner.

## Build phases

**Phase 1 — Ship the hub (this PR)**
- Add `/startup-kit` route + nav item (desktop dropdown + mobile group).
- Build pillar page with all 6 pillar cards (cards link to anchor sections until spokes exist).
- Stub the 6 spoke routes returning a "Coming soon" page with the right SEO meta + canonical so we don't ship broken links.
- Update `SeoManager`, sitemap, llms.txt, schema.

**Phase 2 — Spoke content (follow-up PRs, one per spoke)**
Order by traffic ROI: register-company → foreigner-guide → corporate-secretary → accounting-tax → registered-address → website-branding.

**Phase 3 — Bundled offer**
- Pricing page gets a "Startup Kit Bundle" tier (registered address + corp sec + bookkeeping + website credit). Stripe product separate from the existing tiers so we can measure attribution.

## What I'd like to confirm before building Phase 1

1. Nav label: **Startup Kit** as proposed, or do you prefer "For Startups" / "New Business"?
2. Is there an existing bundled price you want surfaced, or should the pillar's pricing teaser just say "From $X/month — talk to us"?
3. Foreigner-incorporation: do you currently service this end-to-end (nominee director etc.)? Affects how aggressively we target the 590/mo "as foreigner" keyword.

Reply with answers (or "go ahead, use sensible defaults") and I'll ship Phase 1.
