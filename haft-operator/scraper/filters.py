"""
Qualifying Criteria Filters

Applies all Phase 1 filtering rules defined in config.py to raw ACRIS records.
"""

import logging

from config import (
    DOC_TYPE_LIS_PENDENS,
    EXCLUDED_BOROUGHS,
    LOAN_BALANCE_MAX,
    LOAN_BALANCE_MIN,
)

logger = logging.getLogger(__name__)


def _normalise_borough(value) -> str:
    """Ensure borough is a string for consistent comparison."""
    return str(value).strip() if value is not None else ""


def _passes_borough(record: dict) -> bool:
    borough = _normalise_borough(record.get("recorded_borough"))
    return borough not in EXCLUDED_BOROUGHS and borough != ""


def _passes_doc_type(record: dict) -> bool:
    doc_type = (record.get("doc_type") or "").strip().upper()
    return doc_type in [dt.upper() for dt in DOC_TYPE_LIS_PENDENS]


def _parse_amount(record: dict) -> tuple[float | None, str]:
    """
    Parse document_amt and determine balance_source label.

    Returns (amount, balance_source).
    balance_source values:
      "ACRIS filing"           — amount present in the ACRIS record
      "Manual lookup required" — field missing or zero in ACRIS
    """
    raw = record.get("document_amt")
    if raw is None or raw == "" or raw == "0" or raw == 0:
        return None, "Manual lookup required"

    try:
        amount = float(raw)
    except (ValueError, TypeError):
        return None, "Manual lookup required"

    if amount <= 0:
        return None, "Manual lookup required"

    return amount, "ACRIS filing"


def _passes_balance(amount: float | None, balance_source: str) -> bool:
    """
    If balance came from ACRIS, it must be within the min/max range.
    If source is manual lookup (missing), the record is included.
    """
    if balance_source != "ACRIS filing":
        return True
    return LOAN_BALANCE_MIN <= amount <= LOAN_BALANCE_MAX


def apply_filters(records: list[dict]) -> list[dict]:
    """
    Apply all qualifying criteria to a list of raw ACRIS master records.

    Returns filtered records with `balance_source` and
    `estimated_loan_balance` fields added.
    """
    filtered = []
    skipped_borough = 0
    skipped_doc_type = 0
    skipped_balance = 0

    for record in records:
        if not _passes_borough(record):
            skipped_borough += 1
            continue

        if not _passes_doc_type(record):
            skipped_doc_type += 1
            continue

        amount, balance_source = _parse_amount(record)

        if not _passes_balance(amount, balance_source):
            skipped_balance += 1
            continue

        record["estimated_loan_balance"] = amount
        record["balance_source"] = balance_source
        filtered.append(record)

    logger.info(
        "Filtering complete: %d passed, %d skipped "
        "(borough=%d, doc_type=%d, balance=%d)",
        len(filtered),
        skipped_borough + skipped_doc_type + skipped_balance,
        skipped_borough,
        skipped_doc_type,
        skipped_balance,
    )
    return filtered
