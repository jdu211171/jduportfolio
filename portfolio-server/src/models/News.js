'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    static associate(models) {
    }
  }
  News.init({
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    image_url: { type: DataTypes.STRING(2048), allowNull: false },
    source_link: { type: DataTypes.STRING(2048), allowNull: true },
    hashtags: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
    type: { type: DataTypes.ENUM('university', 'company'), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), allowNull: false, defaultValue: 'pending' },
    rejection_reason: { type: DataTypes.TEXT, allowNull: true },
    authorId: { type: DataTypes.INTEGER, allowNull: false },
    authorType: { type: DataTypes.STRING, allowNull: false },
    moderatorId: { type: DataTypes.INTEGER, allowNull: true },
    moderatorType: { type: DataTypes.STRING, allowNull: true }
  }, {
    sequelize,
    modelName: 'News',
  });
  return News;
};
