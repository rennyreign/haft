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
# IMPORTANT — ACRIS DATA SOURCE LIMITATION:
# Verified against live ACRIS API (16.9M records, 93 distinct doc_types, Apr 2026):
# "LIS PENDENS", "LISPENDENS", "LP", and "NOTICE OF PENDENCY" do NOT exist in
# the ACRIS Real Property Master (bnx9-e6tj) Open Data export. NYC Notices of
# Pendency (lis pendens) appear to live in NY court records (NYSCEF), not ACRIS.
#
# "JUDG" (foreclosure judgments, 1,707 records in ACRIS) is the closest available
# distress signal in this dataset. Most JUDG records carry a $0 document_amt, so
# they will pass through the balance filter as unconfirmed and require manual review.
#
# To add a true lis pendens source, integrate the NY State UCS/NYSCEF API.
DOC_TYPE_LIS_PENDENS = [
    "JUDG",
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
