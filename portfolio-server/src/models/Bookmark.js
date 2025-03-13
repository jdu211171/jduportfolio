'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Bookmark extends Model {
    static associate(models) {
      // Define association with Recruiter model
      Bookmark.belongsTo(models.Recruiter, { foreignKey: 'recruiterId', as: 'recruiter' });

      // Define association with Student model
      Bookmark.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
    }
  }

  Bookmark.init({
    recruiterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Recruiters',
        key: 'id'
      }
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Students',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Bookmark',
  });

  return Bookmark;
};
