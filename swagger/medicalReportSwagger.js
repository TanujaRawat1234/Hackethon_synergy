/**
 * @swagger
 * components:
 *   schemas:
 *     MedicalReport:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         report_type:
 *           type: string
 *           example: blood_test
 *         report_date:
 *           type: number
 *           example: 1702742400000
 *         file_url:
 *           type: string
 *         file_type:
 *           type: string
 *         extracted_text:
 *           type: string
 *         ai_summary:
 *           type: string
 *         ai_explanation:
 *           type: string
 *         status:
 *           type: string
 *           enum: [processing, completed, failed]
 *         metrics:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReportMetric'
 *     
 *     ReportMetric:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         report_id:
 *           type: string
 *           format: uuid
 *         metric_name:
 *           type: string
 *           example: blood_pressure
 *         metric_value:
 *           type: string
 *           example: 120/80
 *         metric_unit:
 *           type: string
 *           example: mmHg
 *         normal_range:
 *           type: string
 *           example: 90-120/60-80
 *         status:
 *           type: string
 *           enum: [normal, low, high, critical]
 *     
 *     ReportComparison:
 *       type: object
 *       properties:
 *         current_report:
 *           $ref: '#/components/schemas/MedicalReport'
 *         previous_report:
 *           $ref: '#/components/schemas/MedicalReport'
 *         comparison:
 *           type: object
 *           properties:
 *             overall_trend:
 *               type: string
 *               enum: [improving, declining, stable]
 *             key_changes:
 *               type: array
 *               items:
 *                 type: string
 *             concerns:
 *               type: array
 *               items:
 *                 type: string
 *             recommendations:
 *               type: array
 *               items:
 *                 type: string
 *             metric_comparisons:
 *               type: array
 *               items:
 *                 type: object
 * 
 * tags:
 *   name: Medical Reports
 *   description: Medical report management and analysis
 */

module.exports = {};
