const { MedicalReport, ReportMetric } = require('../models');
const ApiResponse = require('../utills/response');
const logger = require('../utills/logger');
const { Op } = require('sequelize');

class DashboardController {
  /**
   * Get user's health dashboard
   */
  async getHealthDashboard(req, res, next) {
    try {
      const userId = req.user.id;

      // Get total reports count
      const totalReports = await MedicalReport.count({
        where: { user_id: userId }
      });

      // Get reports by type
      const reportsByType = await MedicalReport.findAll({
        where: { user_id: userId },
        attributes: [
          'report_type',
          [MedicalReport.sequelize.fn('COUNT', MedicalReport.sequelize.col('id')), 'count']
        ],
        group: ['report_type']
      });

      // Get latest report
      const latestReport = await MedicalReport.findOne({
        where: { user_id: userId },
        order: [['report_date', 'DESC']],
        include: [{
          model: ReportMetric,
          as: 'metrics'
        }]
      });

      // Get metrics needing attention (abnormal values)
      const abnormalMetrics = await ReportMetric.findAll({
        include: [{
          model: MedicalReport,
          as: 'report',
          where: { user_id: userId },
          attributes: ['report_type', 'report_date']
        }],
        where: {
          status: { [Op.in]: ['low', 'high', 'critical'] }
        },
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      // Calculate health score
      const allMetrics = await ReportMetric.findAll({
        include: [{
          model: MedicalReport,
          as: 'report',
          where: { user_id: userId }
        }]
      });

      let healthScore = 100;
      allMetrics.forEach(metric => {
        if (metric.status === 'low' || metric.status === 'high') healthScore -= 3;
        if (metric.status === 'critical') healthScore -= 10;
      });
      healthScore = Math.max(0, Math.min(100, healthScore));

      // Get recent activity (last 5 reports)
      const recentReports = await MedicalReport.findAll({
        where: { user_id: userId },
        order: [['report_date', 'DESC']],
        limit: 5,
        attributes: ['id', 'report_type', 'report_date', 'status', 'ai_summary']
      });

      // Calculate days since last report
      const daysSinceLastReport = latestReport 
        ? Math.floor((Date.now() - latestReport.report_date) / (1000 * 60 * 60 * 24))
        : null;

      return ApiResponse.success(res, {
        summary: {
          total_reports: totalReports,
          health_score: healthScore,
          abnormal_metrics_count: abnormalMetrics.length,
          days_since_last_report: daysSinceLastReport
        },
        reports_by_type: reportsByType,
        latest_report: latestReport,
        abnormal_metrics: abnormalMetrics,
        recent_activity: recentReports,
        health_status: healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : healthScore >= 40 ? 'fair' : 'needs_attention'
      });
    } catch (error) {
      logger.error('Get dashboard error:', error);
      next(error);
    }
  }

  /**
   * Get health statistics
   */
  async getHealthStats(req, res, next) {
    try {
      const userId = req.user.id;
      const { months = 6 } = req.query;

      const startDate = Date.now() - months * 30 * 24 * 60 * 60 * 1000;

      // Get reports in time period
      const reports = await MedicalReport.findAll({
        where: {
          user_id: userId,
          report_date: { [Op.gte]: startDate }
        },
        include: [{
          model: ReportMetric,
          as: 'metrics'
        }],
        order: [['report_date', 'ASC']]
      });

      // Calculate statistics
      const stats = {
        total_reports: reports.length,
        reports_by_month: {},
        improvement_rate: 0,
        most_improved_metric: null,
        needs_attention: []
      };

      // Group by month
      reports.forEach(report => {
        const month = new Date(report.report_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        stats.reports_by_month[month] = (stats.reports_by_month[month] || 0) + 1;
      });

      // Find metrics that need attention
      const latestReport = reports[reports.length - 1];
      if (latestReport) {
        stats.needs_attention = latestReport.metrics
          .filter(m => m.status !== 'normal')
          .map(m => ({
            metric_name: m.metric_name,
            value: m.metric_value,
            status: m.status
          }));
      }

      return ApiResponse.success(res, stats);
    } catch (error) {
      logger.error('Get health stats error:', error);
      next(error);
    }
  }
}

module.exports = new DashboardController();
