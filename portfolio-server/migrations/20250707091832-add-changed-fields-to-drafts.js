'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // "previous_profile_data" ustunini olib tashlaymiz (agar mavjud bo'lsa)
    // Agar bu ustunni qo'shmagan bo'lsangiz, bu qatorni o'chirib tashlang
    await queryInterface.removeColumn('Drafts', 'previous_profile_data').catch(() => {
        console.log('Column previous_profile_data does not exist, skipping removal.');
    });

    // Yangi ustunni qo'shamiz
    await queryInterface.addColumn('Drafts', 'changed_fields', {
      type: Sequelize.JSONB, // Massiv (array) saqlash uchun JSONB qulay
      allowNull: true,
      defaultValue: [], // Standart qiymati bo'sh massiv
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Drafts', 'changed_fields');
    // Agar kerak bo'lsa, oldingi ustunni qayta tiklashingiz mumkin
    // await queryInterface.addColumn('Drafts', 'previous_profile_data', {
    //   type: Sequelize.JSONB,
    //   allowNull: true,
    // });
  }
};