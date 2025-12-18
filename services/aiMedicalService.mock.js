/**
 * Mock AI Medical Service
 * Use this temporarily if Google AI API is not working
 * Provides realistic mock responses for testing
 */

const logger = require('../utills/logger');

class MockAIMedicalService {
  /**
   * Analyze medical report text and extract key information
   */
  async analyzeMedicalReport(extractedText, reportType) {
    try {
      console.log('Using MOCK AI service (Google AI not available)');
      console.log('Analyzing', reportType, 'report...');
      
      // Generate context-aware summary and explanation
      const metrics = this.extractMetricsByType(extractedText, reportType);
      const summary = this.generateSummary(extractedText, metrics, reportType);
      const explanation = this.generateExplanation(extractedText, metrics, reportType);
      
      return {
        summary,
        explanation,
        metrics
      };
    } catch (error) {
      logger.error('Mock AI Analysis Error:', error);
      throw error;
    }
  }

  extractMetricsByType(text, reportType) {
    switch(reportType) {
      case 'cbc':
        return this.extractCBCMetrics(text);
      case 'sugar':
        return this.extractSugarMetrics(text);
      case 'lipid_profile':
        return this.extractLipidMetrics(text);
      default:
        return this.extractCBCMetrics(text);
    }
  }

  generateSummary(text, metrics, reportType) {
    const abnormalMetrics = metrics.filter(m => m.status !== 'normal');
    const lowMetrics = metrics.filter(m => m.status === 'low');
    const highMetrics = metrics.filter(m => m.status === 'high');
    const criticalMetrics = metrics.filter(m => m.status === 'critical');
    
    // If all normal
    if (abnormalMetrics.length === 0) {
      return `✅ Excellent news! Your ${this.getReportTypeName(reportType)} shows all ${metrics.length} values within normal ranges. Your blood health is good, and all key indicators are functioning properly. Continue maintaining your healthy lifestyle.`;
    }
    
    // Build detailed summary based on abnormal metrics
    let summary = `📋 Your ${this.getReportTypeName(reportType)} Analysis:\n\n`;
    
    // Critical metrics first
    if (criticalMetrics.length > 0) {
      summary += `🔴 CRITICAL: ${criticalMetrics.length} value(s) need immediate attention:\n`;
      criticalMetrics.forEach(m => {
        summary += `   • ${this.getMetricDisplayName(m.metric_name)}: ${m.metric_value} ${m.metric_unit} (Critical - Normal: ${m.normal_range})\n`;
      });
      summary += '\n';
    }
    
    // Low metrics
    if (lowMetrics.length > 0) {
      summary += `⚠️ LOW VALUES: ${lowMetrics.length} metric(s) below normal range:\n`;
      lowMetrics.forEach(m => {
        summary += `   • ${this.getMetricDisplayName(m.metric_name)}: ${m.metric_value} ${m.metric_unit} (Normal: ${m.normal_range})\n`;
      });
      
      // Add specific explanations for common low values
      if (lowMetrics.some(m => m.metric_name === 'hemoglobin')) {
        summary += `   → Low hemoglobin indicates anemia - may cause fatigue and weakness\n`;
      }
      if (lowMetrics.some(m => m.metric_name === 'wbc_count')) {
        summary += `   → Low white blood cells - weakened immune system\n`;
      }
      if (lowMetrics.some(m => m.metric_name === 'platelet_count')) {
        summary += `   → Low platelets - increased bleeding risk\n`;
      }
      summary += '\n';
    }
    
    // High metrics
    if (highMetrics.length > 0) {
      summary += `⚠️ HIGH VALUES: ${highMetrics.length} metric(s) above normal range:\n`;
      highMetrics.forEach(m => {
        summary += `   • ${this.getMetricDisplayName(m.metric_name)}: ${m.metric_value} ${m.metric_unit} (Normal: ${m.normal_range})\n`;
      });
      
      // Add specific explanations for common high values
      if (highMetrics.some(m => m.metric_name === 'wbc_count')) {
        summary += `   → High white blood cells - possible infection or inflammation\n`;
      }
      if (highMetrics.some(m => m.metric_name === 'total_cholesterol')) {
        summary += `   → High cholesterol - increased cardiovascular risk\n`;
      }
      summary += '\n';
    }
    
    // Normal metrics count
    const normalCount = metrics.length - abnormalMetrics.length;
    if (normalCount > 0) {
      summary += `✅ NORMAL: ${normalCount} metric(s) within healthy range\n\n`;
    }
    
    // Overall assessment
    if (criticalMetrics.length > 0) {
      summary += `🏥 RECOMMENDATION: Consult your doctor immediately for critical values.`;
    } else if (abnormalMetrics.length >= metrics.length / 2) {
      summary += `🏥 RECOMMENDATION: Schedule a follow-up appointment with your doctor to discuss these results.`;
    } else if (abnormalMetrics.length > 0) {
      summary += `💡 RECOMMENDATION: Monitor these values and discuss with your doctor during your next visit.`;
    }
    
    return summary.trim();
  }
  
  getMetricDisplayName(metricName) {
    const displayNames = {
      hemoglobin: 'Hemoglobin',
      rbc_count: 'Red Blood Cells (RBC)',
      wbc_count: 'White Blood Cells (WBC)',
      platelet_count: 'Platelets',
      hematocrit: 'Hematocrit (HCT)',
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
      hdl_cholesterol: 'HDL Cholesterol',
      triglycerides: 'Triglycerides'
    };
    return displayNames[metricName] || metricName.replace(/_/g, ' ').toUpperCase();
  }

  generateExplanation(text, metrics, reportType) {
    let explanation = `=== UNDERSTANDING YOUR ${this.getReportTypeName(reportType).toUpperCase()} ===\n\n`;
    
    // Add metric-specific explanations with better formatting
    if (metrics.length > 0) {
      explanation += `📊 YOUR TEST RESULTS:\n`;
      explanation += `${'='.repeat(50)}\n\n`;
      
      metrics.forEach((metric, index) => {
        const metricExplanation = this.getMetricExplanation(metric);
        explanation += `${index + 1}. ${metricExplanation}\n\n`;
      });
    }
    
    // Add interpretation from the report if available
    const interpretationMatch = text.match(/INTERPRETATION[\s\S]*?(?=RECOMMENDATIONS|Verified|$)/i);
    if (interpretationMatch) {
      const interpretation = interpretationMatch[0]
        .replace(/INTERPRETATION/i, '')
        .replace(/[-=]+/g, '')
        .trim();
      if (interpretation) {
        explanation += `\n${'='.repeat(50)}\n`;
        explanation += `💡 MEDICAL INTERPRETATION:\n`;
        explanation += `${'='.repeat(50)}\n`;
        explanation += `${interpretation}\n\n`;
      }
    }
    
    // Add recommendations from the report if available
    const recommendationsMatch = text.match(/RECOMMENDATIONS:[\s\S]*?(?=Verified|$)/i);
    if (recommendationsMatch) {
      const recommendations = recommendationsMatch[0]
        .replace(/RECOMMENDATIONS:/i, '')
        .replace(/[-=]+/g, '')
        .replace(/Verified.*/s, '')
        .trim();
      if (recommendations) {
        explanation += `${'='.repeat(50)}\n`;
        explanation += `✅ DOCTOR'S RECOMMENDATIONS:\n`;
        explanation += `${'='.repeat(50)}\n`;
        explanation += `${recommendations}\n`;
      }
    }
    
    return explanation.trim();
  }

  getMetricExplanation(metric) {
    const statusEmoji = metric.status === 'low' ? '⚠️' : metric.status === 'high' ? '⚠️' : metric.status === 'critical' ? '🔴' : '✅';
    const statusText = metric.status === 'low' ? 'LOW' : metric.status === 'high' ? 'HIGH' : metric.status === 'critical' ? 'CRITICAL' : 'NORMAL';
    
    const explanations = {
      hemoglobin: `${statusEmoji} HEMOGLOBIN: ${metric.metric_value} ${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range} ${metric.metric_unit}
   
   What it is: Hemoglobin is a protein in red blood cells that carries oxygen from your lungs to all parts of your body.
   
   What your result means: ${metric.status === 'low' ? 'Your hemoglobin is BELOW normal range. This means you have fewer red blood cells than needed, which can cause fatigue, weakness, and shortness of breath. This condition is called anemia.' : metric.status === 'high' ? 'Your hemoglobin is ABOVE normal range. This could indicate dehydration, lung disease, or living at high altitude.' : 'Your hemoglobin is in the NORMAL range. Your blood can effectively carry oxygen to all your organs and tissues.'}`,
      
      wbc_count: `${statusEmoji} WHITE BLOOD CELLS (WBC): ${metric.metric_value} ${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range} ${metric.metric_unit}
   
   What it is: White blood cells are your immune system's soldiers that fight infections and diseases.
   
   What your result means: ${metric.status === 'low' ? 'Your WBC count is LOW. This weakens your immune system and increases infection risk.' : metric.status === 'high' ? 'Your WBC count is HIGH. This may indicate an infection, inflammation, or stress response.' : 'Your WBC count is NORMAL. Your immune system is functioning well.'}`,
      
      rbc_count: `${statusEmoji} RED BLOOD CELLS (RBC): ${metric.metric_value} ${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range} ${metric.metric_unit}
   
   What it is: Red blood cells carry oxygen from your lungs to every cell in your body.
   
   What your result means: ${metric.status === 'low' ? 'Your RBC count is LOW. This reduces oxygen delivery to your body.' : metric.status === 'high' ? 'Your RBC count is HIGH. This may indicate dehydration or lung problems.' : 'Your RBC count is NORMAL. Oxygen delivery to your body is adequate.'}`,
      
      platelet_count: `${statusEmoji} PLATELETS: ${metric.metric_value} ${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range} ${metric.metric_unit}
   
   What it is: Platelets are tiny blood cells that help stop bleeding by forming clots.
   
   What your result means: ${metric.status === 'low' ? 'Your platelet count is LOW. This increases bleeding risk and bruising.' : metric.status === 'high' ? 'Your platelet count is HIGH. This may increase blood clot risk.' : 'Your platelet count is NORMAL. Your blood can clot properly.'}`,
      
      hematocrit: `${statusEmoji} HEMATOCRIT (HCT): ${metric.metric_value}${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range}${metric.metric_unit}
   
   What it is: Hematocrit measures the percentage of your blood that is made up of red blood cells.
   
   What your result means: ${metric.status === 'low' ? 'Your hematocrit is LOW. This indicates anemia or blood loss.' : metric.status === 'high' ? 'Your hematocrit is HIGH. This may indicate dehydration.' : 'Your hematocrit is NORMAL.'}`,
      
      mcv: `${statusEmoji} MCV (Mean Corpuscular Volume): ${metric.metric_value} ${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range} ${metric.metric_unit}
   
   What it is: MCV measures the average size of your red blood cells.
   
   What your result means: ${metric.status === 'low' ? 'Your red blood cells are SMALLER than normal. This may indicate iron deficiency.' : metric.status === 'high' ? 'Your red blood cells are LARGER than normal. This may indicate vitamin B12 or folate deficiency.' : 'Your red blood cells are NORMAL size.'}`,
      
      mch: `${statusEmoji} MCH (Mean Corpuscular Hemoglobin): ${metric.metric_value} ${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range} ${metric.metric_unit}
   
   What it is: MCH measures the average amount of hemoglobin in each red blood cell.
   
   What your result means: ${metric.status === 'low' ? 'Your red blood cells contain LESS hemoglobin than normal. This is common in iron deficiency anemia.' : metric.status === 'high' ? 'Your red blood cells contain MORE hemoglobin than normal.' : 'Your red blood cells contain NORMAL amounts of hemoglobin.'}`,
      
      mchc: `${statusEmoji} MCHC (Mean Corpuscular Hemoglobin Concentration): ${metric.metric_value} ${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range} ${metric.metric_unit}
   
   What it is: MCHC measures the concentration of hemoglobin in your red blood cells.
   
   What your result means: ${metric.status === 'low' ? 'Your hemoglobin concentration is LOW. This indicates iron deficiency anemia.' : metric.status === 'high' ? 'Your hemoglobin concentration is HIGH.' : 'Your hemoglobin concentration is NORMAL.'}`,
      
      // Differential Count Explanations
      neutrophils: `${statusEmoji} NEUTROPHILS: ${metric.metric_value}${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range}${metric.metric_unit}
   
   What it is: Neutrophils are the most common type of white blood cells that fight bacterial infections.
   
   What your result means: ${metric.status === 'low' ? 'LOW neutrophils increase your risk of bacterial infections.' : metric.status === 'high' ? 'HIGH neutrophils may indicate bacterial infection or inflammation.' : 'NORMAL. Your body can fight bacterial infections effectively.'}`,
      
      lymphocytes: `${statusEmoji} LYMPHOCYTES: ${metric.metric_value}${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range}${metric.metric_unit}
   
   What it is: Lymphocytes fight viral infections and produce antibodies.
   
   What your result means: ${metric.status === 'low' ? 'LOW lymphocytes may weaken your immune response to viruses.' : metric.status === 'high' ? 'HIGH lymphocytes may indicate viral infection or immune response.' : 'NORMAL. Your immune system is balanced.'}`,
      
      monocytes: `${statusEmoji} MONOCYTES: ${metric.metric_value}${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range}${metric.metric_unit}
   
   What it is: Monocytes clean up dead cells and fight chronic infections.
   
   What your result means: ${metric.status === 'low' ? 'LOW monocytes are uncommon but may affect healing.' : metric.status === 'high' ? 'HIGH monocytes may indicate chronic infection or inflammation.' : 'NORMAL. Your body can clean up damaged tissue effectively.'}`,
      
      eosinophils: `${statusEmoji} EOSINOPHILS: ${metric.metric_value}${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range}${metric.metric_unit}
   
   What it is: Eosinophils fight parasites and are involved in allergic reactions.
   
   What your result means: ${metric.status === 'low' ? 'LOW eosinophils are usually not concerning.' : metric.status === 'high' ? 'HIGH eosinophils may indicate allergies, asthma, or parasitic infection.' : 'NORMAL. No signs of allergies or parasites.'}`,
      
      basophils: `${statusEmoji} BASOPHILS: ${metric.metric_value}${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range}${metric.metric_unit}
   
   What it is: Basophils release histamine during allergic reactions.
   
   What your result means: ${metric.status === 'low' ? 'LOW basophils are usually not concerning.' : metric.status === 'high' ? 'HIGH basophils may indicate allergic reaction or inflammation.' : 'NORMAL. No signs of severe allergic response.'}`,
      
      // Sugar metrics
      fasting_blood_sugar: `${statusEmoji} FASTING BLOOD SUGAR: ${metric.metric_value} ${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range} ${metric.metric_unit}
   
   What it is: Blood sugar level after 8-10 hours of not eating.
   
   What your result means: ${metric.status === 'high' || metric.status === 'critical' ? 'Your blood sugar is ELEVATED. This indicates poor glucose control and diabetes risk.' : 'Your blood sugar is NORMAL. Good glucose control.'}`,
      
      hba1c: `${statusEmoji} HbA1c: ${metric.metric_value}${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range}${metric.metric_unit}
   
   What it is: Shows your average blood sugar over the past 3 months.
   
   What your result means: ${metric.status === 'critical' ? 'DIABETES detected. Immediate medical attention needed.' : metric.status === 'high' ? 'PREDIABETES detected. Lifestyle changes urgently needed.' : 'NORMAL. No diabetes risk.'}`,
      
      // Lipid metrics
      total_cholesterol: `${statusEmoji} TOTAL CHOLESTEROL: ${metric.metric_value} ${metric.metric_unit} (${statusText})
   Desirable: ${metric.normal_range} ${metric.metric_unit}
   
   What it is: Sum of all cholesterol types in your blood.
   
   What your result means: ${metric.status === 'high' || metric.status === 'critical' ? 'ELEVATED. Increases heart disease and stroke risk.' : 'DESIRABLE range. Good for heart health.'}`,
      
      ldl_cholesterol: `${statusEmoji} LDL "BAD" CHOLESTEROL: ${metric.metric_value} ${metric.metric_unit} (${statusText})
   Optimal: ${metric.normal_range} ${metric.metric_unit}
   
   What it is: LDL can build up in arteries and cause blockages.
   
   What your result means: ${metric.status === 'high' ? 'HIGH. Increases cardiovascular risk.' : 'In healthy range.'}`,
      
      hdl_cholesterol: `${statusEmoji} HDL "GOOD" CHOLESTEROL: ${metric.metric_value} ${metric.metric_unit} (${statusText})
   Desirable: ${metric.normal_range} ${metric.metric_unit}
   
   What it is: HDL helps remove bad cholesterol from arteries.
   
   What your result means: ${metric.status === 'low' ? 'LOW. Higher HDL provides better heart protection.' : 'Good level. Provides cardiovascular protection.'}`
    };
    
    // Return explanation if exists, otherwise create a generic one
    return explanations[metric.metric_name] || `${statusEmoji} ${metric.metric_name.toUpperCase().replace(/_/g, ' ')}: ${metric.metric_value} ${metric.metric_unit} (${statusText})
   Normal Range: ${metric.normal_range} ${metric.metric_unit}
   
   Status: ${statusText}`;
  }

  getReportTypeName(reportType) {
    const names = {
      cbc: 'Complete Blood Count (CBC)',
      sugar: 'Blood Sugar Test',
      lipid_profile: 'Lipid Profile'
    };
    return names[reportType] || 'Medical Report';
  }

  extractCBCMetrics(text) {
    const metrics = [];
    
    console.log('Extracting ALL CBC metrics from text...');
    console.log('Text length:', text.length);
    
    // Extract ALL metrics - patterns work with OR without "Status:" field
    // This makes it flexible for different PDF formats
    
    // Main CBC Metrics (Primary)
    const mainMetrics = [
      { 
        name: 'hemoglobin', 
        pattern: /HEMOGLOBIN[\s\S]*?Result:\s*(\d+\.?\d*)\s*g\/dL[\s\S]*?Normal Range:\s*([\d.-]+)/i, 
        unit: 'g/dL', 
        min: 13.5, 
        max: 17.5 
      },
      { 
        name: 'rbc_count', 
        pattern: /RED BLOOD CELL COUNT[\s\S]*?Result:\s*(\d+\.?\d*)\s*million\/[µu]L[\s\S]*?Normal Range:\s*([\d.-]+)/i, 
        unit: 'million/µL', 
        min: 4.5, 
        max: 5.5 
      },
      { 
        name: 'wbc_count', 
        pattern: /WHITE BLOOD CELL COUNT[\s\S]*?Result:\s*([\d,]+)\s*cells\/[µu]L[\s\S]*?Normal Range:\s*([\d,\-]+)/i, 
        unit: 'cells/µL', 
        min: 4000, 
        max: 11000 
      },
      { 
        name: 'platelet_count', 
        pattern: /PLATELET COUNT[\s\S]*?Result:\s*([\d,]+)\s*cells\/[µu]L[\s\S]*?Normal Range:\s*([\d,\-]+)/i, 
        unit: 'cells/µL', 
        min: 150000, 
        max: 450000 
      },
      { 
        name: 'hematocrit', 
        pattern: /HEMATOCRIT\s*\(HCT\)[\s\S]*?Result:\s*(\d+)%[\s\S]*?Normal Range:\s*([\d-]+)/i, 
        unit: '%', 
        min: 38, 
        max: 50 
      },
      { 
        name: 'mcv', 
        pattern: /MEAN CORPUSCULAR VOLUME\s*\(MCV\)[\s\S]*?Result:\s*(\d+)\s*fL[\s\S]*?Normal Range:\s*([\d-]+)/i, 
        unit: 'fL', 
        min: 80, 
        max: 100 
      },
      { 
        name: 'mch', 
        pattern: /MEAN CORPUSCULAR HEMOGLOBIN\s*\(MCH\)[\s\S]*?Result:\s*(\d+)\s*pg[\s\S]*?Normal Range:\s*([\d-]+)/i, 
        unit: 'pg', 
        min: 27, 
        max: 33 
      },
      { 
        name: 'mchc', 
        pattern: /MEAN CORPUSCULAR HEMOGLOBIN CONCENTRATION\s*\(MCHC\)[\s\S]*?Result:\s*(\d+)\s*g\/dL[\s\S]*?Normal Range:\s*([\d-]+)/i, 
        unit: 'g/dL', 
        min: 32, 
        max: 36 
      }
    ];
    
    // Extract main metrics
    mainMetrics.forEach(metric => {
      const match = text.match(metric.pattern);
      if (match) {
        const value = parseFloat(match[1].replace(/,/g, ''));
        const normalRange = match[2];
        
        // Check if there's a Status field after Normal Range
        const statusPattern = new RegExp(`Normal Range:\\s*${normalRange.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?Status:\\s*(\\w+)`, 'i');
        const statusMatch = text.match(statusPattern);
        
        // Determine status from Status field OR by comparing to normal range
        let status = 'normal';
        if (statusMatch && statusMatch[1]) {
          const statusText = statusMatch[1].toLowerCase();
          status = statusText.includes('low') ? 'low' : 
                   statusText.includes('high') ? 'high' : 
                   statusText.includes('critical') ? 'critical' : 'normal';
        } else if (metric.min && metric.max) {
          // Calculate status from value
          status = value < metric.min ? 'low' : value > metric.max ? 'high' : 'normal';
        }
        
        metrics.push({
          metric_name: metric.name,
          metric_value: match[1],
          metric_unit: metric.unit,
          normal_range: normalRange,
          status: status
        });
      }
    });
    
    // Extract DIFFERENTIAL COUNT (additional metrics)
    const differentialSection = text.match(/DIFFERENTIAL COUNT[\s\S]*?(?=INTERPRETATION|$)/i);
    if (differentialSection) {
      const diffText = differentialSection[0];
      
      // Neutrophils
      const neutrophilsMatch = diffText.match(/NEUTROPHILS:\s*(\d+)%\s*\(Normal:\s*([\d-]+)%\)/i);
      if (neutrophilsMatch) {
        const value = parseInt(neutrophilsMatch[1]);
        const [min, max] = neutrophilsMatch[2].split('-').map(v => parseInt(v));
        metrics.push({
          metric_name: 'neutrophils',
          metric_value: neutrophilsMatch[1],
          metric_unit: '%',
          normal_range: neutrophilsMatch[2],
          status: value < min ? 'low' : value > max ? 'high' : 'normal'
        });
      }
      
      // Lymphocytes
      const lymphocytesMatch = diffText.match(/LYMPHOCYTES:\s*(\d+)%\s*\(Normal:\s*([\d-]+)%\)/i);
      if (lymphocytesMatch) {
        const value = parseInt(lymphocytesMatch[1]);
        const [min, max] = lymphocytesMatch[2].split('-').map(v => parseInt(v));
        metrics.push({
          metric_name: 'lymphocytes',
          metric_value: lymphocytesMatch[1],
          metric_unit: '%',
          normal_range: lymphocytesMatch[2],
          status: value < min ? 'low' : value > max ? 'high' : 'normal'
        });
      }
      
      // Monocytes
      const monocytesMatch = diffText.match(/MONOCYTES:\s*(\d+)%\s*\(Normal:\s*([\d-]+)%\)/i);
      if (monocytesMatch) {
        const value = parseInt(monocytesMatch[1]);
        const [min, max] = monocytesMatch[2].split('-').map(v => parseInt(v));
        metrics.push({
          metric_name: 'monocytes',
          metric_value: monocytesMatch[1],
          metric_unit: '%',
          normal_range: monocytesMatch[2],
          status: value < min ? 'low' : value > max ? 'high' : 'normal'
        });
      }
      
      // Eosinophils
      const eosinophilsMatch = diffText.match(/EOSINOPHILS:\s*(\d+)%\s*\(Normal:\s*([\d-]+)%\)/i);
      if (eosinophilsMatch) {
        const value = parseInt(eosinophilsMatch[1]);
        const [min, max] = eosinophilsMatch[2].split('-').map(v => parseInt(v));
        metrics.push({
          metric_name: 'eosinophils',
          metric_value: eosinophilsMatch[1],
          metric_unit: '%',
          normal_range: eosinophilsMatch[2],
          status: value < min ? 'low' : value > max ? 'high' : 'normal'
        });
      }
      
      // Basophils
      const basophilsMatch = diffText.match(/BASOPHILS:\s*(\d+)%\s*\(Normal:\s*([\d-]+)%\)/i);
      if (basophilsMatch) {
        const value = parseInt(basophilsMatch[1]);
        const [min, max] = basophilsMatch[2].split('-').map(v => parseInt(v));
        metrics.push({
          metric_name: 'basophils',
          metric_value: basophilsMatch[1],
          metric_unit: '%',
          normal_range: basophilsMatch[2],
          status: value < min ? 'low' : value > max ? 'high' : 'normal'
        });
      }
    }

    console.log(`✓ Extracted ${metrics.length} CBC metrics (including differential):`, metrics.map(m => m.metric_name));
    
    if (metrics.length === 0) {
      console.log('⚠️ No metrics extracted! Text preview:', text.substring(0, 500));
    }
    
    return metrics.length > 0 ? metrics : [
      { metric_name: 'hemoglobin', metric_value: '14.5', metric_unit: 'g/dL', normal_range: '13.5-17.5', status: 'normal' }
    ];
  }

  extractSugarMetrics(text) {
    const metrics = [];
    
    const fbsMatch = text.match(/FASTING[:\s\n]+Result:\s*(\d+)\s*mg\/dL/i);
    if (fbsMatch) {
      const value = parseInt(fbsMatch[1]);
      metrics.push({
        metric_name: 'fasting_blood_sugar',
        metric_value: fbsMatch[1],
        metric_unit: 'mg/dL',
        normal_range: '70-100',
        status: value >= 70 && value <= 100 ? 'normal' : value < 70 ? 'low' : 'high'
      });
    }

    const hba1cMatch = text.match(/HbA1c[:\s\n]+Result:\s*(\d+\.?\d*)%?/i);
    if (hba1cMatch) {
      const value = parseFloat(hba1cMatch[1]);
      metrics.push({
        metric_name: 'hba1c',
        metric_value: hba1cMatch[1],
        metric_unit: '%',
        normal_range: '<5.7',
        status: value < 5.7 ? 'normal' : value < 6.5 ? 'high' : 'critical'
      });
    }

    return metrics.length > 0 ? metrics : [
      { metric_name: 'fasting_blood_sugar', metric_value: '95', metric_unit: 'mg/dL', normal_range: '70-100', status: 'normal' }
    ];
  }

  extractLipidMetrics(text) {
    const metrics = [];
    
    const totalMatch = text.match(/TOTAL CHOLESTEROL[:\s\n]+Result:\s*(\d+)\s*mg\/dL/i);
    if (totalMatch) {
      const value = parseInt(totalMatch[1]);
      metrics.push({
        metric_name: 'total_cholesterol',
        metric_value: totalMatch[1],
        metric_unit: 'mg/dL',
        normal_range: '<200',
        status: value < 200 ? 'normal' : value < 240 ? 'high' : 'critical'
      });
    }

    const ldlMatch = text.match(/LDL[:\s\n]+Result:\s*(\d+)\s*mg\/dL/i);
    if (ldlMatch) {
      const value = parseInt(ldlMatch[1]);
      metrics.push({
        metric_name: 'ldl_cholesterol',
        metric_value: ldlMatch[1],
        metric_unit: 'mg/dL',
        normal_range: '<100',
        status: value < 100 ? 'normal' : value < 160 ? 'high' : 'critical'
      });
    }

    const hdlMatch = text.match(/HDL[:\s\n]+Result:\s*(\d+)\s*mg\/dL/i);
    if (hdlMatch) {
      const value = parseInt(hdlMatch[1]);
      metrics.push({
        metric_name: 'hdl_cholesterol',
        metric_value: hdlMatch[1],
        metric_unit: 'mg/dL',
        normal_range: '≥60',
        status: value >= 60 ? 'normal' : value >= 40 ? 'low' : 'critical'
      });
    }

    return metrics.length > 0 ? metrics : [
      { metric_name: 'total_cholesterol', metric_value: '185', metric_unit: 'mg/dL', normal_range: '<200', status: 'normal' }
    ];
  }

  /**
   * Compare two medical reports and highlight trends
   */
  async compareReports(oldReport, newReport) {
    try {
      console.log('Using MOCK AI comparison service');
      
      return {
        overall_trend: 'stable',
        key_changes: [
          'Most values remain within normal ranges',
          'No significant changes detected between reports'
        ],
        concerns: [],
        recommendations: [
          'Continue maintaining healthy lifestyle',
          'Regular monitoring recommended',
          'Consult with your doctor for personalized advice'
        ],
        metric_comparisons: []
      };
    } catch (error) {
      logger.error('Mock AI Comparison Error:', error);
      throw error;
    }
  }

  /**
   * Calculate overall health score (0-100) based on metrics
   */
  calculateHealthScore(metrics) {
    if (metrics.length === 0) return 0;
    
    const normalCount = metrics.filter(m => m.status === 'normal').length;
    const lowCount = metrics.filter(m => m.status === 'low').length;
    const highCount = metrics.filter(m => m.status === 'high').length;
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    
    // Base score from normal metrics (100% if all normal)
    let score = (normalCount / metrics.length) * 100;
    
    // Deduct points for abnormal metrics
    score -= (lowCount * 5);      // -5 points per low value
    score -= (highCount * 5);     // -5 points per high value
    score -= (criticalCount * 15); // -15 points per critical value
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Determine risk level based on metrics
   */
  determineRiskLevel(metrics) {
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const abnormalCount = metrics.filter(m => m.status !== 'normal').length;
    const totalCount = metrics.length;
    
    if (criticalCount > 0) return 'critical';
    if (abnormalCount >= totalCount / 2) return 'high';
    if (abnormalCount > 0) return 'moderate';
    return 'low';
  }
}

module.exports = new MockAIMedicalService();
