# NYSCEF Integration Brief — Technical Assessment

**Prepared by:** ADX Engine  
**Date:** April 2026  
**Status:** Research complete. Build paused pending client decision on approach.

---

## Summary

NYSCEF (New York State Courts Electronic Filing) is the primary system for NYC foreclosure case filings. Integrating it would give the HAFT Operator access to early-stage foreclosure complaints, conference schedules, and case status updates — data that ACRIS does not carry.

After technical evaluation, NYSCEF cannot be integrated via a standard API. The system is protected by Cloudflare's managed challenge (bot detection), which blocks all automated access. This document outlines what NYSCEF would provide, why it's blocked, and the viable paths forward with associated costs.

---

## What NYSCEF Has That ACRIS Doesn't

| Data Point | ACRIS | NYSCEF |
|---|---|---|
| Notice of Pendency (lis pendens) filing record | Yes (`PREL` doc type) | Yes |
| Foreclosure complaint full text | No | Yes |
| Named parties with attorney info | Partial (name only) | Full (name, firm, contact) |
| Case status (active, settled, dismissed) | No | Yes |
| Settlement conference dates | No | Yes |
| Judgment of foreclosure | Record only (`JUDG`) | Full document + timeline |
| Property description from complaint | No | Yes (detailed) |
| Loan amount from complaint | No | Often stated explicitly |
| Mortgage servicer identity | No | Yes (named in complaint) |

**The value proposition:** ACRIS tells you a lis pendens was filed. NYSCEF tells you the full story — who filed it, for how much, which law firm is handling it, what stage the case is at, and whether a settlement conference is scheduled. That's the difference between a lead and an actionable opportunity.

---

## Why Direct Integration Is Blocked

The entire `iapps.courts.state.ny.us` domain — which hosts NYSCEF, iScroll, and WebCivil — is protected by **Cloudflare Managed Challenge**. This is a JavaScript-based bot detection system that:

1. Serves a "Just a moment..." interstitial page on every request
2. Requires a headless browser to render and solve a JavaScript challenge
3. Issues a `cf_clearance` cookie that expires and must be re-solved
4. Actively detects and blocks automated browsers (Playwright, Selenium, Puppeteer)

During our testing (April 2026), we confirmed:

- Initial page loads sometimes pass (Cloudflare allows the first GET)
- **All form submissions (POST requests) are blocked** with a 403
- Standard headless browser stealth techniques (spoofed user-agent, removed webdriver flag, slow typing, human-like delays) do not bypass the challenge
- The block applies to the search page, results page, and case detail pages equally

This is not a technical limitation we can engineer around with better code. Cloudflare's managed challenge is specifically designed to prevent exactly what we need to do.

---

## Viable Paths Forward

### Option 1: FlareSolverr (Self-Hosted Cloudflare Bypass)

**What it is:** An open-source proxy server that runs a full browser instance, solves Cloudflare challenges, and returns the cleared cookies and page content to your application.

**How it works:**
1. Deploy FlareSolverr as a Docker container (self-hosted or on a VPS)
2. The HAFT Operator sends search requests to FlareSolverr instead of directly to NYSCEF
3. FlareSolverr navigates NYSCEF in a real browser, solves the challenge, and returns the HTML
4. The operator parses the HTML for case data

**Infrastructure required:**
- Docker host (any VPS — DigitalOcean, AWS, etc.)
- Minimum spec: 2 vCPU, 4GB RAM (headless Chrome is resource-heavy)

**Costs:**
| Item | Monthly Cost |
|---|---|
| VPS (DigitalOcean Droplet or AWS Lightsail) | $24–48/mo |
| Maintenance / monitoring | Internal |
| **Total** | **~$30–50/mo** |

**Risks:**
- Cloudflare updates their challenge regularly. FlareSolverr may break and require updates.
- Solve rate is not 100%. Some requests will fail and need retries.
- If NY Courts escalates to Turnstile CAPTCHA (interactive), FlareSolverr won't work without a paid CAPTCHA-solving service.
- Grey area legally — automated scraping of court records is generally permitted for public data, but violating a site's terms of service carries theoretical risk.

**Reliability:** Moderate. Works until Cloudflare or the courts change their protection level.

**Build time:** 1–2 days for the integration module + deployment.

---

### Option 2: Commercial Court Data Provider

**What it is:** Third-party services that already have established access to NYSCEF data and sell it via API or feed.

**Known providers:**

| Provider | Access Method | Pricing |
|---|---|---|
| **CourtAlert** (courtalert.com) | NYSCEF Docket Monitor — real-time alerts per case | $1.50/case/day |
| **UniCourt** (unicourt.com) | API access to court records nationwide | Starts at $99/mo (limited), enterprise pricing for bulk |
| **Docket Alarm** (docketalarm.com) | Court filing search API | $0.10–0.50 per search |
| **PACER-like bulk access** | Not available for NY state courts | N/A |

**CourtAlert analysis:**
- $1.50/case/day is expensive at scale. 75 new filings per month × 30 days monitoring = ~$3,375/mo
- Better suited for monitoring specific known cases, not bulk daily discovery
- Does not provide an API for automated ingest — alerts are email-based

**UniCourt analysis:**
- Has NYC Supreme Court coverage
- API is well-documented and returns structured JSON
- Starter plan ($99/mo) has limited queries. Bulk foreclosure monitoring would require enterprise pricing ($500–2,000+/mo depending on volume)
- Most reliable and cleanest integration path if budget allows

**Risks:**
- Vendor lock-in to a third-party data source
- Pricing can change
- Data freshness depends on their crawl schedule (typically same-day or next-day)

**Reliability:** High. These companies maintain their access as a core business function.

**Build time:** 1 day for API integration (UniCourt), 2–3 days for email parsing (CourtAlert).

---

### Option 3: Hybrid — ACRIS as Primary + Manual NYSCEF Review

**What it is:** Continue using ACRIS `PREL` filings as the automated discovery layer. Use the ACRIS data to generate a daily list of document IDs, then provide a manual NYSCEF lookup workflow for the highest-value leads.

**How it works:**
1. Operator runs daily as-is, pulling PREL filings from ACRIS
2. For filings with confirmed balances in the target range ($3M–$75M), include a direct NYSCEF search link in the email digest
3. The client or an assistant clicks the link, searches NYSCEF manually, and reviews the full case file

**Cost:** $0 additional. Already built.

**What the operator would add:**
- A constructed NYSCEF search URL for each filing (links directly to the case search pre-filtered by county)
- A flag in the email: "Full case file available — review on NYSCEF"

**Risks:** None. ACRIS remains the automated source. NYSCEF is a manual supplement.

**Reliability:** High. No dependency on Cloudflare bypass or third-party vendors.

**Build time:** 2 hours to add NYSCEF links to the email template.

---

## Recommendation

| Approach | Cost | Reliability | Data Depth | Build Time |
|---|---|---|---|---|
| FlareSolverr | $30–50/mo | Moderate | Full | 1–2 days |
| UniCourt API | $500–2,000/mo | High | Full | 1 day |
| CourtAlert | $3,000+/mo | High | Full | 2–3 days |
| Hybrid (ACRIS + manual) | $0 | High | Partial | 2 hours |

**For Phase 2, we recommend starting with the Hybrid approach** (Option 3) — it's free, reliable, and deliverable immediately. It keeps the operator fully automated for discovery while giving the client a one-click path to the full NYSCEF case file for any filing that warrants deeper review.

**If volume justifies the cost**, UniCourt (Option 2) is the cleanest upgrade path. Their API returns structured case data and would integrate directly into the existing pipeline without any Cloudflare concerns.

**FlareSolverr** (Option 1) is viable but introduces infrastructure and maintenance overhead that may not be worth it when commercial alternatives exist.

---

## Current State of ACRIS Integration

The ACRIS pipeline is live and validated:

- **Doc type:** `PREL` (Notice of Pendency) — confirmed as the correct lis pendens record in ACRIS
- **Volume:** ~75 filings per 30-day window across Manhattan, Bronx, Brooklyn, Queens
- **Data quality:** Property address, borough, parties, filing date, loan balance (where recorded)
- **Limitation:** Most PREL records carry a $0 `document_amt`. Balance data is frequently missing in ACRIS. NYSCEF complaints typically state the loan amount explicitly — this is the primary data gap.

---

*ADX Engine — adxengine.net*
