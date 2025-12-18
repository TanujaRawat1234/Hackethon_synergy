# Report Comparison Logic

## Simple Rule

**Always compares with the LATEST PREVIOUS report of the same type.**

### Example:

You have 3 CBC reports:
```
Report A: January 1, 2025
Report B: February 1, 2025  
Report C: March 1, 2025 (current)
```

### What Happens:

**Compare Report C (March):**
```
Current:  Report C (March 1)
Previous: Report B (February 1) ← Latest before March
Result:   Shows changes from Feb to March
```

**Compare Report B (February):**
```
Current:  Report B (February 1)
Previous: Report A (January 1) ← Latest before February
Result:   Shows changes from Jan to February
```

**Compare Report A (January):**
```
Current:  Report A (January 1)
Previous: None (first report)
Result:   "No previous report found"
```

## API Usage

```bash
GET /api/medical-reports/:reportId/compare
Authorization: Bearer YOUR_TOKEN
```

### Response:

```json
{
  "current_report": {
    "id": "report-c-id",
    "report_date": 1709251200000,
    "metrics": [...]
  },
  "previous_report": {
    "id": "report-b-id",
    "report_date": 1706745600000,
    "metrics": [...]
  },
  "comparison": {
    "overall_trend": "improving",
    "key_changes": [
      "Hemoglobin increased from 13.2 to 14.5 g/dL"
    ]
  }
}
```

## Key Points

1. **Same Report Type** - Only compares CBC with CBC, Sugar with Sugar, etc.
2. **Most Recent** - Always compares with the immediately previous report
3. **By Date** - Uses report_date to determine order
4. **Excludes Current** - Never compares report with itself

## Multiple Reports Example

```
User has:
- CBC Report: Jan 1
- CBC Report: Feb 1
- CBC Report: Mar 1
- Sugar Report: Jan 15
- Sugar Report: Feb 15

Compare CBC Mar 1:
→ Compares with CBC Feb 1 (not Jan 1, not Sugar reports)

Compare Sugar Feb 15:
→ Compares with Sugar Jan 15 (not CBC reports)
```

## No Previous Report

If no previous report exists:
```json
{
  "message": "No previous report found for comparison",
  "current_report": {...}
}
```
