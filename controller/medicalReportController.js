const medicalReportService = require('../services/medicalReportService');
const ApiResponse = require('../utills/response');
const logger = require('../utills/logger');
const { REPORT_TYPES, REPORT_TYPE_NAMES, REPORT_TYPE_DESCRIPTIONS } = require('../utills/reportTypes');
const recommendationService = require('../services/recommendationService');

class MedicalReportController {
  /**
   * Upload medical report
   */
  async uploadReport(req, res, next) {
    try {
      console.log('user',req.user)
          console.log('processReport')

      const userId = req.user.id; // From auth middleware
      const { report_type, report_date } = req.body;

      if (!req.file) {
        return ApiResponse.error(res, 'No file uploaded', 400);
      }

      // For local storage, construct the file URL
      const fileUrl = req.file.location || `/uploads/medical-reports/${req.file.filename}`;
      const filePath = req.file.path; // Absolute path for processing

      const reportData = {
        file_url: fileUrl,
        file_path: filePath, // Store absolute path for OCR processing
        file_type: req.file.mimetype.split('/')[1],
        report_type,
        report_date: report_date ? parseInt(report_date) : Date.now(),
      };

      const report = await medicalReportService.uploadReport(userId, reportData);

      return ApiResponse.SuccessResponseWithData(
        res,
        {
          report,
          message: 'Report uploaded successfully. Processing in background.',
        },
        201
      );
    } catch (error) {
      logger.error('Upload report controller error:', error);
      next(error);
    }
  }

  /**
   * Get all user reports
   */
  async getUserReports(req, res, next) {
    try {
      const userId = req.user.id;
      const { page, limit, report_type } = req.query;

      const result = await medicalReportService.getUserReports(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        report_type,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      logger.error('Get user reports controller error:', error);
      next(error);
    }
  }

  /**
   * Get single report details
   */
  async getReportById(req, res, next) {
    try {
      const userId = req.user.id;
      const { reportId } = req.params;

      const report = await medicalReportService.getReportById(reportId, userId);

      // Generate smart recommendations
      const recommendations = recommendationService.generateRecommendations(
        report.metrics || [],
        report.report_type
      );

      const followUpSchedule = recommendationService.getFollowUpSchedule(
        report.metrics || [],
        report.report_type
      );

      return ApiResponse.SuccessResponseWithData(res, { 
        report,
        recommendations,
        follow_up: followUpSchedule
      });
    } catch (error) {
      logger.error('Get report by ID controller error:', error);
      
      // Handle specific errors
      if (error.message.includes('Report not found')) {
        return ApiResponse.error(res, error.message, error.statusCode || 404);
      }
      
      next(error);
    }
  }

  /**
   * Compare report with previous
   */
  async compareWithPrevious(req, res, next) {
    try {
      const userId = req.user.id;
      const { reportId } = req.params;

      const comparison = await medicalReportService.compareWithPrevious(
        reportId,
        userId
      );

      return ApiResponse.SuccessResponseWithData(res, comparison);
    } catch (error) {
      logger.error('Compare reports controller error:', error);
      
      // Handle specific errors
      if (error.message.includes('Report not found')) {
        return ApiResponse.error(res, error.message, error.statusCode || 404);
      }
      
      next(error);
    }
  }

  /**
   * Get health trends
   */
  async getHealthTrends(req, res, next) {
    try {
      const userId = req.user.id;
      const { metric_name, months } = req.query;

      if (!metric_name) {
        return ApiResponse.InternalServerError(res, 'metric_name is required', 400);
      }

      const trends = await medicalReportService.getHealthTrends(
        userId,
        metric_name,
        parseInt(months) || 6
      );

      return ApiResponse.SuccessResponseWithData(res, trends);
    } catch (error) {
      logger.error('Get health trends controller error:', error);
      next(error);
    }
  }

  /**
   * Delete report
   */
  async deleteReport(req, res, next) {
    try {
      const userId = req.user.id;
      const { reportId } = req.params;

      const result = await medicalReportService.deleteReport(reportId, userId);

      return ApiResponse.success(res, result);
    } catch (error) {
      logger.error('Delete report controller error:', error);
      
      // Handle specific errors
      if (error.message.includes('Report not found')) {
        return ApiResponse.error(res, error.message, error.statusCode || 404);
      }
      
      next(error);
    }
  }

  /**
   * Get supported report types
   */
  async getReportTypes(req, res, next) {
    try {
      const reportTypes = Object.keys(REPORT_TYPES).map((key) => ({
        code: REPORT_TYPES[key],
        name: REPORT_TYPE_NAMES[REPORT_TYPES[key]],
        description: REPORT_TYPE_DESCRIPTIONS[REPORT_TYPES[key]],
      }));

      return ApiResponse.success(res, { report_types: reportTypes });
    } catch (error) {
      logger.error('Get report types controller error:', error);
      next(error);
    }
  }
}

module.exports = new MedicalReportController();
