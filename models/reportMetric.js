'use strict';
const { Model } = require('sequelize');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class ReportMetric extends Model {
    static associate(models) {
      ReportMetric.belongsTo(models.MedicalReport, {
        foreignKey: 'report_id',
        as: 'report',
      });
    }
  }

  ReportMetric.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      report_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      metric_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      metric_value: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      metric_unit: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      normal_range: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('normal', 'low', 'high', 'critical'),
        allowNull: true,
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
    },
    {
      sequelize,
      modelName: 'ReportMetric',
      tableName: 'report_metrics',
      timestamps: true,
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

  return ReportMetric;
};
