'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
     
     
    }
  }
  User.init({
    first_name: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    last_name: {
        type: DataTypes.STRING,
        defaultValue: ''
      },
    email: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    password:{
      type: DataTypes.STRING,
      defaultValue: ''
    },
 
 
    createdAt: {
      type: DataTypes.BIGINT,

      allowNull: false
    },
    updatedAt: {
      type: DataTypes.BIGINT,
     
      allowNull: false
    },
    
   
  }, {
   

    sequelize,
    modelName: 'User',
    hooks : {
      beforeCreate : (record, options) => {
        console.log('32132323232');
        record.dataValues.createdAt = moment().valueOf();
        record.dataValues.updatedAt = moment().valueOf();
      },
      beforeUpdate : (record, options) => {
        console.log('gfhg');
        record.dataValues.updatedAt = moment().valueOf();
      }
    }
  });
  return User;
};