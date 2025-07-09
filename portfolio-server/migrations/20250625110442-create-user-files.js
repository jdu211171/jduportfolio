'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserFiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      file_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      object_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      original_filename: {
        type: Sequelize.STRING,
        allowNull: true
      },
      imageType: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "masalan: 'profile_photo', 'gallery', 'resume'"
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      owner_type: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "'Student', 'Recruiter' kabi model nomlari"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserFiles');
  }
};