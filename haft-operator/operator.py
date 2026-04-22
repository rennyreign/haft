"""
HAFT Distress Sourcing Operator — Main Entry Point

Orchestrates the full daily (and weekly) pipeline:
  fetch → filter → enrich → deliver

Designed to run via system cron. Not an interactive tool.
"""

import logging
import os
import sys
import traceback
from collections import Counter
from datetime import datetime, timezone

from dotenv import load_dotenv

from config import INCLUDED_BOROUGHS, LOOKBACK_DAYS_WEEKLY, LOOKBACK_HOURS_DAILY
from delivery.email import format_daily_email, format_weekly_email, send_email
from scraper.acris import fetch_lis_pendens
from scraper.enricher import enrich_records
from scraper.filters import apply_filters

load_dotenv()

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("haft-operator")


# ---------------------------------------------------------------------------
# Pipeline helpers
# ---------------------------------------------------------------------------


def _borough_breakdown(records: list[dict]) -> dict[str, int]:
    """Count filings by borough for the weekly summary."""
    counts = Counter(r.get("borough", "Unknown") for r in records)
    # Ensure all included boroughs appear, even with zero count
    for name in INCLUDED_BOROUGHS.values():
        counts.setdefault(name, 0)
    return dict(counts)


def _run_daily() -> None:
    """Execute the daily pipeline."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    logger.info("=== DAILY RUN — %s ===", today)

    raw = fetch_lis_pendens(hours_back=LOOKBACK_HOURS_DAILY)
    filtered = apply_filters(raw)
    enriched = enrich_records(filtered)

    subject = f"HAFT Daily Sourcing — {len(enriched)} new filings — {today}"
    html = format_daily_email(enriched, today)

    send_email(subject, html)
    logger.info("Daily digest sent: %d records", len(enriched))


def _run_weekly() -> None:
    """Execute the weekly pipeline (Monday only)."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    logger.info("=== WEEKLY RUN — Week of %s ===", today)

    hours_back = LOOKBACK_DAYS_WEEKLY * 24
    raw = fetch_lis_pendens(hours_back=hours_back)
    filtered = apply_filters(raw)
    enriched = enrich_records(filtered)

    breakdown = _borough_breakdown(enriched)

    subject = f"HAFT Weekly Digest — {len(enriched)} filings — Week of {today}"
    html = format_weekly_email(enriched, today, breakdown)

    send_email(subject, html)
    logger.info("Weekly digest sent: %d records", len(enriched))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    """Run the operator — daily always, weekly on Mondays."""
    logger.info("Operator starting")

    try:
        _run_daily()

        # Monday = 0 in Python's weekday()
        if datetime.now(timezone.utc).weekday() == 0:
            _run_weekly()
        else:
            logger.info("Not Monday — skipping weekly digest")

        logger.info("Operator finished successfully")

    except Exception:
        logger.error("Operator failed:\n%s", traceback.format_exc())
        sys.exit(1)


if __name__ == "__main__":
    main()
