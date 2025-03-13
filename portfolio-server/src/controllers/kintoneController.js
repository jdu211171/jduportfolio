const KintoneService = require('../services/kintoneService');
const { KINTONE_APP_ID_STUDENTS } = process.env; // assuming you have this environment variable for the students app ID

class KintoneController {
  // Controller method to retrieve all students
  static async getAll(req, res, next) {
    try {
      const students = await KintoneService.getAllRecords("students"); //here it can get any app name set in /config/kintoneConfig.js
      res.status(200).json(students);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching students', error: error });
    }
  }

  static async getBy(req, res, next) {
    try {
      const { table, col, val } = req.body;
      const students = await KintoneService.getRecordBy(table, col, val); //here it can get any app name set in /config/kintoneConfig.js
      res.status(200).json(students);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching students', error: error });
    }
  }

  // Controller method to create a new student
  static async create(req, res) {
    try {
      const newStudent = await KintoneService.createRecord(KINTONE_APP_ID_STUDENTS, req.body);
      res.status(201).json(newStudent);
    } catch (error) {
      res.status(500).json({ message: 'Error creating student', error: error.message });
    }
  }

  // Controller method to update a student
  static async update(req, res) {
    try {
      const updatedStudent = await KintoneService.updateRecord(KINTONE_APP_ID_STUDENTS, req.params.id, req.body);
      res.status(200).json(updatedStudent);
    } catch (error) {
      res.status(500).json({ message: 'Error updating student', error: error.message });
    }
  }

  // Controller method to delete a student
  static async delete(req, res) {
    try {
      await KintoneService.deleteRecord(KINTONE_APP_ID_STUDENTS, req.params.id);
      res.status(204).json();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting student', error: error.message });
    }
  }

  static async sync(req, res) {
    try {
      await KintoneService.syncData();
      res.status(204).json();
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
}

module.exports = KintoneController;
