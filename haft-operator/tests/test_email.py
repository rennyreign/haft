"""
Unit tests for delivery/email.py

Tests run entirely offline — no SMTP or SendGrid calls.
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from delivery.email import (
    _format_currency,
    _build_records_table,
    _build_borough_summary,
    format_daily_email,
    format_weekly_email,
)


# ---------------------------------------------------------------------------
# Currency formatting
# ---------------------------------------------------------------------------


def test_format_currency_integer():
    assert _format_currency(5_000_000) == "$5,000,000"


def test_format_currency_float_string():
    assert _format_currency("3500000.0") == "$3,500,000"


def test_format_currency_none():
    assert _format_currency(None) == "N/A"


def test_format_currency_bad_string():
    assert _format_currency("not-a-number") == "N/A"


# ---------------------------------------------------------------------------
# Records table HTML
# ---------------------------------------------------------------------------


def _make_record(**kwargs):
    base = {
        "property_address": "100 Main St, Manhattan",
        "borough": "Manhattan",
        "filing_date": "2026-04-01T00:00:00.000",
        "document_type": "JUDG",
        "document_id": "2026010100001001",
        "party_1_name": "ACME LENDER LLC",
        "party_2_name": "SMITH, JOHN",
        "estimated_loan_balance": None,
        "balance_confirmed": False,
        "acris_url": "https://a836-acris.nyc.gov/DS/DocumentSearch/DocumentImageView?doc_id=2026010100001001",
        "signal_type": "Pre-foreclosure — lis pendens",
        "equity_routing": "",
        "asset_class_flag": "unverified — manual review required",
    }
    base.update(kwargs)
    return base


def test_build_records_table_empty():
    html = _build_records_table([])
    assert "No new qualifying filings" in html


def test_build_records_table_has_row():
    html = _build_records_table([_make_record()])
    assert "100 Main St" in html
    assert "ACME LENDER LLC" in html
    assert "JUDG" in html


def test_build_records_table_confirmed_balance():
    html = _build_records_table([_make_record(estimated_loan_balance=5_000_000, balance_confirmed=True)])
    assert "$5,000,000" in html
    assert "✓" in html


def test_build_records_table_unconfirmed_balance():
    html = _build_records_table([_make_record()])
    assert "N/A" in html
    assert "—" in html


def test_build_records_table_date_truncated():
    html = _build_records_table([_make_record()])
    assert "2026-04-01" in html
    assert "T00:00:00" not in html


# ---------------------------------------------------------------------------
# Borough summary HTML
# ---------------------------------------------------------------------------


def test_build_borough_summary_output():
    breakdown = {"Manhattan": 3, "Brooklyn": 5, "Bronx": 1, "Queens": 2}
    html = _build_borough_summary(breakdown)
    assert "Manhattan" in html
    assert "Brooklyn" in html
    assert "5" in html


def test_build_borough_summary_sorted():
    breakdown = {"Queens": 2, "Bronx": 1}
    html = _build_borough_summary(breakdown)
    bronx_pos = html.index("Bronx")
    queens_pos = html.index("Queens")
    assert bronx_pos < queens_pos


# ---------------------------------------------------------------------------
# Full template rendering
# ---------------------------------------------------------------------------


def test_format_daily_email_renders():
    html = format_daily_email([_make_record()], "2026-04-01")
    assert "HAFT Daily Sourcing Report" in html
    assert "2026-04-01" in html
    assert "1 qualifying filing" in html


def test_format_daily_email_no_records():
    html = format_daily_email([], "2026-04-01")
    assert "0 qualifying filing" in html
    assert "No new qualifying filings" in html


def test_format_weekly_email_renders():
    breakdown = {"Manhattan": 1, "Bronx": 0, "Brooklyn": 0, "Queens": 0}
    html = format_weekly_email([_make_record()], "2026-04-01", breakdown)
    assert "HAFT Weekly Digest" in html
    assert "Borough Breakdown" in html
    assert "Manhattan" in html
