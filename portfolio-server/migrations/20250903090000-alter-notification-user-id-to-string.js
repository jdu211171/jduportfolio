"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Change Notifications.user_id from BIGINT to STRING
    await queryInterface.changeColumn("Notifications", "user_id", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to BIGINT
    await queryInterface.changeColumn("Notifications", "user_id", {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
  },
};

