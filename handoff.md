# Handoff: HAFT Operator — API Connection Setup

## What This Project Is

A Python operator that scrapes NYC ACRIS (public property records) daily for pre-foreclosure filings and emails a digest to a commercial real estate broker. The code is fully built — it just needs the API connections wired up and tested against live data.

## Project Location

```
listing-scraper/haft-operator/
```

## What Needs To Be Done

### 1. Verify the ACRIS doc_type Value

The operator filters for lis pendens filings, but the exact `doc_type` string used by ACRIS needs to be confirmed against the live API.

**Hit this endpoint and look at what doc_type values exist:**
```
https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=distinct doc_type&$limit=200
```

Once you find the correct value(s) for lis pendens, update the list in:
```
haft-operator/config.py → DOC_TYPE_LIS_PENDENS
```

Currently set to: `["LIS PENDENS", "LISPENDENS", "LP", "NOTICE OF PENDENCY"]`

### 2. Get an ACRIS App Token (Optional but Recommended)

Without a token, ACRIS rate-limits you aggressively. Get a free one:

1. Go to https://data.cityofnewyork.us/
2. Sign up for an account
3. Go to Developer Settings → Create New App Token
4. Add the token to `.env` as `ACRIS_APP_TOKEN`

### 3. Set Up Email Delivery

The operator supports two email providers. Pick one:

**Option A — SMTP (simpler)**
If you have a Gmail, Outlook, or any SMTP server:
```env
EMAIL_PROVIDER=smtp
EMAIL_RECIPIENT=client@example.com
EMAIL_SENDER=operator@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```
Note: Gmail requires an "App Password" — not your regular password. Google "Gmail app password" to set one up.

**Option B — SendGrid**
If you have or want a SendGrid account:
```env
EMAIL_PROVIDER=sendgrid
EMAIL_RECIPIENT=client@example.com
EMAIL_SENDER=operator@yourdomain.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
```

The email code lives in: `haft-operator/delivery/email.py`

### 4. Test a Live Run

```bash
cd haft-operator
make setup
cp .env.example .env
# Fill in .env with your values
make run
```

Check the terminal output — it logs every step. If ACRIS returns records and the email sends, you're good.

### 5. Set Up the Cron Job

Once the manual run works, schedule it to run automatically at 7 AM ET every day:

```bash
crontab -e
```

Add this line (adjust paths to match your machine):
```
0 12 * * * /path/to/haft-operator/venv/bin/python /path/to/haft-operator/operator.py
```

12:00 UTC = 7:00 AM Eastern.

## Key Files Reference

| File | What It Does |
|------|-------------|
| `config.py` | All filter criteria — boroughs, doc types, balance range |
| `scraper/acris.py` | Talks to the ACRIS API — fetching, pagination, retries |
| `scraper/filters.py` | Applies the qualifying criteria to raw records |
| `scraper/enricher.py` | Adds party names, addresses, and links to each record |
| `delivery/email.py` | Formats HTML email and sends via SendGrid or SMTP |
| `operator.py` | Main script — runs the full pipeline |
| `.env` | Your credentials (create from `.env.example`) |

## Dependencies

Just two external packages (already in `requirements.txt`):
- `requests` — HTTP calls to ACRIS and SendGrid
- `python-dotenv` — loads `.env` file

## Gotchas

- ACRIS borough codes are strings in some endpoints, ints in others. The code handles both — don't change that.
- If ACRIS returns zero results, the operator still sends an email saying "no new filings." That's intentional — the client needs to know it ran.
- The weekly digest only fires on Mondays. To test it on another day, temporarily change `datetime.now(timezone.utc).weekday() == 0` in `operator.py` to match today's weekday number (0=Mon, 1=Tue, etc).
