# HAFT Distress Sourcing Operator

**For:** Kyle  
**From:** Renaldo  
**Type:** ADX Operator — fully autonomous, zero human execution

---

## What This Is

This is an ADX Operator. That means it's a piece of software that runs a complete intelligence workflow autonomously — no human in the loop once it's running. You initiate it once (via a cron schedule), and it delivers structured output to your inbox every morning. That's it.

This specific operator watches New York City's public property records database (ACRIS) daily and surfaces commercial real estate properties in pre-foreclosure or distress. It's designed to give you a qualified deal pipeline before the market knows those assets are available.

---

## What It Does — End to End

Every day at 7:00 AM Eastern, the operator wakes up and runs the following pipeline automatically:

**1. Fetch**  
Queries the NYC ACRIS Open Data API for newly recorded distress-signal documents (foreclosure judgments, lis pendens-adjacent filings) across Manhattan, Brooklyn, the Bronx, and Queens. Excludes Staten Island. Paginated — captures everything filed in the past 24 hours.

**2. Filter**  
Applies qualifying criteria to every raw record:
- Borough must be one of the four target boroughs
- Document type must match the configured distress signal list
- If a loan balance is present, it must fall between $3M and $75M
- Records with no balance data pass through flagged for manual review — they're not discarded

**3. Enrich**  
For each qualifying record, the operator makes two additional API calls to pull:
- Party names (borrower and lender)
- Property address from legal records
- A direct link to the ACRIS document viewer

**4. Deliver**  
Formats everything into a clean HTML email and sends it to your inbox. If there are zero qualifying filings that day, you still get an email — so you know the system ran and nothing was missed.

On Mondays, it also sends a weekly digest with a borough-by-borough breakdown of the past 7 days.

---

## What You Receive

A structured digest in your inbox each morning containing:

| Field | Description |
|---|---|
| Property Address | Street address and borough |
| Filing Date | Date recorded in ACRIS |
| Document Type | The distress signal code |
| Party 1 | Typically the borrower / property owner |
| Party 2 | Typically the lender / plaintiff |
| Est. Loan Balance | Dollar amount if available in the filing |
| Confirmed | Whether the balance was explicitly in the record |
| ACRIS Link | One-click link to the original document |

---

## What It Is Not

- It is not a decision-making tool. It surfaces signals — you decide what to act on.
- It is not a scraper of private data. Everything comes from NYC's public Open Data API.
- It does not send outreach or contact anyone. It is purely a sourcing intelligence layer.

---

## Data Source Limitation — Important Context

NYC ACRIS (the public property records database) does not currently export Notices of Pendency (lis pendens) as a distinct document type in its Open Data feed. After checking all 93 document type codes across 16.9 million records, the closest available distress signal in ACRIS is `JUDG` — foreclosure judgments.

**True lis pendens filings are recorded through the NY State court system (NYSCEF), not ACRIS.** Integrating the NYSCEF API would be the natural Phase 2 upgrade — it would dramatically increase deal flow volume and provide earlier-stage signals before a judgment is entered.

---

## Human Touch Points

| When | Who | What |
|---|---|---|
| Initial setup | Operator | Configure `.env` credentials once |
| Daily | Kyle | Review inbox, flag properties of interest |
| As needed | Operator | Update filter criteria in `config.py` |
| Phase 2 | Developer | Integrate NYSCEF for true lis pendens data |

---

## Tech Stack

- **Language:** Python 3.x
- **Data source:** NYC Open Data / ACRIS Socrata API
- **Email:** Gmail SMTP (upgradeable to SendGrid)
- **Scheduling:** macOS cron (7 AM ET daily)
- **Dependencies:** `requests`, `python-dotenv` — nothing exotic
