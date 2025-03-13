const QAService = require('../services/qaService');

class QAController {
  // Controller method to create a new QA entry
  static async createQA(req, res, next) {
    try {
      const { data, studentId } = req.body;
      if (typeof data !== 'object' || data === null) {
        return res.status(400).json({ error: 'Invalid data format' });
      }
      let response = {}
      for (const [category, questions] of Object.entries(data)) {
        const qaData = {
          category,
          qa_list: questions,
          studentId
        };

        // Create QA entries for the current category
        let a = await QAService.createQA(qaData);
        response[a.category] = a.qa_list
      }
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Controller method to retrieve all QA entries
  static async getAllQA(req, res, next) {
    try {
      const qaList = await QAService.getAllQA();
      res.json(qaList);
    } catch (error) {
      next(error);
    }
  }

  // Controller method to retrieve a QA entry by ID
  static async getQAById(req, res, next) {
    try {
      const { id } = req.params;
      const qa = await QAService.getQAById(id);
      res.json(qa);
    } catch (error) {
      next(error);
    }
  }

  // Controller method to update a QA entry
  static async updateQA(req, res, next) {
    try {
      const { data } = req.body;
      let response = {}
      Object.entries(data.idList).forEach(async ([key, category]) => {
        const updatedQA = await QAService.updateQA(key, data[category]);
        response[updatedQA.category] = updatedQA.qa_list
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Controller method to delete a QA entry
  static async deleteQA(req, res, next) {
    try {
      const { id } = req.params;
      await QAService.deleteQA(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  // Controller method to find QA entries by category
  static async findQAByCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const qaList = await QAService.findQAByCategory(categoryId);
      res.json(qaList);
    } catch (error) {
      next(error);
    }
  }

  // Controller method to find QA entries by studentId
  static async findQAByStudentId(req, res, next) {
    try {
      const { studentId } = req.params;
      const qaList = await QAService.findQAByStudentId(studentId);
      let response = {}
      let idList = {}
      qaList.forEach((data) => {
        response[data.category] = data.qa_list
        let a = {}
        a[data.id] = data.category
        idList[data.id] = data.category
      })

      response.idList = idList

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Controller method to count QA entries
  static async countQA(req, res, next) {
    try {
      const count = await QAService.countQA();
      res.json({ count });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = QAController;
