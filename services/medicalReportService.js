const { MedicalReport, ReportMetric, User } = require('../models');
const ocrService = require('./ocrService');
// Temporarily use mock AI service until Google AI API is fixed
const aiMedicalService = require('./aiMedicalService.mock');
// const aiMedicalService = require('./aiMedicalService');
const logger = require('../utills/logger');
const { Op } = require('sequelize');

class MedicalReportService {
  /**
   * Upload and process medical report
   */
  async uploadReport(userId, reportData) {
    console.log('processReport')
    try {
      const { file_url, file_path, file_type, report_type, report_date } = reportData;

      // Create initial report record
      const report = await MedicalReport.create({
        user_id: userId,
        report_type,
        report_date: report_date || Date.now(),
        file_url,
        file_type,
        status: 'processing',
      });

      // Process in background (you can use a queue like Bull for production)
      // Use file_path for local files, file_url for S3
      const processPath = file_path || file_url;
      console.log('processReport')
      await this.processReport(report.id, processPath, file_type, report_type).catch((error) => {
        logger.error('Background processing error:', error);
      });

      return report;
    } catch (error) {
      logger.error('Upload report error:', error);
      throw error;
    }
  }

  /**
   * Process report: extract text, analyze with AI, save metrics
   */
  async processReport(reportId, filePath, fileType, reportType) {
    try {
      console.log('=== Starting processReport ===');
      console.log('Report ID:', reportId);
      console.log('File Path:', filePath);
      console.log('File Type:', fileType);
      console.log('Report Type:', reportType);

      // Step 1: Extract text from file (local path)
      console.log('Step 1: Extracting text from file...');
      const extractedText = await ocrService.extractFromLocalFile(filePath, fileType);
      console.log('Extracted text length:', extractedText?.length || 0);
      console.log('Extracted text preview:', extractedText?.substring(0, 200));

      // Step 2: Analyze with AI (pass report type for specific analysis)
      console.log('Step 2: Analyzing with AI...');
      const aiAnalysis = await aiMedicalService.analyzeMedicalReport(extractedText, reportType);
      console.log('AI Analysis result:', JSON.stringify(aiAnalysis, null, 2));

      // Step 3: Update report with AI results
      console.log('Step 3: Updating report in database...');
      await MedicalReport.update(
        {
          extracted_text: extractedText,
          ai_summary: aiAnalysis.summary,
          ai_explanation: aiAnalysis.explanation,
          status: 'completed',
        },
        { where: { id: reportId } }
      );
      console.log('Report updated successfully');

      // Step 4: Save metrics
      if (aiAnalysis.metrics && aiAnalysis.metrics.length > 0) {
        console.log('Step 4: Saving metrics...', aiAnalysis.metrics.length, 'metrics');
        const metricsData = aiAnalysis.metrics.map((metric) => ({
          report_id: reportId,
          metric_name: metric.metric_name,
          metric_value: metric.metric_value,
          metric_unit: metric.metric_unit,
          normal_range: metric.normal_range,
          status: metric.status,
        }));

        await ReportMetric.bulkCreate(metricsData);
        console.log('Metrics saved successfully');
      } else {
        console.log('No metrics to save');
      }

      logger.info(`Report ${reportId} processed successfully`);
      console.log('=== processReport completed ===');
    } catch (error) {
      console.error('=== processReport ERROR ===');
      console.error('Error details:', error);
      logger.error(`Failed to process report ${reportId}:`, error);
      await MedicalReport.update(
        { status: 'failed' },
        { where: { id: reportId } }
      );
      throw error;
    }
  }

  /**
   * Get all reports for a user
   */
  async getUserReports(userId, options = {}) {
    try {
      const { page = 1, limit = 10, report_type } = options;
      const offset = (page - 1) * limit;

      const where = { user_id: userId };
      if (report_type) {
        where.report_type = report_type;
      }

      const reports = await MedicalReport.findAndCountAll({
        where,
        include: [
          {
            model: ReportMetric,
            as: 'metrics',
          },
        ],
        order: [['report_date', 'DESC']],
        limit,
        offset,
      });

      return {
        reports: reports.rows,
        total: reports.count,
        page,
        totalPages: Math.ceil(reports.count / limit),
      };
    } catch (error) {
      logger.error('Get user reports error:', error);
      throw error;
    }
  }

  /**
   * Get single report details
   */
  async getReportById(reportId, userId) {
    try {
      const report = await MedicalReport.findOne({
        where: { id: reportId, user_id: userId },
        include: [
          {
            model: ReportMetric,
            as: 'metrics',
          },
        ],
      });

      if (!report) {
        const error = new Error('Report not found or does not belong to this user');
        error.statusCode = 404;
        throw error;
      }

      return report;
    } catch (error) {
      logger.error('Get report by ID error:', error);
      throw error;
    }
  }

  /**
   * Compare current report with previous reports
   */
  async compareWithPrevious(reportId, userId) {
    try {
      const currentReport = await this.getReportById(reportId, userId);

      console.log('=== COMPARISON DEBUG ===');
      console.log('Current Report ID:', reportId);
      console.log('Current Report createdAt:', currentReport.createdAt);
      console.log('Looking for reports with createdAt <', currentReport.createdAt);

      // Find the most recent previous report of same type
      // Must be uploaded BEFORE the current report (createdAt < current.createdAt)
      const previousReport = await MedicalReport.findOne({
        where: {
          user_id: userId,
          report_type: currentReport.report_type,
          createdAt: { [Op.lt]: currentReport.createdAt }, // Uploaded before current
          status: 'completed',
          id: { [Op.ne]: reportId } // Exclude current report
        },
        include: [
          {
            model: ReportMetric,
            as: 'metrics',
          },
        ],
        order: [['createdAt', 'DESC']],
        logging: console.log, // Most recent first
      });
      console.log('previousReport',previousReport)

      console.log('Previous Report found:', previousReport ? previousReport.id : 'NONE');
      if (previousReport) {
        console.log('Previous Report createdAt:', previousReport.createdAt);
      }
      console.log('=== END DEBUG ===');

      if (!previousReport) {
        return {
          message: 'No previous report found for comparison',
          current_report: currentReport,
        };
      }

      // Calculate detailed metric comparisons
      const metricComparisons = this.calculateMetricComparisons(
        previousReport.metrics,
        currentReport.metrics
      );

      // Calculate time difference
      const timeDifference = this.calculateTimeDifference(
        previousReport.createdAt,
        currentReport.createdAt
      );

      // Generate overall summary
      const summary = this.generateComparisonSummary(metricComparisons);

      // Generate recommendations based on comparison
      const recommendations = this.generateComparisonRecommendations(metricComparisons);

      return {
        current_report: currentReport,
        previous_report: previousReport,
        comparison: {
          summary,
          metrics: metricComparisons,
          time_difference: timeDifference,
          recommendations
        },
      };
    } catch (error) {
      logger.error('Compare reports error:', error);
      throw error;
    }
  }

  /**
   * Get health trends for specific metrics
   */
  async getHealthTrends(userId, metricName, months = 6) {
    try {
      const startDate = Date.now() - months * 30 * 24 * 60 * 60 * 1000;

      const reports = await MedicalReport.findAll({
        where: {
          user_id: userId,
          status: 'completed',
        },
        include: [
          {
            model: ReportMetric,
            as: 'metrics',
            where: { metric_name: metricName },
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      const trends = reports.map((report) => ({
        report_id: report.id,
        date: report.createdAt,
        report_date: report.report_date,
        value: report.metrics[0]?.metric_value,
        unit: report.metrics[0]?.metric_unit,
        status: report.metrics[0]?.status,
        normal_range: report.metrics[0]?.normal_range,
      }));

      return {
        metric_name: metricName,
        display_name: this.getMetricDisplayName(metricName),
        data_points: trends,
        total_reports: trends.length,
      };
    } catch (error) {
      logger.error('Get health trends error:', error);
      throw error;
    }
  }

  /**
   * Get all metrics across all reports for trend analysis
   */
  async getAllMetricsTrends(userId, reportType = null, months = 6) {
    try {
      const whereClause = {
        user_id: userId,
        status: 'completed',
      };

      if (reportType) {
        whereClause.report_type = reportType;
      }

      const reports = await MedicalReport.findAll({
        where: whereClause,
        include: [
          {
            model: ReportMetric,
            as: 'metrics',
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      // Group metrics by metric_name
      const metricsTrends = {};

      reports.forEach((report) => {
        report.metrics.forEach((metric) => {
          if (!metricsTrends[metric.metric_name]) {
            metricsTrends[metric.metric_name] = {
              metric_name: metric.metric_name,
              display_name: this.getMetricDisplayName(metric.metric_name),
              unit: metric.metric_unit,
              data_points: [],
            };
          }

          metricsTrends[metric.metric_name].data_points.push({
            report_id: report.id,
            date: report.createdAt,
            report_date: report.report_date,
            report_type: report.report_type,
            value: metric.metric_value,
            numeric_value: parseFloat(metric.metric_value.replace(/,/g, '')),
            status: metric.status,
            normal_range: metric.normal_range,
          });
        });
      });

      // Convert to array and add trend analysis
      const trendsArray = Object.values(metricsTrends).map((metricTrend) => {
        const dataPoints = metricTrend.data_points;
        
        // Calculate trend direction
        let trendDirection = 'stable';
        if (dataPoints.length >= 2) {
          const firstValue = dataPoints[0].numeric_value;
          const lastValue = dataPoints[dataPoints.length - 1].numeric_value;
          const change = ((lastValue - firstValue) / firstValue) * 100;

          if (change > 5) trendDirection = 'increasing';
          else if (change < -5) trendDirection = 'decreasing';
        }

        // Calculate average
        const average = dataPoints.reduce((sum, dp) => sum + dp.numeric_value, 0) / dataPoints.length;

        // Count status distribution
        const statusCounts = {
          normal: dataPoints.filter(dp => dp.status === 'normal').length,
          low: dataPoints.filter(dp => dp.status === 'low').length,
          high: dataPoints.filter(dp => dp.status === 'high').length,
          critical: dataPoints.filter(dp => dp.status === 'critical').length,
        };

        return {
          ...metricTrend,
          trend_direction: trendDirection,
          average_value: average.toFixed(2),
          total_readings: dataPoints.length,
          status_distribution: statusCounts,
          latest_value: dataPoints[dataPoints.length - 1].value,
          latest_status: dataPoints[dataPoints.length - 1].status,
        };
      });

      return {
        user_id: userId,
        report_type: reportType || 'all',
        total_reports: reports.length,
        metrics: trendsArray,
      };
    } catch (error) {
      logger.error('Get all metrics trends error:', error);
      throw error;
    }
  }

  /**
   * Delete report
   */
  async deleteReport(reportId, userId) {
    try {
      const report = await MedicalReport.findOne({
        where: { id: reportId, user_id: userId },
      });

      if (!report) {
        const error = new Error('Report not found or does not belong to this user');
        error.statusCode = 404;
        throw error;
      }

      await report.destroy();
      return { message: 'Report deleted successfully' };
    } catch (error) {
      logger.error('Delete report error:', error);
      throw error;
    }
  }

  /**
   * Calculate detailed metric comparisons
   */
  calculateMetricComparisons(previousMetrics, currentMetrics) {
    const comparisons = [];

    // Create a map of current metrics for easy lookup
    const currentMetricsMap = {};
    currentMetrics.forEach(metric => {
      currentMetricsMap[metric.metric_name] = metric;
    });

    // Compare each previous metric with current
    previousMetrics.forEach(prevMetric => {
      const currMetric = currentMetricsMap[prevMetric.metric_name];
      
      if (currMetric) {
        const prevValue = parseFloat(prevMetric.metric_value.replace(/,/g, ''));
        const currValue = parseFloat(currMetric.metric_value.replace(/,/g, ''));
        const change = currValue - prevValue;
        const changePercentage = prevValue !== 0 ? ((change / prevValue) * 100).toFixed(1) : 0;
        
        // Determine trend
        let trend = 'stable';
        let interpretation = '';
        
        if (Math.abs(changePercentage) < 5) {
          trend = 'stable';
          interpretation = `Minimal change, remains ${currMetric.status === 'normal' ? 'in healthy range' : currMetric.status}. `;
        } else if (change > 0) {
          if (prevMetric.status === 'low' && currMetric.status === 'normal') {
            trend = 'improved';
            interpretation = 'Improved from low to normal range. ';
          } else if (currMetric.status === 'high') {
            trend = 'worsened';
            interpretation = 'Increased above normal range. ';
          } else {
            trend = 'increased';
            interpretation = 'Increased but within acceptable range. ';
          }
        } else {
          if (prevMetric.status === 'high' && currMetric.status === 'normal') {
            trend = 'improved';
            interpretation = 'Improved from high to normal range. ';
          } else if (currMetric.status === 'low') {
            trend = 'worsened';
            interpretation = 'Decreased below normal range. ';
          } else {
            trend = 'decreased';
            interpretation = 'Decreased but within acceptable range. ';
          }
        }

        comparisons.push({
          name: this.getMetricDisplayName(prevMetric.metric_name),
          previous_value: `${prevMetric.metric_value} ${prevMetric.metric_unit}`,
          current_value: `${currMetric.metric_value} ${currMetric.metric_unit}`,
          change: change >= 0 ? `+${change.toFixed(1)}` : change.toFixed(1),
          change_percentage: changePercentage >= 0 ? `+${changePercentage}%` : `${changePercentage}%`,
          trend,
          interpretation: interpretation + this.getMetricInterpretation(currMetric)
        });
      }
    });

    return comparisons;
  }

  /**
   * Calculate time difference between reports
   */
  calculateTimeDifference(previousDate, currentDate) {
    const diffMs = currentDate - previousDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Same day';
    if (diffDays === 1) return '1 day';
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 60) return '1 month';
    
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} months`;
  }

  /**
   * Generate overall comparison summary
   */
  generateComparisonSummary(metricComparisons) {
    const improved = metricComparisons.filter(m => m.trend === 'improved').length;
    const worsened = metricComparisons.filter(m => m.trend === 'worsened').length;
    const stable = metricComparisons.filter(m => m.trend === 'stable').length;

    let summary = '';
    
    if (improved > worsened) {
      summary = `Overall improvement in blood parameters. ${improved} metric(s) improved, ${stable} remained stable`;
      if (worsened > 0) summary += `, and ${worsened} worsened`;
      summary += '.';
    } else if (worsened > improved) {
      summary = `Some parameters need attention. ${worsened} metric(s) worsened, ${stable} remained stable`;
      if (improved > 0) summary += `, and ${improved} improved`;
      summary += '. Consult your doctor.';
    } else {
      summary = `Blood parameters are mostly stable. ${stable} metric(s) remained stable`;
      if (improved > 0) summary += `, ${improved} improved`;
      if (worsened > 0) summary += `, ${worsened} worsened`;
      summary += '.';
    }

    return summary;
  }

  /**
   * Get display name for metric
   */
  getMetricDisplayName(metricName) {
    const names = {
      hemoglobin: 'Hemoglobin',
      rbc_count: 'Red Blood Cells',
      wbc_count: 'White Blood Cells',
      platelet_count: 'Platelets',
      hematocrit: 'Hematocrit',
      mcv: 'MCV',
      mch: 'MCH',
      mchc: 'MCHC',
      neutrophils: 'Neutrophils',
      lymphocytes: 'Lymphocytes',
      monocytes: 'Monocytes',
      eosinophils: 'Eosinophils',
      basophils: 'Basophils',
      fasting_blood_sugar: 'Fasting Blood Sugar',
      hba1c: 'HbA1c',
      total_cholesterol: 'Total Cholesterol',
      ldl_cholesterol: 'LDL Cholesterol',
      hdl_cholesterol: 'HDL Cholesterol'
    };
    return names[metricName] || metricName;
  }

  /**
   * Get interpretation for current metric status
   */
  getMetricInterpretation(metric) {
    if (metric.status === 'normal') {
      return 'Within normal range.';
    } else if (metric.status === 'low') {
      return 'Below normal range - may need attention.';
    } else if (metric.status === 'high') {
      return 'Above normal range - may need attention.';
    }
    return '';
  }

  /**
   * Generate recommendations based on comparison
   */
  generateComparisonRecommendations(metricComparisons) {
    const recommendations = [];
    const worsened = metricComparisons.filter(m => m.trend === 'worsened');
    const improved = metricComparisons.filter(m => m.trend === 'improved');

    // Recommendations for worsened metrics
    if (worsened.length > 0) {
      recommendations.push({
        type: 'medical',
        priority: 'high',
        title: 'Consult Your Doctor',
        description: `${worsened.length} metric(s) have worsened since your last test. Schedule a follow-up appointment to discuss these changes.`,
        metrics: worsened.map(m => m.name)
      });
    }

    // Recommendations for improved metrics
    if (improved.length > 0) {
      recommendations.push({
        type: 'lifestyle',
        priority: 'medium',
        title: 'Keep Up the Good Work',
        description: `${improved.length} metric(s) have improved! Continue your current treatment plan and healthy lifestyle habits.`,
        metrics: improved.map(m => m.name)
      });
    }

    // General monitoring recommendation
    recommendations.push({
      type: 'monitoring',
      priority: 'low',
      title: 'Regular Monitoring',
      description: 'Continue regular health check-ups to track your progress over time.',
      metrics: []
    });

    // Specific metric recommendations
    worsened.forEach(metric => {
      if (metric.name === 'Hemoglobin' || metric.name === 'Red Blood Cells') {
        recommendations.push({
          type: 'diet',
          priority: 'high',
          title: 'Increase Iron Intake',
          description: 'Your hemoglobin/RBC levels have decreased. Consider iron-rich foods like spinach, red meat, and beans.',
          metrics: [metric.name]
        });
      }
      if (metric.name === 'White Blood Cells') {
        recommendations.push({
          type: 'medical',
          priority: 'high',
          title: 'Immune System Check',
          description: 'Changes in WBC count may indicate infection or immune issues. Consult your doctor.',
          metrics: [metric.name]
        });
      }
      if (metric.name === 'Platelets') {
        recommendations.push({
          type: 'medical',
          priority: 'high',
          title: 'Bleeding Risk Assessment',
          description: 'Low platelet count increases bleeding risk. Avoid activities that may cause injury.',
          metrics: [metric.name]
        });
      }
    });

    return recommendations;
  }
}

module.exports = new MedicalReportService();
