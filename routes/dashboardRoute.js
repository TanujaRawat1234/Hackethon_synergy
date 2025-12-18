const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get user's health dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data with health score and summary
 */
router.get('/', dashboardController.getHealthDashboard);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get health statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *         description: Number of months to analyze (default 6)
 *     responses:
 *       200:
 *         description: Health statistics
 */
router.get('/stats', dashboardController.getHealthStats);

module.exports = router;
