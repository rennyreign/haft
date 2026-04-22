# HAFT Distress Sourcing Operator

An automated operator that monitors the NYC ACRIS (Automated City Register Information System) public records database for distressed commercial property filings — specifically lis pendens (pre-foreclosure) — and delivers filtered, enriched results as daily and weekly email digests. Built to surface acquisition opportunities matching HAFT's target criteria across Manhattan, Bronx, Brooklyn, and Queens.

---

## Prerequisites

- **Python 3.9+**
- **System cron** (for automated scheduling)

## Setup

```bash
# 1. Clone and enter the project
cd haft-operator

# 2. Create virtual environment and install dependencies
make setup

# 3. Copy the example env file and configure your variables
cp .env.example .env
```

Open `.env` and fill in the required values (see [Configuration](#configuration) below).

## Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `EMAIL_RECIPIENT` | Yes | — | Recipient email address for all digests |
| `EMAIL_SENDER` | Yes | — | Sender email address (the "from" address) |
| `EMAIL_PROVIDER` | Yes | `smtp` | Email delivery provider: `sendgrid` or `smtp` |
| `SENDGRID_API_KEY` | If SendGrid | — | SendGrid API key |
| `SMTP_HOST` | If SMTP | — | SMTP server hostname |
| `SMTP_PORT` | If SMTP | `587` | SMTP server port (typically 587 for TLS) |
| `SMTP_USER` | If SMTP | — | SMTP authentication username |
| `SMTP_PASS` | If SMTP | — | SMTP authentication password |
| `ACRIS_APP_TOKEN` | No | — | NYC Open Data app token (recommended for higher rate limits) |
| `LOG_LEVEL` | No | `INFO` | Log verbosity: `DEBUG`, `INFO`, `WARNING`, `ERROR` |

## Running

### Manual

```bash
make run
```

### Automated (cron)

Add the following to your crontab (`crontab -e`):

```cron
0 12 * * * /path/to/venv/bin/python /path/to/haft-operator/operator.py
```

> **Note:** `12:00 UTC` = **7:00 AM ET** (Eastern Time). Adjust as needed for your timezone.

## How It Works

The operator runs a four-stage pipeline on each execution:

1. **Fetch** — Queries the NYC ACRIS real property records API for recent lis pendens filings across the target boroughs.
2. **Filter** — Applies qualifying criteria (geography, document type, loan balance) to isolate relevant distress signals. See [`criteria.md`](criteria.md) for the full criteria reference.
3. **Enrich** — Augments matching records with additional property and filing details from ACRIS cross-reference tables.
4. **Deliver** — Formats results into an email digest and sends it to the configured recipient.

### Daily vs. Weekly Digests

- **Daily runs** report new filings recorded since the previous execution.
- **Weekly digests** (triggered on Monday) aggregate the prior seven days of results into a single summary email, including counts and trends.

## Phase Roadmap

| Phase | Scope | Status |
|---|---|---|
| **Phase 1** | Lis pendens monitoring, balance filtering, email delivery | ✅ Current |
| **Phase 2** | Asset class verification, property type enrichment, deduplication | 🔜 Planned |
| **Phase 3** | Multi-signal tracking (UCC, defaults), scoring model, dashboard | 🔜 Future |

## License

**Proprietary** — All rights reserved.
