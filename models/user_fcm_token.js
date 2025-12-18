'use strict';
const { Model } = require('sequelize');
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  class UserFcmToken extends Model {
    // static associate(models) {
    //   UserFcmToken.belongsTo(models.User, {
    //     foreignKey: 'user_id',
    //     as: 'user'
    //   });
    // }
  }

  UserFcmToken.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      fcm_token: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      device_type: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      createdAt: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      deletedAt: {
        type: DataTypes.BIGINT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'UserFcmToken',
      tableName: 'user_fcm_tokens',
      timestamps: false,
      paranoid: true,
      hooks: {
        beforeCreate: (record) => {
          const now = moment().valueOf();
          record.dataValues.createdAt = now;
          record.dataValues.updatedAt = now;
        },
        beforeUpdate: (record) => {
          record.dataValues.updatedAt = moment().valueOf();
        }
      }
    }
  );

  return UserFcmToken;
};
