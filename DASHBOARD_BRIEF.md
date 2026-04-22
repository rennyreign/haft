# Brief: HAFT Distress Sourcing Dashboard

**Project:** HAFT Operator — Phase 1.5  
**Passed to:** Ampcode  
**From:** Renaldo @ ADX  
**Date:** April 2026

---

## Context

The HAFT Operator is a fully automated Python pipeline that queries NYC ACRIS daily for commercial real estate distress signals (pre-foreclosure filings) and emails a structured digest to a broker. It runs via cron, requires no human in the loop, and is already live.

The operator produces structured data on every run. Right now that data only lives in emails. This brief is for a lightweight read-only dashboard that makes the accumulated filing history visible and searchable without needing to dig through an inbox.

---

## What We Want Built

A simple, clean web dashboard. Read-only. No auth required for MVP (internal use only).

### Core Views

**1. Live Feed**  
A table of all filings the operator has ever surfaced, newest first. Columns:
- Filing date
- Property address
- Borough
- Party 1 (borrower)
- Party 2 (lender)
- Est. loan balance (formatted as currency, blank if unconfirmed)
- Confirmed balance (yes/no badge)
- ACRIS link (opens document in new tab)

Filterable by borough, date range, and confirmed/unconfirmed balance.

**2. Summary Stats Bar**  
Persistent header strip showing:
- Total filings tracked (all time)
- Filings this week
- Filings today
- Borough breakdown (small bar chart or pill counts)

**3. Last Run Status**  
Small status card showing when the operator last ran and whether it succeeded. Green/red indicator.

---

## Data Layer

The operator currently sends results via email only. To power the dashboard, the operator needs to be updated to **also write each run's enriched records to a persistent store**.

Recommended approach: **Supabase** (Postgres + REST API, free tier is sufficient).

The operator would upsert records to a `filings` table keyed on `document_id` after each run. The dashboard reads from Supabase directly via the public anon key.

### Suggested `filings` table schema

```sql
CREATE TABLE filings (
  document_id        TEXT PRIMARY KEY,
  property_address   TEXT,
  borough            TEXT,
  filing_date        TIMESTAMPTZ,
  document_type      TEXT,
  party_1_name       TEXT,
  party_2_name       TEXT,
  estimated_loan_balance NUMERIC,
  balance_confirmed  BOOLEAN,
  acris_url          TEXT,
  signal_type        TEXT,
  asset_class_flag   TEXT,
  inserted_at        TIMESTAMPTZ DEFAULT now()
);
```

### Suggested `runs` table schema (for last-run status card)

```sql
CREATE TABLE runs (
  id          SERIAL PRIMARY KEY,
  ran_at      TIMESTAMPTZ DEFAULT now(),
  status      TEXT,  -- 'success' | 'error'
  records_found INT,
  error_msg   TEXT
);
```

---

## Tech Stack Preference

- **Frontend:** Next.js or plain React (whatever Ampcode prefers for fast delivery)
- **Styling:** Tailwind CSS
- **Database:** Supabase (Postgres)
- **Charts:** Recharts or a lightweight equivalent
- **Hosting:** Netlify or Vercel

---

## Design Direction

- Clean, dark-header layout (the email template uses `#1a1a2e` as the primary dark — match that)
- Data-dense but not cluttered — this is a broker tool, not a consumer app
- Mobile-readable but desktop-first
- No login screen for MVP

---

## Operator Changes Needed (Python side)

The dashboard brief assumes the operator will be updated to write to Supabase after each run. That change is **not in scope for Ampcode** — it's a small addition to `operator.py` and `scraper/enricher.py` that ADX will handle once the Supabase project and schema are set up.

Ampcode's scope is **frontend + Supabase schema only**.

---

## Out of Scope for This Brief

- Authentication / access control
- Email preference management
- Alerting or push notifications
- Any write operations from the dashboard (read-only MVP)
- NYSCEF / lis pendens integration (Phase 2 of the operator itself)

---

## Deliverable

A deployed Netlify/Vercel URL with:
1. The dashboard connected to a live Supabase instance
2. The `filings` and `runs` tables created with RLS disabled (internal tool)
3. A `SUPABASE_URL` and `SUPABASE_ANON_KEY` handed back to ADX so the operator can be wired up to write data
