/**
 * Smart Recommendations Service
 * Provides personalized health recommendations based on report data
 */

class RecommendationService {
  /**
   * Generate recommendations based on metrics
   */
  generateRecommendations(metrics, reportType) {
    const recommendations = [];
    const abnormalMetrics = metrics.filter(m => m.status !== 'normal');

    if (abnormalMetrics.length === 0) {
      return [{
        type: 'positive',
        title: 'Great Job!',
        message: 'All your values are within normal range. Keep up the healthy lifestyle!',
        priority: 'low',
        actions: ['Continue current diet', 'Maintain exercise routine', 'Regular check-ups']
      }];
    }

    // CBC-specific recommendations
    if (reportType === 'cbc') {
      const lowHb = metrics.find(m => m.metric_name === 'hemoglobin' && m.status === 'low');
      if (lowHb) {
        recommendations.push({
          type: 'warning',
          title: 'Low Hemoglobin Detected',
          message: 'Your hemoglobin is below normal range, which may cause fatigue and weakness.',
          priority: 'high',
          actions: [
            'Eat iron-rich foods (spinach, red meat, beans)',
            'Take iron supplements (consult doctor)',
            'Increase Vitamin C intake (helps iron absorption)',
            'Avoid tea/coffee with meals (blocks iron absorption)',
            'Follow-up test in 3 months'
          ],
          foods_to_eat: ['Spinach', 'Red meat', 'Lentils', 'Eggs', 'Fortified cereals'],
          foods_to_avoid: ['Excessive tea', 'Coffee with meals', 'Calcium supplements with iron']
        });
      }

      const highWbc = metrics.find(m => m.metric_name === 'wbc_count' && m.status === 'high');
      if (highWbc) {
        recommendations.push({
          type: 'alert',
          title: 'Elevated White Blood Cells',
          message: 'High WBC count may indicate infection or inflammation.',
          priority: 'high',
          actions: [
            'Consult doctor immediately',
            'May need additional tests',
            'Monitor for fever or symptoms',
            'Stay hydrated',
            'Get adequate rest'
          ]
        });
      }
    }

    // Sugar-specific recommendations
    if (reportType === 'sugar') {
      const highSugar = metrics.find(m => 
        (m.metric_name === 'fasting_blood_sugar' || m.metric_name === 'hba1c') && 
        (m.status === 'high' || m.status === 'critical')
      );
      
      if (highSugar) {
        const isCritical = highSugar.status === 'critical';
        recommendations.push({
          type: isCritical ? 'critical' : 'warning',
          title: isCritical ? 'Diabetes Detected' : 'Prediabetes Warning',
          message: isCritical 
            ? 'Your blood sugar levels indicate diabetes. Immediate medical attention required.'
            : 'Your blood sugar is elevated. You are at risk for diabetes.',
          priority: 'critical',
          actions: [
            'Consult endocrinologist immediately',
            'Start diabetes management plan',
            'Monitor blood sugar daily',
            'Reduce sugar and refined carbs',
            'Exercise 30 minutes daily',
            'Lose 5-10% body weight if overweight'
          ],
          foods_to_eat: ['Vegetables', 'Whole grains', 'Lean protein', 'Nuts', 'Berries'],
          foods_to_avoid: ['Sugary drinks', 'White bread', 'Pastries', 'Candy', 'Processed foods'],
          lifestyle_changes: [
            'Walk after meals',
            'Reduce portion sizes',
            'Eat more fiber',
            'Manage stress',
            'Get 7-8 hours sleep'
          ]
        });
      }
    }

    // Lipid-specific recommendations
    if (reportType === 'lipid_profile') {
      const highCholesterol = metrics.find(m => 
        (m.metric_name === 'total_cholesterol' || m.metric_name === 'ldl_cholesterol') && 
        (m.status === 'high' || m.status === 'critical')
      );
      
      if (highCholesterol) {
        recommendations.push({
          type: 'warning',
          title: 'High Cholesterol Detected',
          message: 'Elevated cholesterol increases your risk of heart disease and stroke.',
          priority: 'high',
          actions: [
            'Consult cardiologist',
            'May need statin medication',
            'Reduce saturated fats',
            'Increase physical activity',
            'Quit smoking if applicable',
            'Retest in 3 months'
          ],
          foods_to_eat: ['Oats', 'Fatty fish', 'Nuts', 'Olive oil', 'Avocado', 'Beans'],
          foods_to_avoid: ['Red meat', 'Butter', 'Cheese', 'Fried foods', 'Trans fats'],
          lifestyle_changes: [
            'Exercise 150 minutes/week',
            'Lose weight if overweight',
            'Reduce alcohol',
            'Manage stress',
            'Eat more fiber'
          ]
        });
      }

      const lowHdl = metrics.find(m => m.metric_name === 'hdl_cholesterol' && m.status === 'low');
      if (lowHdl) {
        recommendations.push({
          type: 'info',
          title: 'Low HDL (Good Cholesterol)',
          message: 'Higher HDL cholesterol provides better heart protection.',
          priority: 'medium',
          actions: [
            'Increase aerobic exercise',
            'Eat healthy fats (omega-3)',
            'Quit smoking',
            'Lose weight if overweight',
            'Moderate alcohol may help (consult doctor)'
          ],
          foods_to_eat: ['Fatty fish', 'Nuts', 'Olive oil', 'Avocado']
        });
      }
    }

    // General recommendations
    if (abnormalMetrics.length > 2) {
      recommendations.push({
        type: 'info',
        title: 'Multiple Values Need Attention',
        message: 'Several metrics are outside normal range. Comprehensive lifestyle changes recommended.',
        priority: 'high',
        actions: [
          'Schedule comprehensive health check-up',
          'Consult with primary care physician',
          'Consider working with nutritionist',
          'Start exercise program gradually',
          'Track your progress monthly'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Get follow-up schedule
   */
  getFollowUpSchedule(metrics, reportType) {
    const abnormalCount = metrics.filter(m => m.status !== 'normal').length;
    const hasCritical = metrics.some(m => m.status === 'critical');

    if (hasCritical) {
      return {
        urgency: 'immediate',
        timeframe: '1-2 weeks',
        message: 'Critical values detected. Schedule follow-up immediately.',
        tests_needed: [reportType]
      };
    }

    if (abnormalCount > 0) {
      return {
        urgency: 'soon',
        timeframe: '3 months',
        message: 'Some values are abnormal. Follow-up recommended in 3 months.',
        tests_needed: [reportType]
      };
    }

    return {
      urgency: 'routine',
      timeframe: '6-12 months',
      message: 'All values normal. Routine check-up in 6-12 months.',
      tests_needed: [reportType]
    };
  }
}

module.exports = new RecommendationService();
