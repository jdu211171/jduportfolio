const { Notification } = require('../models');

class NotificationService {
  static async create(data) {
    return Notification.create(data);
  }

  // static async getById(id) {
  //   return Notification.findByPk(id);
  // }

  static async getByUserId(user_id, filter = {}) {
    return Notification.findAll({
      where: { user_id, ...filter },
      order: [['createdAt', 'DESC']]  
    });
  }

  static async update(id, data) {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification.update(data);
  }

  static async delete(id) {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification.destroy();
  }

  static async getAll() {
    return Notification.findAll();
  }

  static async markOneAsRead(notificationId, user_id) {
    const notification = await Notification.findOne({
        where: { id: notificationId, user_id, status: "unread" }
    });

    if (!notification) return null;

    await notification.update({ status: "read" });

    return notification;
  }


}

module.exports = NotificationService;
