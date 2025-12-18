const { body, query, param } = require('express-validator');

const uploadReportValidator = [
  body('report_type')
    .notEmpty()
    .withMessage('Report type is required')
    .isIn(['cbc', 'sugar', 'lipid_profile'])
    .withMessage('Report type must be one of: cbc, sugar, lipid_profile'),
  body('report_date')
    .optional()
    .isNumeric()
    .withMessage('Report date must be a timestamp'),
];

const getReportsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('report_type')
    .optional()
    .isString()
    .withMessage('Report type must be a string'),
];

const reportIdValidator = [
  param('reportId')
    .isUUID()
    .withMessage('Invalid report ID'),
];

const healthTrendsValidator = [
  query('metric_name')
    .notEmpty()
    .withMessage('Metric name is required')
    .isString()
    .withMessage('Metric name must be a string'),
  query('months')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Months must be between 1 and 24'),
];

module.exports = {
  uploadReportValidator,
  getReportsValidator,
  reportIdValidator,
  healthTrendsValidator,
};
