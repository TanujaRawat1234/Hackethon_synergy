'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {

  class User extends Model {}
  User.init({
    id: {
    type: DataTypes.UUID,
    primaryKey: true,
   defaultValue: () => uuidv4()
    },
    first_name: {
    type: DataTypes.STRING(150),
    allowNull: false
    },
    last_name: DataTypes.STRING(150),
    email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
    isEmail: true
    }
    },
    mobile: DataTypes.STRING(32),
    gender: DataTypes.ENUM('male','female','other'),
    password: {
    type: DataTypes.STRING,
    allowNull: false
    },
    otp: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Stores the OTP sent for password reset',
    },
    otp_expires: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Unix timestamp (ms) when OTP expires',
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
   
  }, {
   

    sequelize,
    modelName: 'User',
    tableName: 'users', 
    paranoid: true,
    hooks : {
      beforeCreate : (record, options) => {
        record.dataValues.createdAt = moment().valueOf();
        record.dataValues.updatedAt = moment().valueOf();
      },
      beforeUpdate : (record, options) => {
        record.dataValues.updatedAt = moment().valueOf();
      }
    }
  });
  return User;
};