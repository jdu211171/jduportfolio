'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	class UserFile extends Model {
		static associate(models) {}
	}
	UserFile.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			file_url: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			object_name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			original_filename: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			imageType: {
				// 'purpose' -> 'imageType'
				type: DataTypes.STRING,
				allowNull: false,
			},
			owner_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			owner_type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			file_size: {
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
		},
		{
			sequelize,
			modelName: 'UserFile',
		}
	)
	return UserFile
}
