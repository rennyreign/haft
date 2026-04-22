"""
Record Enricher

Joins party and legal data onto filtered master records to produce
the final structured output defined in the project brief.
"""

import logging

from config import (
    ACRIS_DOCUMENT_URL,
    ASSET_CLASS_FLAG,
    INCLUDED_BOROUGHS,
    SIGNAL_TYPE,
)
from scraper.acris import fetch_legals, fetch_parties

logger = logging.getLogger(__name__)


def _borough_name(code) -> str:
    """Convert a borough code to its human-readable name."""
    return INCLUDED_BOROUGHS.get(str(code), f"Unknown ({code})")


def _build_address(legals: list[dict], borough_code) -> str:
    """Construct a property address from legal records."""
    if not legals:
        return "Address unavailable"

    legal = legals[0]
    parts = []

    street_number = (legal.get("street_number") or "").strip()
    street_name = (legal.get("street_name") or "").strip()

    if street_number:
        parts.append(street_number)
    if street_name:
        parts.append(street_name)

    if parts:
        parts.append(f", {_borough_name(borough_code)}")
        return " ".join(parts)

    return f"Address unavailable — {_borough_name(borough_code)}"


def _extract_parties(parties: list[dict], party_type: str) -> str:
    """Extract and join party names of a given type."""
    names = []
    for p in parties:
        if str(p.get("party_type", "")).strip() == party_type:
            name = (p.get("name") or "").strip()
            if name:
                names.append(name)
    return "; ".join(names) if names else "N/A"


def enrich_records(records: list[dict]) -> list[dict]:
    """
    Enrich filtered records with party, legal, and derived fields.

    Returns a list of fully structured output records ready for delivery.
    """
    enriched = []

    for i, record in enumerate(records, 1):
        document_id = record.get("document_id", "")
        borough_code = record.get("recorded_borough", "")

        try:
            parties = fetch_parties(document_id)
            legals = fetch_legals(document_id)
        except Exception:
            logger.exception(
                "Failed to enrich document %s — skipping", document_id
            )
            continue

        enriched_record = {
            "property_address": _build_address(legals, borough_code),
            "borough": _borough_name(borough_code),
            "filing_date": record.get("recorded_datetime", ""),
            "document_type": record.get("doc_type", ""),
            "document_id": document_id,
            "party_1_name": _extract_parties(parties, "1"),
            "party_2_name": _extract_parties(parties, "2"),
            "estimated_loan_balance": record.get("estimated_loan_balance"),
            "balance_confirmed": record.get("balance_confirmed", False),
            "acris_url": ACRIS_DOCUMENT_URL.format(document_id=document_id),
            "signal_type": SIGNAL_TYPE,
            "equity_routing": "",
            "asset_class_flag": ASSET_CLASS_FLAG,
        }
        enriched.append(enriched_record)

        if i % 10 == 0:
            logger.debug("Enriched %d / %d records", i, len(records))

    logger.info("Enrichment complete: %d records enriched", len(enriched))
    return enriched
