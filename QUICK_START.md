# Medical Report Analysis - Quick Start

## What You Have Now

A complete medical report analysis system that:
- ✅ Uploads medical reports (PDF/images) to local storage
- ✅ Extracts text using OCR
- ✅ Uses AI to explain medical terms in simple language
- ✅ Tracks health metrics over time
- ✅ Compares reports to show trends

## Installation (3 Steps)

### 1. Install Dependencies
```bash
npm install pdf-parse tesseract.js openai sharp
```

### 2. Add OpenAI API Key
Edit `.env` file and add:
```
OPENAI_API_KEY=sk-your-key-here
```
Get your key from: https://platform.openai.com/api-keys

### 3. Run Database Migrations
```bash
npx sequelize-cli db:migrate
```

## Test It

### Start Server
```bash
npm start
```

### Upload a Report
```bash
curl -X POST http://localhost:3000/api/medical-reports/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/report.pdf" \
  -F "report_type=blood_test"
```

### Check Report Status
```bash
curl http://localhost:3000/api/medical-reports/REPORT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/medical-reports/upload` | Upload new report |
| GET | `/api/medical-reports` | Get all user reports |
| GET | `/api/medical-reports/:id` | Get single report |
| GET | `/api/medical-reports/:id/compare` | Compare with previous |
| GET | `/api/medical-reports/trends/data` | Get health trends |
| DELETE | `/api/medical-reports/:id` | Delete report |

## File Storage

- **Location**: `uploads/medical-reports/`
- **Access**: `http://localhost:3000/uploads/medical-reports/{filename}`
- **Max Size**: 10MB
- **Formats**: PDF, JPG, PNG, TIFF, BMP

## How It Works

1. **Upload** → File saved locally
2. **OCR** → Text extracted from PDF/image
3. **AI Analysis** → OpenAI explains medical terms
4. **Metrics** → Extracts values (BP, glucose, etc.)
5. **Comparison** → Compares with previous reports
6. **Trends** → Shows changes over time

## Example Response

```json
{
  "statusCode": 200,
  "data": {
    "report": {
      "id": "uuid",
      "report_type": "blood_test",
      "ai_summary": "Your blood test shows normal glucose levels...",
      "metrics": [
        {
          "metric_name": "glucose",
          "metric_value": "95",
          "metric_unit": "mg/dL",
          "status": "normal"
        }
      ]
    }
  }
}
```

## Documentation

- **Full Setup**: `MEDICAL_REPORT_SETUP.md`
- **Local Upload**: `LOCAL_UPLOAD_GUIDE.md`
- **Implementation**: `IMPLEMENTATION_GUIDE.md`

## Swagger Documentation

Access API docs at: `http://localhost:3000/api-docs`

## Need Help?

Check logs: `http://localhost:3000/get-logs`

## Production Checklist

- [ ] Set up proper authentication
- [ ] Add file access control
- [ ] Implement file cleanup on delete
- [ ] Monitor disk space
- [ ] Set up backups
- [ ] Add rate limiting
- [ ] Configure HTTPS
- [ ] Review privacy/HIPAA requirements
