'use strict';
const { Model } = require('sequelize');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class MedicalReport extends Model {
    static associate(models) {
      MedicalReport.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      MedicalReport.hasMany(models.ReportMetric, {
        foreignKey: 'report_id',
        as: 'metrics',
      });
    }
  }

  MedicalReport.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      report_type: {
        type: DataTypes.ENUM('cbc', 'sugar', 'lipid_profile'),
        allowNull: false,
        comment: 'cbc=Complete Blood Count, sugar=Blood Sugar/HbA1c, lipid_profile=Lipid Profile',
      },
      report_date: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      file_url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      file_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      extracted_text: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
      ai_summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ai_explanation: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('processing', 'completed', 'failed'),
        defaultValue: 'processing',
      },
      createdAt: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now(),
      },
      updatedAt: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now(),
      },
      deletedAt: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'MedicalReport',
      tableName: 'medical_reports',
      paranoid: true,
      hooks: {
        beforeCreate: (record) => {
          record.dataValues.createdAt = moment().valueOf();
          record.dataValues.updatedAt = moment().valueOf();
        },
        beforeUpdate: (record) => {
          record.dataValues.updatedAt = moment().valueOf();
        },
      },
    }
  );

  return MedicalReport;
};
