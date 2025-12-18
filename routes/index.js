const express = require('express');
const router = express.Router();




router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working!' });
});

router.use('/api/auth', require('./authRoute'));
router.use('/api/medical-reports', require('./medicalReportRoute'));
router.use('/api/dashboard', require('./dashboardRoute'));

// router.use('/', require('./paymentRoute'));

module.exports = router;