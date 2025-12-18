# Detailed Metric Comparison Guide

## Overview

The comparison API now provides detailed metric-by-metric analysis with:
- Previous vs Current values
- Change amount and percentage
- Trend (improved/worsened/stable)
- Interpretation
- Time difference between reports

## API Response Structure

```json
{
  "current_report": {...},
  "previous_report": {...},
  "comparison": {
    "summary": "Overall improvement in blood parameters. 2 metric(s) improved, 10 remained stable, and 1 worsened.",
    "metrics": [
      {
        "name": "Hemoglobin",
        "previous_value": "13.2 g/dL",
        "current_value": "14.5 g/dL",
        "change": "+1.3",
        "change_percentage": "+9.8%",
        "trend": "improved",
        "interpretation": "Improved from low to normal range. Within normal range."
      },
      {
        "name": "White Blood Cells",
        "previous_value": "8,200 cells/µL",
        "current_value": "7,500 cells/µL",
        "change": "-700.0",
        "change_percentage": "-8.5%",
        "trend": "stable",
        "interpretation": "Minimal change, remains in healthy range. Within normal range."
      }
    ],
    "time_difference": "3 months"
  }
}
```

## Metric Comparison Fields

### 1. name
Display name of the metric (e.g., "Hemoglobin", "White Blood Cells")

### 2. previous_value
Value from the previous report with unit (e.g., "13.2 g/dL")

### 3. current_value
Value from the current report with unit (e.g., "14.5 g/dL")

### 4. change
Absolute change between reports
- Positive: `+1.3`
- Negative: `-0.5`
- Zero: `0.0`

### 5. change_percentage
Percentage change
- Positive: `+9.8%`
- Negative: `-3.8%`
- Calculated as: `((current - previous) / previous) * 100`

### 6. trend
Overall trend assessment:
- **improved** - Moved from abnormal to normal, or positive change
- **worsened** - Moved from normal to abnormal, or negative change
- **stable** - Change less than 5%, or within acceptable range
- **increased** - Went up but still acceptable
- **decreased** - Went down but still acceptable

### 7. interpretation
Human-readable explanation of the change and current status

## Trend Logic

### Improved:
- Low → Normal
- High → Normal
- Any positive change that brings value closer to normal

### Worsened:
- Normal → Low
- Normal → High
- Any change that moves value away from normal

### Stable:
- Change percentage < 5%
- Remains in same status (normal/low/high)

## Time Difference

Calculated automatically between report dates:
- `Same day` - Uploaded same day
- `1 day` - 1 day apart
- `X days` - Less than 30 days
- `1 month` - 30-59 days
- `X months` - 60+ days

## Example Use Cases

### Use Case 1: Track Anemia Treatment

**Previous Report (3 months ago):**
- Hemoglobin: 13.2 g/dL (LOW)

**Current Report:**
- Hemoglobin: 14.5 g/dL (NORMAL)

**Comparison Result:**
```json
{
  "name": "Hemoglobin",
  "previous_value": "13.2 g/dL",
  "current_value": "14.5 g/dL",
  "change": "+1.3",
  "change_percentage": "+9.8%",
  "trend": "improved",
  "interpretation": "Improved from low to normal range. Within normal range."
}
```

### Use Case 2: Monitor Stable Condition

**Previous Report:**
- WBC: 7,500 cells/µL (NORMAL)

**Current Report:**
- WBC: 7,200 cells/µL (NORMAL)

**Comparison Result:**
```json
{
  "name": "White Blood Cells",
  "previous_value": "7,500 cells/µL",
  "current_value": "7,200 cells/µL",
  "change": "-300.0",
  "change_percentage": "-4.0%",
  "trend": "stable",
  "interpretation": "Minimal change, remains in healthy range. Within normal range."
}
```

### Use Case 3: Detect Worsening

**Previous Report:**
- Platelets: 250,000 cells/µL (NORMAL)

**Current Report:**
- Platelets: 140,000 cells/µL (LOW)

**Comparison Result:**
```json
{
  "name": "Platelets",
  "previous_value": "250,000 cells/µL",
  "current_value": "140,000 cells/µL",
  "change": "-110000.0",
  "change_percentage": "-44.0%",
  "trend": "worsened",
  "interpretation": "Decreased below normal range. Below normal range - may need attention."
}
```

## Frontend Display Ideas

### 1. Comparison Table
```
Metric          Previous    Current     Change      Trend
─────────────────────────────────────────────────────────
Hemoglobin      13.2 g/dL   14.5 g/dL   +1.3 (+9.8%)  ↑ Improved
WBC             8,200       7,500       -700 (-8.5%)  → Stable
Platelets       250,000     240,000     -10k (-4.0%)  → Stable
```

### 2. Trend Indicators
```jsx
{trend === 'improved' && <Badge color="green">↑ Improved</Badge>}
{trend === 'worsened' && <Badge color="red">↓ Worsened</Badge>}
{trend === 'stable' && <Badge color="blue">→ Stable</Badge>}
```

### 3. Change Visualization
```jsx
<Progress 
  value={Math.abs(changePercentage)} 
  colorScheme={trend === 'improved' ? 'green' : trend === 'worsened' ? 'red' : 'blue'}
/>
```

### 4. Line Chart
```jsx
<LineChart data={[
  { date: 'Previous', value: previousValue },
  { date: 'Current', value: currentValue }
]}>
  <Line dataKey="value" stroke={trendColor} />
</LineChart>
```

## API Usage

```bash
GET /api/medical-reports/:reportId/compare
Authorization: Bearer YOUR_TOKEN
```

**Response includes:**
- Full current report with all metrics
- Full previous report with all metrics
- Detailed comparison object with:
  - Overall summary
  - Metric-by-metric comparison
  - Time difference

## Summary Generation

The API automatically generates an overall summary:

**Example summaries:**
- "Overall improvement in blood parameters. 3 metric(s) improved, 10 remained stable."
- "Some parameters need attention. 2 metric(s) worsened, 11 remained stable. Consult your doctor."
- "Blood parameters are mostly stable. 12 metric(s) remained stable, 1 improved."

## Benefits for Users

1. **Visual Progress** - See exact changes in numbers
2. **Trend Tracking** - Know if improving or worsening
3. **Time Context** - Understand how long between tests
4. **Clear Interpretation** - No medical jargon
5. **Actionable** - Know what needs attention

## Benefits for Frontend

1. **Ready for Charts** - All data formatted for graphs
2. **Color Coding** - Trend field for easy styling
3. **Percentage Changes** - For progress bars
4. **Interpretations** - For tooltips/explanations
5. **Time Context** - For timeline displays

---

**Perfect for hackathon demo!** 🎉
Show before/after comparison with visual charts!
