'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('NewsViews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      news_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      user_role: {
        type: Sequelize.ENUM('student', 'staff', 'admin', 'recruiter'),
        allowNull: false,
      },
      viewed_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });

    // Add unique constraint
    await queryInterface.addConstraint('NewsViews', {
      fields: ['user_id', 'news_id', 'user_role'],
      type: 'unique',
      name: 'unique_user_news_view'
    });

    // Add foreign key constraint for news_id
    await queryInterface.addConstraint('NewsViews', {
      fields: ['news_id'],
      type: 'foreign key',
      name: 'fk_newsviews_news_id',
      references: {
        table: 'News',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('NewsViews');
  }
};