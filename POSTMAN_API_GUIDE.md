# Medical Reports API - Postman Guide

Complete guide for testing all endpoints in Postman.

---

## Base URL
```
http://localhost:3000
```

---

## 1. Get Supported Report Types

**No authentication required**

### Request
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/medical-reports/types`
- **Headers:** None required

### Response
```json
{
  "statusCode": 200,
  "data": {
    "report_types": [
      {
        "code": "cbc",
        "name": "Complete Blood Count (CBC)",
        "description": "Measures different components of blood including red blood cells, white blood cells, hemoglobin, and platelets"
      },
      {
        "code": "sugar",
        "name": "Blood Sugar / Glucose Test",
        "description": "Measures blood glucose levels including fasting sugar, HbA1c, and diabetes indicators"
      },
      {
        "code": "lipid_profile",
        "name": "Lipid Profile / Cholesterol Test",
        "description": "Measures cholesterol levels including LDL, HDL, triglycerides, and cardiovascular risk factors"
      }
    ]
  }
}
```

---

## 2. User Login (Get Token)

### Request
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

### Response
```json
{
  "statusCode": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InV1aWQiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDI3NDI0MDAsImV4cCI6MTcwNTMzNDQwMH0.xxxxx",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

**⚠️ IMPORTANT: Copy the `token` value - you'll need it for all other requests!**

---

## 3. Upload Medical Report

**Authentication required**

### Request
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/medical-reports/upload`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body (form-data):**
  - `file` (File): Select your PDF or image file
  - `report_type` (Text): `cbc` or `sugar` or `lipid_profile`
  - `report_date` (Text, optional): `1702742400000` (timestamp in milliseconds)

### Postman Setup:
1. Select **Body** tab
2. Select **form-data**
3. Add key `file`:
   - Change type to **File** (dropdown on right)
   - Click "Select Files" and choose your report
4. Add key `report_type`:
   - Type: **Text**
   - Value: `cbc` (or `sugar` or `lipid_profile`)
5. Add key `report_date` (optional):
   - Type: **Text**
   - Value: `1702742400000`

### Response
```json
{
  "statusCode": 201,
  "data": {
    "report": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "user-uuid",
      "report_type": "cbc",
      "report_date": 1702742400000,
      "file_url": "/uploads/medical-reports/1702742400000-uuid-report.pdf",
      "file_type": "pdf",
      "status": "processing",
      "createdAt": 1702742400000,
      "updatedAt": 1702742400000
    },
    "message": "Report uploaded successfully. Processing in background."
  }
}
```

---

## 4. Get All User Reports

**Authentication required**

### Request
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/medical-reports`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Query Parameters (optional):**
  - `page`: `1` (default: 1)
  - `limit`: `10` (default: 10)
  - `report_type`: `cbc` or `sugar` or `lipid_profile`

### Postman Setup:
1. Select **Params** tab
2. Add parameters:
   - Key: `page`, Value: `1`
   - Key: `limit`, Value: `10`
   - Key: `report_type`, Value: `cbc`

### Full URL Example:
```
http://localhost:3000/api/medical-reports?page=1&limit=10&report_type=cbc
```

### Response
```json
{
  "statusCode": 200,
  "data": {
    "reports": [
      {
        "id": "report-uuid",
        "user_id": "user-uuid",
        "report_type": "cbc",
        "report_date": 1702742400000,
        "file_url": "/uploads/medical-reports/file.pdf",
        "status": "completed",
        "ai_summary": "Your blood test shows normal values...",
        "ai_explanation": "Detailed explanation...",
        "metrics": [
          {
            "id": "metric-uuid",
            "metric_name": "hemoglobin",
            "metric_value": "14.5",
            "metric_unit": "g/dL",
            "normal_range": "13.5-17.5",
            "status": "normal"
          }
        ]
      }
    ],
    "total": 5,
    "page": 1,
    "totalPages": 1
  }
}
```

---

## 5. Get Single Report Details

**Authentication required**

### Request
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/medical-reports/:reportId`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Path Parameters:**
  - `reportId`: The UUID of the report (from upload response)

### Full URL Example:
```
http://localhost:3000/api/medical-reports/550e8400-e29b-41d4-a716-446655440000
```

### Response
```json
{
  "statusCode": 200,
  "data": {
    "report": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "user-uuid",
      "report_type": "cbc",
      "report_date": 1702742400000,
      "file_url": "/uploads/medical-reports/file.pdf",
      "file_type": "pdf",
      "status": "completed",
      "extracted_text": "Full extracted text...",
      "ai_summary": "Your blood test shows...",
      "ai_explanation": "Detailed explanation...",
      "metrics": [
        {
          "metric_name": "hemoglobin",
          "metric_value": "14.5",
          "metric_unit": "g/dL",
          "normal_range": "13.5-17.5",
          "status": "normal"
        }
      ]
    }
  }
}
```

---

## 6. Compare Report with Previous

**How it works:** Compares current report with the **most recent previous report** of the same type.

**Example:** If you have 3 CBC reports (Jan, Feb, Mar), comparing the March report will compare it with the February report (not January).



**Authentication required**

### Request
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/medical-reports/:reportId/compare`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Path Parameters:**
  - `reportId`: The UUID of the current report

### Full URL Example:
```
http://localhost:3000/api/medical-reports/550e8400-e29b-41d4-a716-446655440000/compare
```

### Response
```json
{
  "statusCode": 200,
  "data": {
    "current_report": {
      "id": "current-uuid",
      "report_date": 1702742400000,
      "ai_summary": "Your blood test shows...",
      "metrics": [...]
    },
    "previous_report": {
      "id": "previous-uuid",
      "report_date": 1694966400000,
      "ai_summary": "Previous results...",
      "metrics": [...]
    },
    "comparison": {
      "overall_trend": "improving",
      "key_changes": [
        "Hemoglobin increased from 13.2 to 14.5 g/dL",
        "All blood counts now within normal range"
      ],
      "concerns": [],
      "recommendations": [
        "Continue current diet and lifestyle",
        "Maintain iron supplementation"
      ],
      "metric_comparisons": [
        {
          "metric_name": "hemoglobin",
          "old_value": "13.2",
          "new_value": "14.5",
          "change": "increased",
          "significance": "positive"
        }
      ]
    }
  }
}
```

---

## 7. Get Health Trends

**Authentication required**

### Request
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/medical-reports/trends/data`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Query Parameters:**
  - `metric_name` (required): `hemoglobin`, `hba1c`, `total_cholesterol`, etc.
  - `months` (optional): `6` (default: 6)

### Postman Setup:
1. Select **Params** tab
2. Add parameters:
   - Key: `metric_name`, Value: `hemoglobin`
   - Key: `months`, Value: `6`

### Full URL Example:
```
http://localhost:3000/api/medical-reports/trends/data?metric_name=hemoglobin&months=6
```

### Response
```json
{
  "statusCode": 200,
  "data": {
    "metric_name": "hemoglobin",
    "data_points": [
      {
        "date": 1694966400000,
        "value": "13.2",
        "unit": "g/dL",
        "status": "low"
      },
      {
        "date": 1697644800000,
        "value": "13.8",
        "unit": "g/dL",
        "status": "normal"
      },
      {
        "date": 1702742400000,
        "value": "14.5",
        "unit": "g/dL",
        "status": "normal"
      }
    ]
  }
}
```

---

## 8. Delete Report

**Authentication required**

### Request
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/medical-reports/:reportId`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Path Parameters:**
  - `reportId`: The UUID of the report to delete

### Full URL Example:
```
http://localhost:3000/api/medical-reports/550e8400-e29b-41d4-a716-446655440000
```

### Response
```json
{
  "statusCode": 200,
  "data": {
    "message": "Report deleted successfully"
  }
}
```

---

## Common Metric Names for Trends

### CBC Metrics:
- `hemoglobin`
- `rbc_count`
- `wbc_count`
- `platelet_count`
- `hematocrit`
- `mcv`
- `mch`
- `mchc`

### Sugar Metrics:
- `fasting_blood_sugar`
- `post_prandial_sugar`
- `random_blood_sugar`
- `hba1c`
- `estimated_avg_glucose`

### Lipid Profile Metrics:
- `total_cholesterol`
- `ldl_cholesterol`
- `hdl_cholesterol`
- `triglycerides`
- `vldl_cholesterol`
- `total_hdl_ratio`
- `ldl_hdl_ratio`

---

## Setting Up Authorization in Postman

### Method 1: Per Request
1. Go to **Headers** tab
2. Add header:
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Method 2: Using Authorization Tab
1. Go to **Authorization** tab
2. Type: Select **Bearer Token**
3. Token: Paste your token (without "Bearer" prefix)

### Method 3: Collection Variable (Recommended)
1. Create a Postman Collection
2. Add all requests to the collection
3. Set collection variable:
   - Variable: `authToken`
   - Value: Your token
4. In each request Authorization:
   - Type: **Bearer Token**
   - Token: `{{authToken}}`

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Authorization header missing"
}
```
**Solution:** Add Authorization header with Bearer token

### 403 Forbidden
```json
{
  "message": "Invalid or expired token"
}
```
**Solution:** Login again to get a fresh token

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Report type must be one of: cbc, sugar, lipid_profile"
}
```
**Solution:** Use correct report_type value

### 404 Not Found
```json
{
  "message": "Report not found"
}
```
**Solution:** Check if reportId is correct and belongs to your user

---

## Testing Workflow

### Complete Test Flow:
1. **Get Report Types** → See available types
2. **Login** → Get authentication token
3. **Upload Report** → Upload CBC report
4. **Get All Reports** → Verify upload
5. **Get Single Report** → Check processing status
6. **Upload Another Report** → Upload older CBC report
7. **Compare Reports** → See trends
8. **Get Health Trends** → Track hemoglobin over time
9. **Delete Report** → Clean up test data

---

## Sample Files for Testing

Use files from `sample-reports/` folder:
- `cbc-report-sample.txt`
- `cbc-report-sample-2.txt`
- `sugar-report-sample.txt`
- `sugar-report-sample-2.txt`
- `lipid-profile-sample.txt`
- `lipid-profile-sample-2.txt`

---

## Postman Collection JSON

You can import this collection into Postman:

```json
{
  "info": {
    "name": "Medical Reports API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "authToken",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Get Report Types",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/medical-reports/types"
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"password\"\n}"
        },
        "url": "{{baseUrl}}/api/auth/login"
      }
    },
    {
      "name": "Upload Report",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": ""
            },
            {
              "key": "report_type",
              "value": "cbc",
              "type": "text"
            }
          ]
        },
        "url": "{{baseUrl}}/api/medical-reports/upload"
      }
    },
    {
      "name": "Get All Reports",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/medical-reports?page=1&limit=10",
          "query": [
            {
              "key": "page",
              "value": "1"
            },
            {
              "key": "limit",
              "value": "10"
            }
          ]
        }
      }
    },
    {
      "name": "Get Single Report",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": "{{baseUrl}}/api/medical-reports/:reportId"
      }
    },
    {
      "name": "Compare Reports",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": "{{baseUrl}}/api/medical-reports/:reportId/compare"
      }
    },
    {
      "name": "Get Health Trends",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/medical-reports/trends/data?metric_name=hemoglobin&months=6",
          "query": [
            {
              "key": "metric_name",
              "value": "hemoglobin"
            },
            {
              "key": "months",
              "value": "6"
            }
          ]
        }
      }
    },
    {
      "name": "Delete Report",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": "{{baseUrl}}/api/medical-reports/:reportId"
      }
    }
  ]
}
```

Save this as `Medical_Reports_API.postman_collection.json` and import into Postman!
