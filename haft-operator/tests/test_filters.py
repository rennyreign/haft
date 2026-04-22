"""
Unit tests for scraper/filters.py

Tests run entirely offline — no ACRIS API calls.
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from scraper.filters import (
    _normalise_borough,
    _passes_borough,
    _passes_doc_type,
    _parse_amount,
    _passes_balance,
    apply_filters,
)


# ---------------------------------------------------------------------------
# Borough normalisation
# ---------------------------------------------------------------------------


def test_normalise_borough_string():
    assert _normalise_borough("3") == "3"


def test_normalise_borough_int():
    assert _normalise_borough(4) == "4"


def test_normalise_borough_none():
    assert _normalise_borough(None) == ""


def test_normalise_borough_strips_whitespace():
    assert _normalise_borough("  2  ") == "2"


# ---------------------------------------------------------------------------
# Borough filter
# ---------------------------------------------------------------------------


def test_passes_borough_included():
    assert _passes_borough({"recorded_borough": "1"}) is True


def test_passes_borough_excluded_staten_island():
    assert _passes_borough({"recorded_borough": "5"}) is False


def test_passes_borough_missing_field():
    assert _passes_borough({}) is False


def test_passes_borough_int_value():
    assert _passes_borough({"recorded_borough": 2}) is True


# ---------------------------------------------------------------------------
# Doc-type filter
# ---------------------------------------------------------------------------


def test_passes_doc_type_match():
    assert _passes_doc_type({"doc_type": "JUDG"}) is True


def test_passes_doc_type_case_insensitive():
    assert _passes_doc_type({"doc_type": "judg"}) is True


def test_passes_doc_type_no_match():
    assert _passes_doc_type({"doc_type": "DEED"}) is False


def test_passes_doc_type_missing():
    assert _passes_doc_type({}) is False


# ---------------------------------------------------------------------------
# Amount parsing
# ---------------------------------------------------------------------------


def test_parse_amount_valid():
    amount, confirmed = _parse_amount({"document_amt": "5000000"})
    assert amount == 5_000_000.0
    assert confirmed is True


def test_parse_amount_zero_string():
    amount, confirmed = _parse_amount({"document_amt": "0"})
    assert amount is None
    assert confirmed is False


def test_parse_amount_zero_int():
    amount, confirmed = _parse_amount({"document_amt": 0})
    assert amount is None
    assert confirmed is False


def test_parse_amount_missing():
    amount, confirmed = _parse_amount({})
    assert amount is None
    assert confirmed is False


def test_parse_amount_empty_string():
    amount, confirmed = _parse_amount({"document_amt": ""})
    assert amount is None
    assert confirmed is False


def test_parse_amount_non_numeric():
    amount, confirmed = _parse_amount({"document_amt": "N/A"})
    assert amount is None
    assert confirmed is False


def test_parse_amount_negative():
    amount, confirmed = _parse_amount({"document_amt": "-1000"})
    assert amount is None
    assert confirmed is False


# ---------------------------------------------------------------------------
# Balance filter
# ---------------------------------------------------------------------------


def test_passes_balance_within_range():
    assert _passes_balance(10_000_000.0, True) is True


def test_passes_balance_below_min():
    assert _passes_balance(1_000_000.0, True) is False


def test_passes_balance_above_max():
    assert _passes_balance(100_000_000.0, True) is False


def test_passes_balance_unconfirmed_passes_through():
    assert _passes_balance(None, False) is True


# ---------------------------------------------------------------------------
# Full pipeline: apply_filters
# ---------------------------------------------------------------------------


def _make_record(**kwargs):
    base = {
        "document_id": "2026010100001001",
        "recorded_borough": "1",
        "doc_type": "JUDG",
        "document_amt": "0",
        "recorded_datetime": "2026-04-01T00:00:00.000",
    }
    base.update(kwargs)
    return base


def test_apply_filters_valid_record_passes():
    records = [_make_record()]
    result = apply_filters(records)
    assert len(result) == 1
    assert result[0]["balance_confirmed"] is False
    assert result[0]["estimated_loan_balance"] is None


def test_apply_filters_excluded_borough_dropped():
    records = [_make_record(recorded_borough="5")]
    assert apply_filters(records) == []


def test_apply_filters_wrong_doc_type_dropped():
    records = [_make_record(doc_type="DEED")]
    assert apply_filters(records) == []


def test_apply_filters_balance_out_of_range_dropped():
    records = [_make_record(document_amt="100000")]
    assert apply_filters(records) == []


def test_apply_filters_confirmed_balance_in_range_passes():
    records = [_make_record(document_amt="10000000")]
    result = apply_filters(records)
    assert len(result) == 1
    assert result[0]["balance_confirmed"] is True
    assert result[0]["estimated_loan_balance"] == 10_000_000.0


def test_apply_filters_mixed_records():
    records = [
        _make_record(),                          # passes (unconfirmed balance)
        _make_record(recorded_borough="5"),      # dropped — SI
        _make_record(doc_type="DEED"),           # dropped — wrong type
        _make_record(document_amt="10000000"),   # passes (confirmed, in range)
    ]
    result = apply_filters(records)
    assert len(result) == 2
