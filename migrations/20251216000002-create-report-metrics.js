'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('report_metrics', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      report_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'medical_reports',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      metric_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'e.g., blood_pressure, glucose, cholesterol, hemoglobin',
      },
      metric_value: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Actual value extracted',
      },
      metric_unit: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Unit of measurement: mg/dL, mmHg, etc.',
      },
      normal_range: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Normal range for this metric',
      },
      status: {
        type: Sequelize.ENUM('normal', 'low', 'high', 'critical'),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now(),
      },
      updatedAt: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now(),
      },
    });

    await queryInterface.addIndex('report_metrics', ['report_id']);
    await queryInterface.addIndex('report_metrics', ['metric_name']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('report_metrics');
  },
};
