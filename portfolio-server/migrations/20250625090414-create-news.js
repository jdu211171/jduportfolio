// migrations/{timestamp}-create-news.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('News', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      image_url: {
        type: Sequelize.STRING(2048),
        allowNull: false
      },
      source_link: {
        type: Sequelize.STRING(2048),
        allowNull: true
      },
      hashtags: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('university', 'company'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Polimorfik muallif uchun ustunlar
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      authorType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // Polimorfik moderator uchun ustunlar
      moderatorId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      moderatorType: {
        type: Sequelize.STRING,
        allowNull: true
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
    // Ensure NewsViews FK exists if NewsViews table was created earlier
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF to_regclass('"NewsViews"') IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_newsviews_news_id'
        ) THEN
          ALTER TABLE "NewsViews"
            ADD CONSTRAINT fk_newsviews_news_id
            FOREIGN KEY ("news_id") REFERENCES "News"(id)
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END$$;
    `);
  },
  down: async (queryInterface, Sequelize) => {
    // Drop with CASCADE to remove dependent FKs (e.g., from NewsViews)
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "News" CASCADE;');
  }
};
