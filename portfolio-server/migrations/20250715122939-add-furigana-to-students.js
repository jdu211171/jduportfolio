'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Students', 'first_name_furigana', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Students', 'last_name_furigana', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Students', 'first_name_furigana');
    await queryInterface.removeColumn('Students', 'last_name_furigana');
  }
};