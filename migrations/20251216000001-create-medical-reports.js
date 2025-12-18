'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medical_reports', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      report_type: {
        type: Sequelize.ENUM('cbc', 'sugar', 'lipid_profile'),
        allowNull: false,
        comment: 'Type of report: cbc=Complete Blood Count, sugar=Blood Sugar/HbA1c, lipid_profile=Lipid Profile',
      },
      report_date: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Date when the medical report was issued',
      },
      file_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'S3 URL or path to uploaded file',
      },
      file_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'pdf, jpg, png, etc.',
      },
      extracted_text: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'OCR extracted text from report',
      },
      ai_summary: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'AI-generated simple language summary',
      },
      ai_explanation: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Detailed AI explanation of medical terms',
      },
      status: {
        type: Sequelize.ENUM('processing', 'completed', 'failed'),
        defaultValue: 'processing',
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
      deletedAt: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('medical_reports', ['user_id']);
    await queryInterface.addIndex('medical_reports', ['report_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('medical_reports');
  },
};
