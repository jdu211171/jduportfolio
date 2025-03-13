const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const RecruiterService = require('../services/recruiterService');

const { EmailToStaff } = require('../utils/emailToStaff');
const generatePassword = require('generate-password');
class RecruiterController {

  static async webhookHandler(req, res) {
    try {
      const { type, record, recordId } = req.body;
      if (type == "ADD_RECORD") {
        const password = generatePassword.generate({
          length: 12,
          numbers: true,
          symbols: false,
          uppercase: true,
          excludeSimilarCharacters: true
        });

        const data = {
          email: record.recruiterEmail.value,
          password: password, // This will be hashed by the beforeCreate hook
          first_name: record.recruiterFirstName.value,
          last_name: record.recruiterLastName.value,
          company_name: record.recruiterCompany.value,
          phone: record.recruiterPhone.value,
          active: false,
          kintone_id: record['$id'].value
        };

        const newRecruiter = await RecruiterService.createRecruiter(data);
        let email
        if (newRecruiter) {
          email = await EmailToStaff(newRecruiter.email, password, newRecruiter.first_name, newRecruiter.last_name);
        }
        res.status(201).json(email);
      } else {
        const recruiterId = recordId;
        await RecruiterService.deleteRecruiter(recruiterId);
        res.status(204).end();
      }
    } catch (error) {
      console.error('Error in webhook handler:', error);  // Log any errors
      res.status(400).json({ error: error.message });
    }
  }


  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const newRecruiter = await RecruiterService.createRecruiter(req.body);
      res.status(201).json(newRecruiter);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      let filter
      if (req.query.filter) {
        filter = req.query.filter
      } else {
        filter = {}
      }

      const recruiters = await RecruiterService.getAllRecruiters(filter);
      res.status(200).json(recruiters);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const recruiter = await RecruiterService.getRecruiterById(req.params.id);
      res.status(200).json(recruiter);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const recruiterData = req.body;
      const { currentPassword, password, ...updateData } = req.body;

      if (password) {
        const recruiter = await RecruiterService.getRecruiterById(id, true);
        if (!recruiter || !(await bcrypt.compare(currentPassword, recruiter.password))) {
          return res.status(400).json({ error: '現在のパスワードを入力してください' });
        }
      }

      const updatedRecruiter = await RecruiterService.updateRecruiter(id, {
        ...updateData,
        password: password || undefined,
      });
      res.status(200).json(updatedRecruiter);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await RecruiterService.deleteRecruiter(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RecruiterController;
