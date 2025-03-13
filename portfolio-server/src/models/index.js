// src/models/index.js

const { Sequelize } = require('sequelize');
const config = require('../config/config'); // Adjust the path as needed
const Log = require('./Log');

const env = process.env.NODE_ENV || 'development';

let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config[config.use_env_variable]);
} else {
  sequelize = new Sequelize(config[env].database, config[env].username, config[env].password, {
    ...config[env],
  });
}

const db = {};

// Load models
db.Admin = require('./Admin')(sequelize, Sequelize);
db.Recruiter = require('./Recruiter')(sequelize, Sequelize);
db.Staff = require('./Staff')(sequelize, Sequelize);
db.Student = require('./Student')(sequelize, Sequelize);
db.Bookmark = require('./Bookmark')(sequelize, Sequelize);
db.QA = require('./QA')(sequelize, Sequelize);
db.Setting = require('./Settings')(sequelize, Sequelize);
db.Draft = require('./Draft')(sequelize, Sequelize);
db.Log = require('./Log')(sequelize, Sequelize);
db.Notification = require('./Notification')(sequelize, Sequelize);

// Load other models here if needed
// db.User = require('./User')(sequelize, Sequelize);

// Apply associations here if needed
// Example:
db.Recruiter.hasMany(db.Bookmark, { foreignKey: 'recruiterId', as: 'bookmarks' });
db.Student.hasMany(db.Bookmark, { foreignKey: 'studentId', as: 'bookmarks' });
db.Student.hasMany(db.Draft, {
  foreignKey: "student_id",  // Tells Sequelize Drafts should refer to Student.student_id
  sourceKey: "student_id",   // Explicitly set source key on Student table
  as: "drafts",
});

db.Bookmark.belongsTo(db.Recruiter, { foreignKey: 'recruiterId', as: 'recruiter' });
db.Bookmark.belongsTo(db.Student, { foreignKey: 'studentId', as: 'student' });
db.Draft.belongsTo(db.Student, {
  foreignKey: "student_id",  // This tells Drafts how to reference Student
  targetKey: "student_id",   // Ensures it joins using Student.student_id, not Student.id
  as: "student",
});

module.exports = {
  sequelize,
  Sequelize,
  Admin: db.Admin,
  Recruiter: db.Recruiter,
  Staff: db.Staff,
  Student: db.Student,
  Bookmark: db.Bookmark,
  QA: db.QA,
  Setting: db.Setting,
  Draft: db.Draft,
  Log: db.Log,
  Notification: db.Notification,
};
