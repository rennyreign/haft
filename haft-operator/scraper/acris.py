"""
ACRIS API Client

Queries the NYC ACRIS public dataset via the Socrata Open Data API.
Handles pagination, retries, and app-token authentication.
"""

import logging
import os
import time
from datetime import datetime, timedelta, timezone

import requests

from config import (
    ACRIS_LEGALS_URL,
    ACRIS_MASTER_URL,
    ACRIS_PARTIES_URL,
    DOC_TYPE_LIS_PENDENS,
    EXCLUDED_BOROUGHS,
    PAGE_SIZE,
)

logger = logging.getLogger(__name__)

MAX_RETRIES = 3
RETRY_BACKOFF = 2  # seconds, doubled each attempt


def _headers() -> dict:
    """Build request headers, including app token when available."""
    headers = {"Accept": "application/json"}
    token = os.getenv("ACRIS_APP_TOKEN")
    if token:
        headers["X-App-Token"] = token
    return headers


def _request_with_retry(url: str, params: dict) -> list[dict]:
    """Execute a GET request with exponential-backoff retries."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(url, params=params, headers=_headers(), timeout=30)
            resp.raise_for_status()
            return resp.json()
        except requests.RequestException as exc:
            if attempt == MAX_RETRIES:
                logger.error("Request failed after %d attempts: %s", MAX_RETRIES, exc)
                raise
            wait = RETRY_BACKOFF ** attempt
            logger.warning(
                "Request attempt %d/%d failed (%s). Retrying in %ds…",
                attempt,
                MAX_RETRIES,
                exc,
                wait,
            )
            time.sleep(wait)
    return []


def _paginate(url: str, base_params: dict) -> list[dict]:
    """Fetch all pages from a Socrata endpoint."""
    all_records: list[dict] = []
    offset = 0
    while True:
        params = {**base_params, "$limit": PAGE_SIZE, "$offset": offset}
        page = _request_with_retry(url, params)
        if not page:
            break
        all_records.extend(page)
        logger.debug("Fetched %d records (offset %d)", len(page), offset)
        if len(page) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    return all_records


def fetch_lis_pendens(hours_back: int = 24) -> list[dict]:
    """
    Query ACRIS Real Property Master for lis pendens filings
    recorded within the specified lookback window.

    Returns a list of raw record dicts.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours_back)
    cutoff_str = cutoff.strftime("%Y-%m-%dT%H:%M:%S")

    # Build the doc_type filter — match any of the known lis pendens values
    doc_type_clauses = " OR ".join(
        f"upper(doc_type)='{dt.upper()}'" for dt in DOC_TYPE_LIS_PENDENS
    )

    # Exclude Staten Island
    borough_exclude = " AND ".join(
        f"recorded_borough!='{b}'" for b in EXCLUDED_BOROUGHS
    )

    where_clause = (
        f"recorded_datetime >= '{cutoff_str}' "
        f"AND ({doc_type_clauses}) "
        f"AND {borough_exclude}"
    )

    params = {
        "$where": where_clause,
        "$order": "recorded_datetime DESC",
    }

    logger.info(
        "Querying ACRIS master for lis pendens since %s (%dh lookback)",
        cutoff_str,
        hours_back,
    )
    records = _paginate(ACRIS_MASTER_URL, params)
    logger.info("Retrieved %d raw lis pendens records", len(records))
    return records


def fetch_parties(document_id: str) -> list[dict]:
    """Fetch party records for a given document_id."""
    params = {"document_id": document_id}
    return _request_with_retry(ACRIS_PARTIES_URL, params)


def fetch_legals(document_id: str) -> list[dict]:
    """Fetch legal records for a given document_id."""
    params = {"document_id": document_id}
    return _request_with_retry(ACRIS_LEGALS_URL, params)
