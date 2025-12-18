# Medical Report Analysis System

AI-powered medical report analysis that helps users understand their health reports in simple language.

## Features

- **Upload Medical Reports** - PDF, images, or text files
- **AI Analysis** - Extracts all metrics and explains in simple language
- **Report Types Supported:**
  - CBC (Complete Blood Count) - 13 metrics
  - Blood Sugar/Glucose Test
  - Lipid Profile/Cholesterol Test
- **Compare Reports** - Track health changes over time
- **Health Dashboard** - Overview of all reports and trends

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Create database
mysql -u root -p
CREATE DATABASE healthcare;

# Run migrations
npx sequelize-cli db:migrate
```

### 3. Configure Environment
Create `.env` file:
```
PORT=3000
JWT_SECRET_KEY=your-secret-key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=healthcare
GOOGLE_AI_API_KEY=your-google-ai-key
```

### 4. Start Server
```bash
npm start
```

Server runs on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Medical Reports
- `POST /api/medical-reports/upload` - Upload report
- `GET /api/medical-reports` - Get all user reports
- `GET /api/medical-reports/:id` - Get single report
- `GET /api/medical-reports/:id/compare` - Compare with previous
- `DELETE /api/medical-reports/:id` - Delete report

### Dashboard
- `GET /api/dashboard/overview` - Health dashboard
- `GET /api/dashboard/recommendations` - Get recommendations
- `GET /api/dashboard/statistics` - Health statistics

## Usage Example

### 1. Register/Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

### 2. Upload Report
```bash
POST http://localhost:3000/api/medical-reports/upload
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Form Data:
- file: [Your PDF/Image]
- report_type: cbc
```

### 3. Get Results
```bash
GET http://localhost:3000/api/medical-reports
Authorization: Bearer YOUR_TOKEN
```

## Response Example

```json
{
  "report": {
    "id": "uuid",
    "report_type": "cbc",
    "status": "completed",
    "ai_summary": "📋 Your Complete Blood Count (CBC) Analysis:\n\n⚠️ LOW VALUES: 3 metric(s) below normal range:\n   • Hemoglobin: 13.2 g/dL (Normal: 13.5-17.5)\n   • MCH: 26 pg (Normal: 27-33)\n   • MCHC: 31 g/dL (Normal: 32-36)\n   → Low hemoglobin indicates anemia - may cause fatigue and weakness\n\n✅ NORMAL: 10 metric(s) within healthy range\n\n💡 RECOMMENDATION: Monitor these values and discuss with your doctor during your next visit.",
    "metrics": [
      {
        "metric_name": "hemoglobin",
        "metric_value": "13.2",
        "metric_unit": "g/dL",
        "normal_range": "13.5-17.5",
        "status": "low"
      }
      // ... 12 more metrics
    ]
  }
}
```

## Documentation

- **POSTMAN_API_GUIDE.md** - Complete API documentation with examples
- **QUICK_START.md** - Quick setup guide
- **HACKATHON_IMPROVEMENTS.md** - Feature list and improvements
- **FRONTEND_FEATURES_GUIDE.md** - UI/UX suggestions

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL with Sequelize ORM
- **AI:** Google Gemini AI (with mock fallback)
- **File Processing:** pdf-parse, Tesseract.js
- **Authentication:** JWT

## Project Structure

```
├── controller/          # API controllers
├── models/             # Database models
├── routes/             # API routes
├── services/           # Business logic
├── middleware/         # Auth & validation
├── migrations/         # Database migrations
├── uploads/            # Uploaded files
├── sample-reports/     # Sample test reports
└── app.js             # Main application
```

## Sample Reports

Test reports available in `sample-reports/` folder:
- `cbc-report-sample.txt` - Normal CBC
- `cbc-report-sample-2.txt` - Abnormal CBC (anemia)
- `sugar-report-sample.txt` - Normal glucose
- `lipid-profile-sample.txt` - Normal cholesterol

## License

MIT
