const { Log } = require('../models');

class LogService {
  static async create(data) {
    return Log.create(data);
  }

  static async getById(id) {
    return Log.findByPk(id);
  }

  static async update(id, data) {
    const log = await Log.findByPk(id);
    if (!log) {
      throw new Error('Log not found');
    }
    return log.update(data);
  }

  static async delete(id) {
    const log = await Log.findByPk(id);
    if (!log) {
      throw new Error('Log not found');
    }
    return log.destroy();
  }

  static async getAll() {
    return Log.findAll();
  }
}

module.exports = LogService;
