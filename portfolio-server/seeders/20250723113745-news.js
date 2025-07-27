'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('News', [
      {
        title: 'Yangi universitet tadbiri eʼlon qilindi',
        description: 'Talabalar uchun yangi IT bootcamp tashkil etiladi.',
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1xkViOGdpNFTokxHSmSjXr16J50ZGzutwtQ&s',
        source_link: 'https://university.example.com/bootcamp',
        hashtags: JSON.stringify(['#IT', '#bootcamp', '#talabalar']),
        type: 'university',
        status: 'approved',
        rejection_reason: null,
        authorId: 1,
        authorType: 'Admin',
        moderatorId: 2,
        moderatorType: 'Moderator',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Yangi ish o‘rinlari eʼlon qilindi',
        description: 'Mahalliy kompaniya 5 ta yangi lavozim uchun vakansiya ochdi.',
        image_url: 'https://img.freepik.com/free-photo/mid-adult-businessman-having-meeting-with-colleagues-board-room_637285-1022.jpg?semt=ais_hybrid&w=740',
        source_link: 'https://company.example.com/jobs',
        hashtags: JSON.stringify(['#ish', '#vakansiya', '#developer']),
        type: 'company',
        status: 'pending',
        rejection_reason: null,
        authorId: 3,
        authorType: 'Company',
        moderatorId: null,
        moderatorType: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('News', null, {});
  }
};
