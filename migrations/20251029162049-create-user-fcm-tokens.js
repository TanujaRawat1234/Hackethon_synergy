'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_fcm_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      fcm_token: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Firebase Cloud Messaging token'
      },
      device_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Type of device (android, ios, web, etc.)'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.BIGINT
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_fcm_tokens');
  }
};
