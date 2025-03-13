'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QA extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association with Student model
      QA.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
    }
  }

  QA.init({
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qa_list: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Students', // Assuming the Student model is named 'Students'
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'QA',
  });

  return QA;
};
