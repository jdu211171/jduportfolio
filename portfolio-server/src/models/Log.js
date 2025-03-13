'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Log extends Model {
        static associate(models) {
            Log.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
            Log.belongsTo(models.Draft, { foreignKey: 'draft_id', as: 'draft' });
            Log.belongsTo(models.Staff, { foreignKey: 'performed_by', as: 'performer' });
        }
    }

    Log.init({
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        student_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Students',
                key: 'student_id',
            },
        },
        draft_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'Drafts',
                key: 'id',
            },
        },
        action: {
            type: DataTypes.ENUM('draft_submitted', 'approved', 'hidden', 'etc'),
            allowNull: false,
        },
        performed_by: {
            type: DataTypes.BIGINT,
            allowNull: false,
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
        details: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Log',
        timestamps: false,
    });

    return Log;
};
