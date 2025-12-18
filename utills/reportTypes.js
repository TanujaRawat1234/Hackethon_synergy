/**
 * Supported Medical Report Types
 */

const REPORT_TYPES = {
  CBC: 'cbc',
  SUGAR: 'sugar',
  LIPID_PROFILE: 'lipid_profile',
};

const REPORT_TYPE_NAMES = {
  cbc: 'Complete Blood Count (CBC)',
  sugar: 'Blood Sugar / Glucose Test',
  lipid_profile: 'Lipid Profile / Cholesterol Test',
};

const REPORT_TYPE_DESCRIPTIONS = {
  cbc: 'Measures different components of blood including red blood cells, white blood cells, hemoglobin, and platelets',
  sugar: 'Measures blood glucose levels including fasting sugar, HbA1c, and diabetes indicators',
  lipid_profile: 'Measures cholesterol levels including LDL, HDL, triglycerides, and cardiovascular risk factors',
};

const REPORT_TYPE_METRICS = {
  cbc: [
    'hemoglobin',
    'rbc_count',
    'wbc_count',
    'platelet_count',
    'hematocrit',
    'mcv',
    'mch',
    'mchc',
    'neutrophils',
    'lymphocytes',
    'monocytes',
    'eosinophils',
    'basophils',
  ],
  sugar: [
    'fasting_blood_sugar',
    'post_prandial_sugar',
    'random_blood_sugar',
    'hba1c',
    'estimated_avg_glucose',
  ],
  lipid_profile: [
    'total_cholesterol',
    'ldl_cholesterol',
    'hdl_cholesterol',
    'triglycerides',
    'vldl_cholesterol',
    'total_hdl_ratio',
    'ldl_hdl_ratio',
    'non_hdl_cholesterol',
  ],
};

/**
 * Validate if report type is supported
 */
function isValidReportType(reportType) {
  return Object.values(REPORT_TYPES).includes(reportType);
}

/**
 * Get report type display name
 */
function getReportTypeName(reportType) {
  return REPORT_TYPE_NAMES[reportType] || reportType;
}

/**
 * Get report type description
 */
function getReportTypeDescription(reportType) {
  return REPORT_TYPE_DESCRIPTIONS[reportType] || '';
}

/**
 * Get expected metrics for report type
 */
function getReportTypeMetrics(reportType) {
  return REPORT_TYPE_METRICS[reportType] || [];
}

module.exports = {
  REPORT_TYPES,
  REPORT_TYPE_NAMES,
  REPORT_TYPE_DESCRIPTIONS,
  REPORT_TYPE_METRICS,
  isValidReportType,
  getReportTypeName,
  getReportTypeDescription,
  getReportTypeMetrics,
};
