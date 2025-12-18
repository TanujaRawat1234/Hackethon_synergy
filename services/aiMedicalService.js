const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utills/logger');

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || process.env.OPENAI_API_KEY);

class AIMedicalService {
  /**
   * Analyze medical report text and extract key information
   */
  async analyzeMedicalReport(extractedText, reportType) {
    try {
      const reportTypeInstructions = {
        cbc: `This is a Complete Blood Count (CBC) report. Extract these metrics:
- hemoglobin (g/dL)
- rbc_count (million/µL)
- wbc_count (cells/µL)
- platelet_count (cells/µL)
- hematocrit (%)
- mcv (fL)
- mch (pg)
- mchc (g/dL)
- neutrophils (%)
- lymphocytes (%)`,
        
        sugar: `This is a Blood Sugar/Glucose report. Extract these metrics:
- fasting_blood_sugar (mg/dL)
- post_prandial_sugar (mg/dL)
- random_blood_sugar (mg/dL)
- hba1c (%)
- estimated_avg_glucose (mg/dL)`,
        
        lipid_profile: `This is a Lipid Profile report. Extract these metrics:
- total_cholesterol (mg/dL)
- ldl_cholesterol (mg/dL)
- hdl_cholesterol (mg/dL)
- triglycerides (mg/dL)
- vldl_cholesterol (mg/dL)
- total_hdl_ratio
- ldl_hdl_ratio
- non_hdl_cholesterol (mg/dL)`
      };

      const specificInstructions = reportTypeInstructions[reportType] || 'Extract all available health metrics.';

      const prompt = `You are a medical expert. Analyze this ${reportType.toUpperCase()} medical report and provide:

1. A simple, easy-to-understand summary (2-3 sentences) that a non-medical person can understand
2. Explanation of key medical terms and what they mean for the patient's health
3. Extract specific metrics in JSON format

${specificInstructions}

Medical Report Text:
${extractedText}

Respond in JSON format:
{
  "summary": "simple language summary explaining what the results mean",
  "explanation": "detailed explanation of medical terms in simple language",
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

IMPORTANT: 
- Use underscores in metric_name (e.g., "fasting_blood_sugar" not "Fasting Blood Sugar")
- Status must be one of: "normal", "low", "high", "critical"
- Provide clear, simple explanations that avoid medical jargon`;

      // Use Gemini model (updated model name)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const fullPrompt = `You are a helpful medical assistant that explains medical reports in simple, easy-to-understand language for patients.

${prompt}`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON from AI response');
      }
      
      const parsedResult = JSON.parse(jsonMatch[0]);
      return parsedResult;
    } catch (error) {
      logger.error('AI Medical Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Compare two medical reports and highlight trends
   */
  async compareReports(oldReport, newReport) {
    try {
      const prompt = `Compare these two medical reports and identify trends, improvements, or concerns.

OLD REPORT (${new Date(oldReport.report_date).toLocaleDateString()}):
${oldReport.ai_summary}
Metrics: ${JSON.stringify(oldReport.metrics)}

NEW REPORT (${new Date(newReport.report_date).toLocaleDateString()}):
${newReport.ai_summary}
Metrics: ${JSON.stringify(newReport.metrics)}

Provide a comparison in JSON format:
{
  "overall_trend": "improving/declining/stable",
  "key_changes": ["list of significant changes"],
  "concerns": ["list of any concerns"],
  "recommendations": ["simple health recommendations"],
  "metric_comparisons": [
    {
      "metric_name": "glucose",
      "old_value": "110",
      "new_value": "95",
      "change": "decreased",
      "significance": "positive"
    }
  ]
}`;

      // Use Gemini model (updated model name)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const fullPrompt = `You are a medical assistant helping users understand changes in their health over time.

${prompt}`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON from AI response');
      }
      
      const parsedResult = JSON.parse(jsonMatch[0]);
      return parsedResult;
    } catch (error) {
      logger.error('AI Comparison Error:', error);
      throw error;
    }
  }
}

module.exports = new AIMedicalService();
