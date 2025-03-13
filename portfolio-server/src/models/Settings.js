'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Define any associations if needed
    }
  }

  Setting.init({
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Setting',
    tableName: 'Settings', // Optional: explicit table name
    timestamps: true, // Enable `createdAt` and `updatedAt`
  });

  return Setting;
};
