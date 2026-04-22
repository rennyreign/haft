# Build Brief: HAFT Distress Sourcing Operator — Phase 1

*Prepared by ADX Engine | For execution by an AI coding agent*

---

## Context

This is a client project for a NYC commercial real estate broker who specialises
in distressed property transactions. He currently monitors NYC ACRIS and the NYS
eCourt system manually every day to find qualifying opportunities. This operator
replaces that manual daily task.

**The philosophy governing this build:** this is not a tool the client uses. It
is an operator that runs, finds qualifying properties, and delivers structured
output to him — without him initiating anything per task. He receives the
results. He does not operate the system.

This is the distinction between a tool and an ADX Operator:

- A tool requires the client to log in, search, and interpret results.
- An operator runs on a schedule, filters against defined criteria, and delivers
  structured intelligence to the client's inbox. The client's only action is
  reading the email.

---

## What Is Being Built

A Python-based operator that:

1. Queries the NYC ACRIS public API daily for new lis pendens filings
2. Filters results against the qualifying criteria defined below
3. Enriches each result with available property and party data
4. Delivers a formatted email digest to the client on a daily and weekly schedule

**No web interface. No dashboard. No login. Delivery only.**

---

## Data Source — NYC ACRIS (Phase 1 Only)

NYC ACRIS is available via the NYC Open Data Socrata API. No API key is required
for basic access. An app token is recommended for higher rate limits and should
be stored as an environment variable.

**Primary endpoints:**

| Dataset | URL |
|---|---|
| Real Property Master | `https://data.cityofnewyork.us/resource/bnx9-e6tj.json` |
| Real Property Parties | `https://data.cityofnewyork.us/resource/636b-3b5g.json` |
| Real Property Legals | `https://data.cityofnewyork.us/resource/8h5j-fqxa.json` |

Query for records where `recorded_datetime` or `good_through_date` falls within
the past 24 hours on each run. Paginate fully — do not assume a single page
covers all results.

Target document type: lis pendens filings. Verify the exact `doc_type` value
against the live API before hardcoding. Common values include `NOTICE OF LIS
PENDENS` or similar. Log the verified value in `criteria.md`.

---

## Qualifying Criteria

All criteria constants must live in `config.py`. No criteria logic is to be
hardcoded inside scraper or filter modules.

### Geography

| Include | Borough Code |
|---|---|
| Manhattan | 1 |
| Bronx | 2 |
| Brooklyn | 3 |
| Queens | 4 |

Exclude: Staten Island (borough code 5).

### Distress Signal — Phase 1

Signal type: **Pre-foreclosure**

Filter: document type matching lis pendens (verify exact `doc_type` value
against live ACRIS API).

### Loan Balance

Where mortgage amount (`docamount`) is available on the record:
include only if value is between **$3,000,000 and $75,000,000**.

Where not available: include the record and set `balance_confirmed = false`.
Do not discard records on the basis of missing balance data alone.

### Asset Class

ACRIS does not reliably encode asset class. Include all results. Set
`asset_class_flag = "unverified — manual review required"` on every record.
Do not attempt to filter by asset class in Phase 1.

---

## Output Per Record

Each qualifying record must produce the following structured fields:

| Field | Source | Notes |
|---|---|---|
| `property_address` | ACRIS Legals — street number + name + borough | Constructed string |
| `borough` | ACRIS Master | Human-readable name, not code |
| `filing_date` | ACRIS `recorded_datetime` | ISO 8601 format |
| `document_type` | ACRIS `doc_type` | As returned by API |
| `document_id` | ACRIS `document_id` | For reference and deduplication |
| `party_1_name` | ACRIS Parties (`party_type = 1`) | Typically borrower or owner |
| `party_2_name` | ACRIS Parties (`party_type = 2`) | Typically lender |
| `estimated_loan_balance` | ACRIS `docamount` | USD, null if unavailable |
| `balance_confirmed` | Derived | Boolean |
| `acris_url` | Constructed | Link to document on ACRIS public search |
| `signal_type` | Hardcoded Phase 1 | `"Pre-foreclosure — lis pendens"` |
| `equity_routing` | Blank | Reserved for Phase 2 |
| `asset_class_flag` | Hardcoded Phase 1 | `"unverified — manual review required"` |

---

## Delivery Mechanism

### Daily Email Digest

- **Trigger:** cron job, runs each morning at 7:00 AM ET
- **Recipient:** configured via `EMAIL_RECIPIENT` environment variable
- **Subject:** `HAFT Daily Sourcing — [N] new filings — [YYYY-MM-DD]`
- **Body:** clean HTML table of all qualifying records from the past 24 hours,
  sorted by `filing_date` descending
- **Zero results:** send a brief email — `"No new qualifying filings in the
  past 24 hours."` Do not skip the send on zero-result days. The client needs
  to know the operator ran.

### Weekly Digest (Mondays Only)

- **Trigger:** same cron schedule — detect day of week in `operator.py`
- **Coverage:** full prior 7 days
- **Subject:** `HAFT Weekly Digest — [N] filings — Week of [YYYY-MM-DD]`
- **Body:** same table format plus a borough breakdown count at the top

### Email Delivery

Use SendGrid (`SENDGRID_API_KEY`) or SMTP (`SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`). Make the provider configurable via the
`EMAIL_PROVIDER` environment variable (`sendgrid` or `smtp`).

---

## Project Structure

```
haft-operator/
  scraper/
    __init__.py
    acris.py            # ACRIS API client — query, paginate, return raw records
    filters.py          # Qualifying criteria logic — reads from config.py
    enricher.py         # Join party and legal records onto master records
  delivery/
    __init__.py
    email.py            # Email formatter and sender
    templates/
      daily.html        # HTML email template — clean, scannable table
      weekly.html       # Weekly digest template — same table + borough summary
  operator.py           # Main entry point — orchestrates the full run
  config.py             # All criteria constants — the only place to edit criteria
  criteria.md           # Human-readable criteria reference (non-code documentation)
  .env.example          # All required env vars listed and documented
  requirements.txt      # Pinned dependencies
  README.md             # Setup, configuration, run instructions, cron expression
  Makefile              # make setup / make run / make test
```

---

## Environment Variables

All credentials and configuration via environment variables. Nothing hardcoded.

```
# Email delivery
EMAIL_RECIPIENT=
EMAIL_SENDER=
EMAIL_PROVIDER=             # "sendgrid" or "smtp"

# SendGrid (if EMAIL_PROVIDER=sendgrid)
SENDGRID_API_KEY=

# SMTP (if EMAIL_PROVIDER=smtp)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# ACRIS API
ACRIS_APP_TOKEN=            # Optional but recommended for rate limits

# Logging
LOG_LEVEL=INFO              # DEBUG, INFO, WARNING, ERROR
```

Document every variable with a one-line description in `.env.example`.

---

## Scheduling

The operator is designed to run via system cron. Do not implement an internal
scheduler. Document the cron expression in `README.md`.

**Recommended cron (7:00 AM ET daily):**

```
0 12 * * * /path/to/venv/bin/python /path/to/haft-operator/operator.py
```

---

## What NOT to Build in Phase 1

- No web interface or dashboard
- No database — flat file or in-memory only
- No NYS eCourt scraper (Phase 2)
- No equity routing logic (Phase 2)
- No PropertyShark, ZoomInfo, Reonomy, or Trepp integration (Phase 2)
- No outreach automation — email, LinkedIn, or otherwise (Phase 3)
- No scoring or ranking (Phase 2)

Scope is: find → filter → enrich → deliver. Nothing else.

---

## Quality Gates

The operator is not complete until all of the following are true:

1. `make setup` produces a working environment from a clean clone
2. `make run` executes a full cycle and produces output — or a zero-results
   email — without errors
3. All credentials are via environment variables. Nothing hardcoded anywhere.
4. Structured logging throughout (not print statements). Every major step
   logged at INFO. Errors logged at ERROR with full traceback.
5. All qualifying criteria live in `config.py` only. Changing a filter requires
   editing one file, not hunting through scraper logic.
6. Zero-result runs still send an email confirmation
7. `README.md` contains complete setup instructions, the cron expression, and
   a description of each environment variable

---

## Phase Roadmap (Context Only — Do Not Build)

| Phase | Scope |
|---|---|
| **1 — This brief** | ACRIS lis pendens scraper + criteria filter + daily/weekly email delivery |
| **2** | NYS eCourt scraper, equity routing logic, fit scoring, historical storage, simple dashboard |
| **3** | Outreach automation — lender-side and borrower-side email sequences, LinkedIn, calendar booking |

---

*ADX Engine — adxengine.net*
