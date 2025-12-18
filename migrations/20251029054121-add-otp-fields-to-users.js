'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'otp', {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'Stores the OTP sent for password reset'
    });

    await queryInterface.addColumn('users', 'otp_expires', {
      type: Sequelize.BIGINT,
      allowNull: true,
      comment: 'Unix timestamp (ms) when OTP expires'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'otp');
    await queryInterface.removeColumn('users', 'otp_expires');
  }
};
