# Sample Medical Reports

This folder contains sample medical reports for testing the medical report analysis system.

## Report Types

### 1. CBC (Complete Blood Count)
Tests blood cell counts and health indicators.

**Key Metrics:**
- Hemoglobin (g/dL)
- RBC Count (million/µL)
- WBC Count (cells/µL)
- Platelet Count (cells/µL)
- Hematocrit (%)
- MCV, MCH, MCHC

**Files:**
- `cbc-report-sample.txt` - Normal results (December 2025)
- `cbc-report-sample-2.txt` - Mild anemia (September 2025)

**Comparison Shows:** Improvement in hemoglobin levels after iron supplementation

---

### 2. Blood Sugar Tests
Measures glucose levels and diabetes risk.

**Key Metrics:**
- Fasting Blood Sugar (mg/dL)
- Post Prandial Blood Sugar (mg/dL)
- HbA1c (%)
- Random Blood Sugar (mg/dL)

**Files:**
- `sugar-report-sample.txt` - Normal glucose control (December 2025)
- `sugar-report-sample-2.txt` - Prediabetes (August 2025)

**Comparison Shows:** Successful reversal of prediabetes through lifestyle changes

---

### 3. Lipid Profile
Measures cholesterol and cardiovascular risk.

**Key Metrics:**
- Total Cholesterol (mg/dL)
- LDL Cholesterol (mg/dL)
- HDL Cholesterol (mg/dL)
- Triglycerides (mg/dL)
- Cholesterol Ratios

**Files:**
- `lipid-profile-sample.txt` - Improved levels (December 2025)
- `lipid-profile-sample-2.txt` - High risk (July 2025)

**Comparison Shows:** Significant improvement in cholesterol levels with treatment

---

## How to Use These Samples

### For Testing Upload API:

1. **Convert to PDF** (if needed):
   You can use these text files directly or convert them to PDF for more realistic testing.

2. **Upload via API:**
   ```bash
   curl -X POST http://localhost:3000/api/medical-reports/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@sample-reports/cbc-report-sample.txt" \
     -F "report_type=cbc"
   ```

3. **Upload Second Report:**
   ```bash
   curl -X POST http://localhost:3000/api/medical-reports/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@sample-reports/cbc-report-sample-2.txt" \
     -F "report_type=cbc"
   ```

4. **Compare Reports:**
   ```bash
   curl http://localhost:3000/api/medical-reports/{REPORT_ID}/compare \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## Expected AI Analysis Examples

### CBC Report (Normal):
**AI Summary:**
"Your blood test shows all values within normal range. Your hemoglobin is 14.5 g/dL which is healthy. All blood cell counts are normal, indicating good overall blood health."

**Key Metrics Extracted:**
- hemoglobin: 14.5 g/dL (normal)
- wbc: 7,500 cells/µL (normal)
- platelets: 250,000 cells/µL (normal)

### Sugar Report (Improved):
**AI Summary:**
"Your blood sugar levels are now normal. Your HbA1c of 5.4% shows excellent glucose control over the past 3 months. You've successfully reversed prediabetes!"

**Comparison with Previous:**
- HbA1c: 6.1% → 5.4% (IMPROVED ✓)
- Fasting glucose: 112 → 95 mg/dL (IMPROVED ✓)
- Status: Prediabetes → Normal (EXCELLENT PROGRESS)

### Lipid Profile (Improved):
**AI Summary:**
"Your cholesterol levels have improved significantly. Total cholesterol dropped from 245 to 185 mg/dL. LDL decreased from 165 to 110 mg/dL. Great progress!"

**Comparison with Previous:**
- Total Cholesterol: 245 → 185 mg/dL (DOWN 60 points ✓)
- LDL: 165 → 110 mg/dL (DOWN 55 points ✓)
- HDL: 42 → 55 mg/dL (UP 13 points ✓)
- Triglycerides: 195 → 120 mg/dL (DOWN 75 points ✓)

---

## Report Type Codes

Use these codes when uploading:

| Code | Description |
|------|-------------|
| `cbc` | Complete Blood Count |
| `sugar` | Blood Sugar / Glucose Tests |
| `lipid_profile` | Lipid Profile / Cholesterol |

---

## Creating Your Own Test Reports

You can create additional test reports following this format:

1. Include patient information
2. List all test results with values
3. Include normal ranges
4. Add status indicators (NORMAL, HIGH, LOW)
5. Include interpretation/recommendations

The AI will extract:
- Metric names
- Metric values
- Units
- Normal ranges
- Status (normal/high/low/critical)

---

## Notes

- These are **sample reports** for testing only
- Values are realistic but fictional
- Use for development and testing purposes
- Do not use for actual medical decisions
