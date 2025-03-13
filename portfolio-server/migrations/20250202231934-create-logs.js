'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Logs', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      student_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Students',
          key: 'student_id',
        },
      },
      draft_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'Drafts',
          key: 'id',
        },
      },
      action: {
        type: Sequelize.ENUM('draft_submitted', 'approved', 'hidden', 'etc'),
        allowNull: false,
      },
      performed_by: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Staff',
          key: 'id',
        },
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      details: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Logs');
  }
};
