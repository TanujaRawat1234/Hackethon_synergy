'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: uuidv4, // ✅ works with MySQL
      },
      first_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      mobile: {
        type: Sequelize.STRING(32),
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.BIGINT,
        defaultValue: Date.now(), // ✅ store as timestamp (BIGINT)
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.BIGINT,
        defaultValue: Date.now(), // ✅ store as timestamp (BIGINT)
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.BIGINT,
      },
    });

    // Add an index on email for quick lookup
    await queryInterface.addIndex('Users', ['email']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS `enum_Users_gender`');
  },
};
