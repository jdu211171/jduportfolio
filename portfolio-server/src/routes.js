
const authMiddleware = require('./middlewares/auth-middleware');

const authRoute = require('./routes/auth-route');

const adminRoute = require('./routes/admins-route');
const recruiterRoute = require('./routes/recruiters-route');
const staffRoute = require('./routes/staff-route');
const studentRoute = require('./routes/students-route');
const bookmarkRoute = require('./routes/bookmarks-route');
const qaRoute = require('./routes/qa-route');
const settingRoute = require('./routes/settings-route');
const draftRoute = require('./routes/drafts-route');
const logRoute = require('./routes/log-route');
const notificationRoute = require('./routes/notification-route');

const fileRoutes = require('./routes/file-routes');
const kintoneRoutes = require('./routes/kintone-routes');
const webhookRoutes = require('./routes/webhook-routes');

const configureRoutes = (app) => {
  // Auth routes
  app.use('/api/auth', authRoute);

  // Protected routes
  app.use('/api/admin', adminRoute);
  app.use('/api/recruiters', authMiddleware, recruiterRoute);
  app.use('/api/staff', authMiddleware, staffRoute);
  app.use('/api/students', authMiddleware, studentRoute);
  app.use('/api/bookmarks', authMiddleware, bookmarkRoute);
  app.use('/api/qa', authMiddleware, qaRoute);
  app.use('/api/files', fileRoutes);
  app.use('/api/kintone', kintoneRoutes);
  app.use('/api/webhook', webhookRoutes);
  app.use('/api/settings', settingRoute);
  app.use('/api/draft', authMiddleware, draftRoute);
  app.use('/api/log', logRoute);
  app.use('/api/notification', authMiddleware, notificationRoute);
};

module.exports = configureRoutes;