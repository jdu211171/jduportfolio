'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Draft extends Model {
        static associate(models) {
            Draft.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
            Draft.belongsTo(models.Staff, { foreignKey: 'reviewed_by', as: 'reviewer' });
            Draft.hasMany(models.ChangeLog, { foreignKey: 'draft_id', as: 'changeLogs' });
        }
    }

    Draft.init({
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        student_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Students',
                key: 'student_id',
            },
        },
        profile_data: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('draft', 'submitted', 'approved', 'disapproved', 'resubmission_required'),
            allowNull: false,
            defaultValue: 'draft',
        },
        submit_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        comments: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        reviewed_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'Staffs',
                key: 'id',
            },
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        sequelize,
        modelName: 'Draft',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Draft;
};