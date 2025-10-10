'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	class ItSkill extends Model {
		static associate(models) {
			// define association here
		}
	}
	ItSkill.init(
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					notEmpty: true,
				},
			},
			color: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: true,
				},
			},
		},
		{
			sequelize,
			modelName: 'ItSkill',
		}
	)
	return ItSkill
}
