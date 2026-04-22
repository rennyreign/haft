"""
HAFT Operator — Configuration & Qualifying Criteria

All filtering criteria and constants live here. This is the only file
that needs editing to change what the operator considers a qualifying record.
"""

# ---------------------------------------------------------------------------
# ACRIS API Endpoints (NYC Open Data / Socrata)
# ---------------------------------------------------------------------------

ACRIS_MASTER_URL = "https://data.cityofnewyork.us/resource/bnx9-e6tj.json"
ACRIS_PARTIES_URL = "https://data.cityofnewyork.us/resource/636b-3b5g.json"
ACRIS_LEGALS_URL = "https://data.cityofnewyork.us/resource/8h5j-fqxa.json"

# Pagination
PAGE_SIZE = 1000

# ---------------------------------------------------------------------------
# Geography
# ---------------------------------------------------------------------------

INCLUDED_BOROUGHS = {
    "1": "Manhattan",
    "2": "Bronx",
    "3": "Brooklyn",
    "4": "Queens",
}

EXCLUDED_BOROUGHS = ["5"]

# ---------------------------------------------------------------------------
# Distress Signal — Document Types
# ---------------------------------------------------------------------------

# Pre-foreclosure / distress signal doc_type values.
#
# Verified against live ACRIS API (Apr 2026):
# "PREL" = Notice of Pendency (lis pendens) — 118k+ records in ACRIS.
# This is the correct doc_type for pre-foreclosure filings.
DOC_TYPE_LIS_PENDENS = [
    "PREL",
]

# ---------------------------------------------------------------------------
# Loan Balance
# ---------------------------------------------------------------------------

LOAN_BALANCE_MIN = 3_000_000
LOAN_BALANCE_MAX = 75_000_000

# ---------------------------------------------------------------------------
# Lookback Windows
# ---------------------------------------------------------------------------

LOOKBACK_HOURS_DAILY = 24
LOOKBACK_DAYS_WEEKLY = 7

# ---------------------------------------------------------------------------
# Output Constants
# ---------------------------------------------------------------------------

SIGNAL_TYPE = "Pre-foreclosure — lis pendens"
ASSET_CLASS_FLAG = "unverified — manual review required"

# ---------------------------------------------------------------------------
# ACRIS Public Search URL template
# ---------------------------------------------------------------------------

ACRIS_DOCUMENT_URL = (
    "https://a836-acris.nyc.gov/DS/DocumentSearch/DocumentImageView?doc_id={document_id}"
)
