const LogService = require('../services/logService');

class LogController {
  static async createLog(req, res) {
    try {
      const log = await LogService.create(req.body);
      return res.status(201).json(log);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getLogById(req, res) {
    try {
      const { id } = req.params;
      const log = await LogService.getById(id);
      if (!log) {
        return res.status(404).json({ error: 'Log not found' });
      }
      return res.status(200).json(log);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateLog(req, res) {
    try {
      const { id } = req.params;
      const log = await LogService.update(id, req.body);
      return res.status(200).json(log);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async deleteLog(req, res) {
    try {
      const { id } = req.params;
      const log = await LogService.delete(id);
      return res.status(200).json({ message: 'Log deleted successfully', log });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getAllLogs(req, res) {
    try {
      const logs = await LogService.getAll();
      return res.status(200).json(logs);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = LogController;
