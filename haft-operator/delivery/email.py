"""
Email Formatter & Sender

Formats enriched records into HTML email digests and sends
via SendGrid API or SMTP based on EMAIL_PROVIDER env var.
"""

import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from string import Template

import requests

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).parent / "templates"


def _load_template(name: str) -> Template:
    """Load an HTML template from the templates directory."""
    path = TEMPLATES_DIR / name
    return Template(path.read_text(encoding="utf-8"))


def _format_currency(value) -> str:
    """Format a numeric value as USD currency."""
    if value is None:
        return "N/A"
    try:
        return f"${float(value):,.0f}"
    except (ValueError, TypeError):
        return "N/A"


def _build_records_table(records: list[dict]) -> str:
    """Build an HTML table of enriched records."""
    if not records:
        return (
            '<p style="color:#666;font-size:14px;">'
            "No new qualifying filings in the past 24 hours.</p>"
        )

    header = """
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
      <tr>
        <th style="text-align:left;padding:10px 8px;background-color:#1a1a2e;color:#fff;font-weight:600;">Property Address</th>
        <th style="text-align:left;padding:10px 8px;background-color:#1a1a2e;color:#fff;font-weight:600;">Borough</th>
        <th style="text-align:left;padding:10px 8px;background-color:#1a1a2e;color:#fff;font-weight:600;">Filing Date</th>
        <th style="text-align:left;padding:10px 8px;background-color:#1a1a2e;color:#fff;font-weight:600;">Doc Type</th>
        <th style="text-align:left;padding:10px 8px;background-color:#1a1a2e;color:#fff;font-weight:600;">Party 1</th>
        <th style="text-align:left;padding:10px 8px;background-color:#1a1a2e;color:#fff;font-weight:600;">Party 2</th>
        <th style="text-align:right;padding:10px 8px;background-color:#1a1a2e;color:#fff;font-weight:600;">Est. Balance</th>
        <th style="text-align:left;padding:10px 8px;background-color:#1a1a2e;color:#fff;font-weight:600;">Balance Source</th>
        <th style="text-align:center;padding:10px 8px;background-color:#1a1a2e;color:#fff;font-weight:600;">ACRIS</th>
        <th style="text-align:center;padding:10px 8px;background-color:#1a1a2e;color:#fff;font-weight:600;">NYSCEF</th>
      </tr>
    """

    rows = []
    for i, r in enumerate(records):
        bg = "#ffffff" if i % 2 == 0 else "#f9f9fb"
        balance_source = r.get("balance_source", "Manual lookup required")
        filing_date = (r.get("filing_date") or "")[:10]
        rows.append(f"""
      <tr style="background-color:{bg};">
        <td style="padding:8px;border-bottom:1px solid #eee;">{r.get('property_address', 'N/A')}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">{r.get('borough', 'N/A')}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">{filing_date}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">{r.get('document_type', 'N/A')}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">{r.get('party_1_name', 'N/A')}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">{r.get('party_2_name', 'N/A')}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">{_format_currency(r.get('estimated_loan_balance'))}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">{balance_source}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;"><a href="{r.get('acris_url', '#')}" style="color:#1a73e8;text-decoration:none;">View</a></td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">{f'<a href="{r["nyscef_url"]}" style="color:#1a73e8;text-decoration:none;">Search</a>' if r.get("nyscef_url") else "—"}</td>
      </tr>""")

    return header + "\n".join(rows) + "\n    </table>"


def _build_borough_summary(borough_breakdown: dict[str, int]) -> str:
    """Build HTML table rows for the borough breakdown summary."""
    rows = []
    for i, (borough, count) in enumerate(sorted(borough_breakdown.items())):
        bg = "#ffffff" if i % 2 == 0 else "#f9f9fb"
        rows.append(
            f'<tr style="background-color:{bg};">'
            f'<td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;">{borough}</td>'
            f'<td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right;">{count}</td>'
            f"</tr>"
        )
    return "\n".join(rows)


def format_daily_email(records: list[dict], date_str: str) -> str:
    """Render the daily HTML email."""
    template = _load_template("daily.html")
    content = _build_records_table(records)
    return template.safe_substitute(
        date=date_str,
        count=str(len(records)),
        content=content,
    )


def format_weekly_email(
    records: list[dict],
    date_str: str,
    borough_breakdown: dict[str, int],
) -> str:
    """Render the weekly HTML email."""
    template = _load_template("weekly.html")
    content = _build_records_table(records)
    borough_summary = _build_borough_summary(borough_breakdown)
    return template.safe_substitute(
        date=date_str,
        count=str(len(records)),
        content=content,
        borough_summary=borough_summary,
    )


def send_email(subject: str, html_body: str) -> None:
    """
    Send an HTML email using the configured provider.

    Reads EMAIL_PROVIDER from environment to choose between
    SendGrid API and SMTP.
    """
    provider = (os.getenv("EMAIL_PROVIDER") or "smtp").lower().strip()
    recipient_raw = os.getenv("EMAIL_RECIPIENT")
    sender = os.getenv("EMAIL_SENDER")

    if not recipient_raw or not sender:
        raise ValueError("EMAIL_RECIPIENT and EMAIL_SENDER must be set")

    recipients = [r.strip() for r in recipient_raw.split(",") if r.strip()]

    if provider == "sendgrid":
        _send_via_sendgrid(sender, recipients, subject, html_body)
    elif provider == "smtp":
        _send_via_smtp(sender, recipients, subject, html_body)
    else:
        raise ValueError(f"Unknown EMAIL_PROVIDER: {provider}")


def _send_via_sendgrid(
    sender: str, recipients: list[str], subject: str, html_body: str
) -> None:
    """Send email using SendGrid v3 API."""
    api_key = os.getenv("SENDGRID_API_KEY")
    if not api_key:
        raise ValueError("SENDGRID_API_KEY must be set when using SendGrid")

    payload = {
        "personalizations": [{"to": [{"email": r} for r in recipients]}],
        "from": {"email": sender},
        "subject": subject,
        "content": [{"type": "text/html", "value": html_body}],
    }

    resp = requests.post(
        "https://api.sendgrid.com/v3/mail/send",
        json=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        timeout=30,
    )

    if resp.status_code in (200, 202):
        logger.info("Email sent via SendGrid to %s", ", ".join(recipients))
    else:
        logger.error(
            "SendGrid send failed: %d %s", resp.status_code, resp.text
        )
        resp.raise_for_status()


def _send_via_smtp(
    sender: str, recipients: list[str], subject: str, html_body: str
) -> None:
    """Send email using SMTP."""
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASS")

    if not host:
        raise ValueError("SMTP_HOST must be set when using SMTP")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = ", ".join(recipients)
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(host, port) as server:
        server.ehlo()
        if port != 25:
            server.starttls()
            server.ehlo()
        if user and password:
            server.login(user, password)
        server.sendmail(sender, recipients, msg.as_string())

    logger.info("Email sent via SMTP to %s", ", ".join(recipients))
