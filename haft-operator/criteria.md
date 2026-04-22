# HAFT Operator — Qualifying Criteria Reference

This document describes the filtering criteria used by the operator.
All criteria values are defined in `config.py`.

## Geography

| Borough | Code | Included |
|---------|------|----------|
| Manhattan | 1 | ✅ |
| Bronx | 2 | ✅ |
| Brooklyn | 3 | ✅ |
| Queens | 4 | ✅ |
| Staten Island | 5 | ❌ |

## Distress Signal

**Phase 1 signal:** Pre-foreclosure (lis pendens filings only)

ACRIS `doc_type` values matched (verify against live API and update as needed):
- `LIS PENDENS`
- `LISPENDENS`
- `LP`

## Loan Balance

- Minimum: $3,000,000
- Maximum: $75,000,000
- Records with missing or zero balance are **included** with `balance_confirmed = false`

## Asset Class

Not filtered in Phase 1. All records flagged: `"unverified — manual review required"`
