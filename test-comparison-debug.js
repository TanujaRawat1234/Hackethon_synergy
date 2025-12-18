/**
 * Debug comparison issue
 */

const { MedicalReport } = require('./models');
const { Op } = require('sequelize');

async function debugComparison() {
  try {
    console.log('=== Checking All Reports ===\n');
    
    // Get all reports for debugging
    const allReports = await MedicalReport.findAll({
      attributes: ['id', 'user_id', 'report_type', 'createdAt', 'status'],
      order: [['createdAt', 'ASC']]
    });

    console.log('Total reports:', allReports.length);
    console.log('\nReports ordered by createdAt:');
    allReports.forEach((report, index) => {
      console.log(`${index + 1}. ID: ${report.id.substring(0, 8)}...`);
      console.log(`   Type: ${report.report_type}`);
      console.log(`   CreatedAt: ${report.createdAt} (${new Date(report.createdAt).toLocaleString()})`);
      console.log(`   Status: ${report.status}`);
      console.log('');
    });

    if (allReports.length >= 2) {
      const currentReport = allReports[allReports.length - 1]; // Latest
      const expectedPrevious = allReports[allReports.length - 2]; // Second latest

      console.log('=== Testing Comparison Logic ===\n');
      console.log('Current Report (latest):');
      console.log('  ID:', currentReport.id.substring(0, 8) + '...');
      console.log('  CreatedAt:', currentReport.createdAt);
      console.log('');
      console.log('Expected Previous Report:');
      console.log('  ID:', expectedPrevious.id.substring(0, 8) + '...');
      console.log('  CreatedAt:', expectedPrevious.createdAt);
      console.log('');

      // Test the query
      console.log('Running query with Op.lt...');
      const foundReport = await MedicalReport.findOne({
        where: {
          user_id: currentReport.user_id,
          report_type: currentReport.report_type,
          createdAt: { [Op.lt]: currentReport.createdAt },
          status: 'completed',
          id: { [Op.ne]: currentReport.id }
        },
        order: [['createdAt', 'DESC']]
      });

      if (foundReport) {
        console.log('✅ Found previous report:');
        console.log('  ID:', foundReport.id.substring(0, 8) + '...');
        console.log('  CreatedAt:', foundReport.createdAt);
        console.log('  Match:', foundReport.id === expectedPrevious.id ? 'YES' : 'NO');
      } else {
        console.log('❌ No previous report found!');
        console.log('');
        console.log('Debugging:');
        console.log('  Current createdAt:', currentReport.createdAt);
        console.log('  Expected createdAt:', expectedPrevious.createdAt);
        console.log('  Is expected < current?', expectedPrevious.createdAt < currentReport.createdAt);
        console.log('  Type match?', expectedPrevious.report_type === currentReport.report_type);
        console.log('  Status:', expectedPrevious.status);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugComparison();
