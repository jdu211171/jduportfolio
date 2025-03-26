'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Image extends Model {
        static associate(models) {
            // Assotsiatsiyalar (boshqa modellar bilan aloqalar) shu yerda aniqlanadi
        }
    }
    Image.init({
        imageUrl: {
            type: DataTypes.STRING(2048),
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Image',
        tableName: 'Images', // Ma'lumotlar bazasidagi jadval nomi
        timestamps: true,   // `createdAt` va `updatedAt` ustunlarini avtomatik yaratish
    });
    return Image;
};