# Post-Market Surveillance

This document describes the post-market surveillance process for `ruralpeds` software devices, implemented via GitHub Issues and automated workflow tracking.

---

## Overview

Post-market surveillance (PMS) is the systematic collection and analysis of experience gained from medical devices after they have been placed on the market. For software medical devices (IEC 62304 §7.4), this includes:

- Adverse events
- Complaints (functional failures, unexpected behaviour)
- Near-misses
- Trend analysis across multiple reports

---

## Reporting a Post-Market Event

1. Open a new GitHub Issue in the relevant repository using the **Post-Market Event Report** template.
2. Fill in all required fields (event date, device version, event type, severity, regulatory disposition).
3. The issue must be labeled `post-market` — this triggers the automated tracker.
4. The `post-market-tracker.yml` workflow will append a JSONL entry to `dhf/post-market/complaints.jsonl` within 5 minutes and post a confirmation comment.

**Do not include real patient data (PHI/ePHI) in any issue, attachment, or description.** Use de-identified or synthetic data only.

---

## Automated Tracking

The `post-market-tracker.yml` workflow fires on `issues.labeled` and `issues.edited` events when the `post-market` label is present. It:

1. Extracts metadata: issue number, title, URL, timestamp, actor.
2. Appends a JSON Lines entry to `dhf/post-market/complaints.jsonl` (append-only WORM format).
3. Validates the JSON is well-formed before committing.
4. Commits with message `audit(post-market): record event for issue #N [skip ci]`.
5. Posts a confirmation comment on the issue with next-step guidance.

### Audit log format (`dhf/post-market/complaints.jsonl`)

Each line is a self-contained JSON object:

```jsonl
{"timestamp":"2026-05-10T09:15:00Z","event_type":"post-market-event","action":"labeled","issue_number":42,"title":"Post-Market Event: PedNeoSim v1.2.0 — Adverse event","repo":"ruralpeds/.github","actor":"timothyhartzog","event_url":"https://github.com/ruralpeds/.github/issues/42"}
```

| Field | Description |
|---|---|
| `timestamp` | ISO 8601 UTC timestamp when the event was recorded |
| `event_type` | Always `post-market-event` (or `chain.genesis` for the first entry) |
| `action` | GitHub event action: `labeled` or `edited` |
| `issue_number` | GitHub issue number |
| `title` | Issue title (sanitised — no PHI) |
| `repo` | `owner/repo` where the issue lives |
| `actor` | GitHub login of the user who triggered the event |
| `event_url` | Direct URL to the GitHub issue |

---

## SLA

| Milestone | Target |
|---|---|
| Workflow triggers after `post-market` label applied | < 2 minutes |
| Audit log entry committed | < 5 minutes |
| Confirmation comment posted on issue | < 5 minutes |
| Initial investigation assigned | < 24 hours |
| FDA MedWatch filing (if reportable) | ≤ 30 calendar days |

---

## Regulatory Alignment

### 21 CFR Part 806 — Medical Device Reports

The complaints.jsonl log satisfies the documentation requirements for Device Complaint Files (21 CFR 820.198) and supports the investigation timeline for MDR filing (21 CFR 803):

- **Serious injury / death**: MDR required within 30 days
- **Device malfunction**: MDR required within 30 days (if likely to recur and cause injury)
- **Non-reportable complaints**: Documented and retained; available for FDA inspection

### IEC 62304 §7.4 — Post-Market Monitoring

The workflow implements the monitoring activities required by IEC 62304 §7.4:

- **Collection**: GitHub issue template ensures structured, complete data capture
- **Analysis**: Labels and issue project boards enable trend analysis across reports
- **Feedback loop**: CAPA issues link back to software requirements (SW-NNN) and hazard analysis (HZ-NNN) in the DHF
- **Traceability**: `dhf/post-market/complaints.jsonl` is a permanent, append-only audit record

### HIPAA §164.312(b) — Audit Controls

The WORM-format JSONL log and git commit history provide the tamper-evident audit trail required by HIPAA. Combined with the Merkle chain (`audit-log/chain.ndjson`), the log is cryptographically bound to the repository history.

---

## Escalation and CAPA

| Severity | Response | Timeline |
|---|---|---|
| Critical | Page on-call; open CAPA immediately | < 1 hour |
| High | Notify compliance team; open CAPA | < 24 hours |
| Medium | Assign investigation; assess CAPA need | < 72 hours |
| Low | Log and monitor; no CAPA unless pattern | Next sprint |

**A Corrective and Preventive Action (CAPA)** is required when:
- A critical or high-severity event occurs
- Three or more similar complaints are received (trend trigger)
- An FDA MedWatch report is filed

Open CAPA issues with the label `capa` and link them to the originating `post-market` issue.

---

## Quarterly Review

A post-market surveillance review is conducted quarterly (January, April, July, October). The review:

1. Counts events by type and severity over the prior quarter
2. Identifies trends (≥3 similar complaints → CAPA)
3. Updates the risk analysis (ISO 14971 §9 feedback loop)
4. Produces a quarterly report archived in `dhf/post-market/quarterly-YYYY-QN.md`

---

## Data Retention

`dhf/post-market/complaints.jsonl` is retained indefinitely as part of the Design History File. Per 21 CFR 820.180, DHF records must be retained for the expected service life of the device, or 2 years from the date of release (whichever is longer). The file is included in the WORM S3 Object Lock backup.

---

## Related Documents

- `dhf/post-market/complaints.jsonl` — WORM audit log
- `.github/ISSUE_TEMPLATE/post-market-event.md` — Reporting template
- `.github/workflows/post-market-tracker.yml` — Automation workflow
- `docs/compliance/dhf-guide.md` — Design History File guide
- `audit-log/chain.ndjson` — Merkle-chain audit log
