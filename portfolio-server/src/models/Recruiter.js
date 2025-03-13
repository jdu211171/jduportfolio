'use strict';
const bcrypt = require('bcrypt');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Recruiter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  Recruiter.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gallery: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    kintone_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Recruiter',
    tableName: 'Recruiters', // Ensure your table name is plural if that is your convention
    timestamps: true, // Automatically add createdAt and updatedAt
    hooks: {
      beforeCreate: async (recruiter) => {
        if (recruiter.password) {
          const salt = await bcrypt.genSalt(10);
          recruiter.password = await bcrypt.hash(recruiter.password, salt);
        }
      },
      beforeUpdate: async (recruiter) => {
        if (recruiter.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          recruiter.password = await bcrypt.hash(recruiter.password, salt);
        }
      },
    },
  });

  return Recruiter;
};
