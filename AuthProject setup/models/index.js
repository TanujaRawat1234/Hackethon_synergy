'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const logger = require('../utills/logger');
const process = require('process');
const { production, development } = require('../config/config');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || development;
const config = require('../config/config')[env];
//const config = require(__dirname + '../')[env];
// const models = require('./user');
//const User = models.User
console.log('dfdsfsdf',config.use_env_variable);
const db = {};


let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

sequelize.authenticate().then(function (err) {
  logger.info('Connection has been established successfully.');
}).catch(function (err) {
  logger.info('Unable to connect to the database:', err.message);
});

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.sequelize.sync({alter: true});

module.exports = db;
