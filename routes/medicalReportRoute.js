const express = require('express');
const router = express.Router();
const medicalReportController = require('../controller/medicalReportController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMedicalReport = require('../utills/uploadMedicalReport');

/**
 * @swagger
 * /api/medical-reports/types:
 *   get:
 *     summary: Get supported report types
 *     tags: [Medical Reports]
 *     responses:
 *       200:
 *         description: List of supported report types
 */
router.get('/types', medicalReportController.getReportTypes);

// All routes below require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/medical-reports/upload:
 *   post:
 *     summary: Upload a medical report
 *     tags: [Medical Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               report_type:
 *                 type: string
 *                 example: blood_test
 *               report_date:
 *                 type: number
 *                 example: 1702742400000
 *     responses:
 *       201:
 *         description: Report uploaded successfully
 */
router.post('/upload', uploadMedicalReport.single('file'), medicalReportController.uploadReport);

/**
 * @swagger
 * /api/medical-reports:
 *   get:
 *     summary: Get all user reports
 *     tags: [Medical Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: report_type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/', medicalReportController.getUserReports);

/**
 * @swagger
 * /api/medical-reports/trends/all:
 *   get:
 *     summary: Get all metrics trends across all reports
 *     tags: [Medical Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: report_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: All metrics trends data
 */
router.get('/trends/all', medicalReportController.getAllMetricsTrends);

/**
 * @swagger
 * /api/medical-reports/trends/data:
 *   get:
 *     summary: Get health trends for specific metric
 *     tags: [Medical Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: metric_name
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Health trends data
 */
router.get('/trends/data', medicalReportController.getHealthTrends);

/**
 * @swagger
 * /api/medical-reports/{reportId}:
 *   get:
 *     summary: Get single report details
 *     tags: [Medical Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report details
 */
router.get('/:reportId', medicalReportController.getReportById);

/**
 * @swagger
 * /api/medical-reports/{reportId}/compare:
 *   get:
 *     summary: Compare report with previous report
 *     tags: [Medical Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comparison results
 */
router.get('/:reportId/compare', medicalReportController.compareWithPrevious);

/**
 * @swagger
 * /api/medical-reports/{reportId}:
 *   delete:
 *     summary: Delete a report
 *     tags: [Medical Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted
 */
router.delete('/:reportId', medicalReportController.deleteReport);

module.exports = router;
