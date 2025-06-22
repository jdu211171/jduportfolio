'use strict';

const bcrypt = require('bcrypt');
const faker = require('faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const studentsData = [];

    for (let i = 0; i < 10; i++) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      // Example it_skills and skills data format
      const itSkills = {
        "上級": [
          { "name": "React", "color": "#039be5" },
          { "name": "Vue", "color": "#2e7d32" }
        ],
        "中級": [
          { "name": "MySQL", "color": "#00838f" }
        ],
        "初級": [
          { "name": "Redis", "color": "#d32f2f" }
        ]
      };

      const skills = {
        "上級": [
          { "name": "Public Speaking", "color": "#ff5722" }
        ],
        "中級": [
          { "name": "Project Management", "color": "#673ab7" }
        ],
        "初級": [
          { "name": "Graphic Design", "color": "#ff9800" }
        ]
      };

      const deliverables = [
        {
          title: "title1",
          link: "link1",
          codeLink: "link1",
          imageLink: "link1",
          description: "description1",
          role: ["role1", "role2"]
        },
        {
          title: "title1",
          link: "link2",
          codeLink: "link2",
          imageLink: "link2",
          description: "description2",
          role: ["role1", "role2"]
        }
      ];



      const jlptLevels = ["N1", "N2", "N3", "N4", "N5"];
      const jlpt = jlptLevels[Math.floor(Math.random() * jlptLevels.length)];

      let jlptString = {
        highest: jlpt,
        jlptlist: [
          { level: "n5", date: "2022-12" },
          { level: "n5", date: "2020-12" }
        ]
      }

      let ieltsString = {
        highest: (faker.datatype.number({ min: 12, max: 16 }) / 2).toString(),
        ieltslist: [
          { level: "6.5", date: "2022-12" },
          { level: "6.0", date: "2020-12" }
        ]
      }
      // Generate an array of image links for the gallery
      const gallery = Array.from({ length: 5 }, () => `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 101)}`);

      const gradYear = `202${faker.datatype.number({ min: 5, max: 8 })}年`;
      const gradSeason = faker.random.arrayElement(['春', '秋', null]);
      const langSkills = faker.random.arrayElement(['English (TOEIC 800), Korean (TOPIK 4)', 'German (B1)', null]);


      // studentsData.push({

      //   email: faker.internet.email(),
      //   password: hashedPassword,
      //   student_id: faker.datatype.number({ min: 10000000, max: 99999999 }).toString(),
      //   first_name: faker.name.firstName(),
      //   last_name: faker.name.lastName(),
      //   date_of_birth: faker.date.past(),
      //   photo: "https://randomuser.me/api/portraits/med/men/" + parseInt(Math.random() * 100) + ".jpg",
      //   self_introduction: faker.lorem.paragraph(),
      //   hobbies: faker.random.words(),
      //   gallery: JSON.stringify(gallery), // Store as JSON string in seed
      //   skills: JSON.stringify(skills), // Store as JSON string in seed
      //   it_skills: JSON.stringify(itSkills), // Store as JSON string in seed
      //   other_information: faker.lorem.paragraph(),
      //   semester: faker.datatype.number({ min: 1, max: 9 }).toString(),
      //   partner_university: faker.company.companyName(),
      //   partner_university_credits: faker.datatype.number({ min: 0, max: 124 }),
      //   deliverables: JSON.stringify(deliverables),
      //   jlpt: JSON.stringify(jlptString),
      //   ielts: JSON.stringify(ieltsString),
      //   jdu_japanese_certification: JSON.stringify(jlptString),
      //   japanese_speech_contest: faker.random.word(),
      //   it_contest: faker.random.word(),
      //   active: true,
      //   kintone_id: faker.datatype.number(),
      //   graduation_year: gradYear,
      //   graduation_season: gradSeason,
      //   language_skills: langSkills,
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // });
      studentsData.push({
          email: faker.internet.email(),
          password: hashedPassword,
          student_id: faker.datatype.number({ min: 10000000, max: 99999999 }).toString(),
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          date_of_birth: faker.date.past(20, '2005-01-01'), // 20 yoshgacha bo'lgan talabalar
          photo: "https://randomuser.me/api/portraits/med/men/" + parseInt(Math.random() * 100) + ".jpg",
          
          // YANGI QO'SHILGAN MAYDONLAR UCHUN MA'LUMOTLAR
          gender: faker.random.arrayElement(['Male', 'Female', 'Other']),
          address: faker.address.streetAddress(),
          phone: faker.phone.phoneNumber('##-###-##-##'),
          parents_phone_number: faker.phone.phoneNumber('##-###-##-##'),
          partner_university_enrollment_date: faker.date.past(2),

          // Kreditlar
          total_credits: faker.datatype.number({ min: 80, max: 124 }),
          partner_university_credits: faker.datatype.number({ min: 10, max: 30 }),
          world_language_university_credits: faker.datatype.number({ min: 10, max: 20 }),
          business_skills_credits: faker.datatype.number({ min: 5, max: 15 }),
          japanese_employment_credits: faker.datatype.number({ min: 5, max: 15 }),
          liberal_arts_education_credits: faker.datatype.number({ min: 10, max: 20 }),
          specialized_education_credits: faker.datatype.number({ min: 20, max: 40 }),

          // Mavjud maydonlar
          self_introduction: faker.lorem.paragraph(),
          hobbies: faker.random.words(),
          gallery: JSON.stringify(gallery),
          skills: JSON.stringify(skills),
          it_skills: JSON.stringify(itSkills),
          other_information: faker.lorem.paragraph(),
          semester: faker.datatype.number({ min: 1, max: 8 }).toString(), // "卒業" ni olib tashladim, chunki aktiv talabalar
          student_status: 'Active',
          partner_university: faker.company.companyName(),
          deliverables: JSON.stringify(deliverables),
          jlpt: JSON.stringify(jlptString),
          ielts: JSON.stringify(ieltsString),
          jdu_japanese_certification: JSON.stringify(jlptString),
          japanese_speech_contest: faker.random.word(),
          it_contest: faker.random.word(),
          active: true,
          visibility: faker.datatype.boolean(),
          has_pending: faker.datatype.boolean(),
          kintone_id: faker.datatype.number(),
          graduation_year: gradYear,
          graduation_season: gradSeason,
          language_skills: langSkills,
          createdAt: new Date(),
          updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert('Students', studentsData, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Students', null, {});
  }
};
