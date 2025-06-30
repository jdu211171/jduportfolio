'use strict';
const bcrypt = require('bcrypt');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Student extends Model {
        static associate(models) {
            Student.hasMany(models.Bookmark, { foreignKey: 'studentId', as: 'bookmarks' });
            Student.hasOne(models.Draft, { foreignKey: 'student_id', sourceKey: 'student_id', as: 'draft' });
            Student.hasMany(models.QA, { foreignKey: 'studentId', as: 'qas' });
        }
    }

    Student.init({
        email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
        password: { type: DataTypes.STRING, allowNull: false },
        student_id: { type: DataTypes.STRING, allowNull: false, unique: true },
        first_name: { type: DataTypes.STRING, allowNull: false },
        last_name: { type: DataTypes.STRING, allowNull: false },
        date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
        phone: { type: DataTypes.STRING, allowNull: true },
        photo: { type: DataTypes.STRING, allowNull: true },
        gender: { type: DataTypes.STRING, allowNull: true },
        address: { type: DataTypes.TEXT, allowNull: true },
        parents_phone_number: { type: DataTypes.STRING, allowNull: true },
        enrollment_date: { type: DataTypes.DATEONLY, allowNull: true }, // Kintone'dagi "jduDate"
        partner_university_enrollment_date: { type: DataTypes.DATEONLY, allowNull: true },
        semester: { type: DataTypes.ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '卒業'), defaultValue: '1' },
        partner_university: { type: DataTypes.STRING, allowNull: true },
        student_status: { type: DataTypes.STRING, allowNull: true },
        partner_university_credits: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        world_language_university_credits: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        business_skills_credits: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        japanese_employment_credits: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        liberal_arts_education_credits: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        total_credits: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        specialized_education_credits: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        self_introduction: { type: DataTypes.TEXT, allowNull: true },
        hobbies: { type: DataTypes.STRING, allowNull: true },
        gallery: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
        skills: { type: DataTypes.JSONB, allowNull: true },
        it_skills: { type: DataTypes.JSONB, allowNull: true },
        other_information: { type: DataTypes.TEXT, allowNull: true },
        deliverables: { type: DataTypes.JSONB, allowNull: true },
        jlpt: { type: DataTypes.TEXT, allowNull: true },
        ielts: { type: DataTypes.TEXT, allowNull: true },
        jdu_japanese_certification: { type: DataTypes.TEXT, allowNull: true },
        japanese_speech_contest: { type: DataTypes.TEXT, allowNull: true },
        it_contest: { type: DataTypes.TEXT, allowNull: true },
        graduation_year: { type: DataTypes.TEXT, allowNull: true },
        graduation_season: { type: DataTypes.TEXT, allowNull: true },
        language_skills: { type: DataTypes.TEXT, allowNull: true },
        active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
        visibility: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        has_pending: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        kintone_id: { type: DataTypes.INTEGER, allowNull: false },
    }, {
        sequelize,
        modelName: 'Student',
        hooks: {
            beforeCreate: async (student) => {
                if (student.password) {
                    const salt = await bcrypt.genSalt(10);
                    student.password = await bcrypt.hash(student.password, salt);
                }
            },
            beforeUpdate: async (student) => {
                if (student.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    student.password = await bcrypt.hash(student.password, salt);
                }
            },
        },
    });
    return Student;
};