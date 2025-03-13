'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Students', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      student_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date_of_birth: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      photo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      self_introduction: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      hobbies: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gallery: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      skills: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          "上級": [
          ],
          "中級": [
          ],
          "初級": [
          ]
        }
      },
      it_skills: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          "上級": [
          ],
          "中級": [
          ],
          "初級": [
          ]
        }
      },
      other_information: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      semester: {
        type: Sequelize.ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', "卒業"),
        defaultValue: '1', // Note that the default value should be a string to match ENUM options
      },
      partner_university: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      partner_university_credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      deliverables: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [{
          title: "",
          link: "",
          role: [],
          codeLink: "",
          imageLink: "",
          description: "",
        }]
      },
      jlpt: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ielts: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      jdu_japanese_certification: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      japanese_speech_contest: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      it_contest: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      kintone_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Students');
  }
};
