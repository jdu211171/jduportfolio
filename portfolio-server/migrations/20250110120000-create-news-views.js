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

    // Add unique constraint (skip if it already exists)
    try {
      await queryInterface.addConstraint('NewsViews', {
        fields: ['user_id', 'news_id', 'user_role'],
        type: 'unique',
        name: 'unique_user_news_view'
      });
    } catch (e) {
      // ignore duplicate constraint creation
    }

    // Add foreign key constraint for news_id if News exists (handle out-of-order migrations)
    try {
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
    } catch (e) {
      // If the News table doesn't exist yet, we'll add the FK later in the News migration
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('NewsViews');
  }
};
