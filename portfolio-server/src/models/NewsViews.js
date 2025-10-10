'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	class NewsViews extends Model {
		static associate(models) {
			NewsViews.belongsTo(models.News, {
				foreignKey: 'news_id',
				as: 'news',
			})
			NewsViews.belongsTo(models.Student, {
				foreignKey: 'user_id',
				as: 'student',
				constraints: false,
			})
			NewsViews.belongsTo(models.Staff, {
				foreignKey: 'user_id',
				as: 'staff',
				constraints: false,
			})
			NewsViews.belongsTo(models.Admin, {
				foreignKey: 'user_id',
				as: 'admin',
				constraints: false,
			})
			NewsViews.belongsTo(models.Recruiter, {
				foreignKey: 'user_id',
				as: 'recruiter',
				constraints: false,
			})
		}
	}

	NewsViews.init(
		{
			id: {
				type: DataTypes.BIGINT,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			news_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			user_role: {
				type: DataTypes.ENUM('student', 'staff', 'admin', 'recruiter'),
				allowNull: false,
			},
			viewed_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			modelName: 'NewsViews',
			timestamps: false,
			indexes: [
				{
					unique: true,
					fields: ['user_id', 'news_id', 'user_role'],
				},
			],
		}
	)

	return NewsViews
}
