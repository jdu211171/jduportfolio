const bcrypt = require('bcrypt')
const AdminService = require('../services/adminService')
const SettingsService = require('../services/settingService')
const { Student } = require('../models');

class AdminController {
	static async create(req, res) {
		try {
			const admin = await AdminService.createAdmin(req.body)
			res.status(201).json(admin)
		} catch (error) {
			res.status(400).json({ error: error.message })
		}
	}

	static async getById(req, res) {
		try {
			const response = await AdminService.getAdminById(req.params.id)
			if (!response) {
				return res.status(404).json({ error: 'Admin not found' })
			}

			// Fetch settings for the admin
			const settingsKeys = [
				'contactEmail',
				'contactPhone',
				'workingHours',
				'location',
			]
			const settingsPromises = settingsKeys.map(key =>
				SettingsService.getSetting(key)
			)

			// Resolve all settings in parallel
			const settingsValues = await Promise.all(settingsPromises)

			// Create a settings object to send along with admin data
			settingsKeys.reduce((acc, key, index) => {
				response.dataValues[key] = settingsValues[index]
				return acc
			}, {})

			res.status(200).json(response)
		} catch (error) {
			res.status(400).json({ error: error.message })
		}
	}

  static async getStudentPassword(req, res) {
    try {
      const { studentId } = req.params;
      if (!(req.user.role === 'Admin' || req.user.userType === 'Admin')) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Студент не найден' });
      }
      res.status(200).json({ password: student.password });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }	
    // reset password new metod

	static async resetStudentPassword(req, res) {
		try {
		  const { studentId } = req.params;
		  const { newPassword } = req.body;
	  
		  if (!newPassword) {
			return res.status(400).json({ error: 'Требуется новый пароль' });
		  }
	  
		  const student = await Student.findByPk(studentId);
		  if (!student) {
			return res.status(404).json({ error: 'Студент не найден' });
		  }
	  
		  // Пароль будет хешироваться автоматически хуком в модели Student
		  student.password = newPassword;
		  await student.save();
	  
		  res.status(200).json({ message: 'Пароль успешно изменён' });
		} catch (error) {
		  res.status(500).json({ error: error.message });
		}
	  }
	

	static async update(req, res) {
		try {
			const {
				currentPassword,
				password,
				contactEmail,
				contactPhone,
				workingHours,
				location,
				...updateData
			} = req.body
			if (password) {
				const admin = await AdminService.getAdminById(req.params.id)
				if (
					!admin ||
					!(await bcrypt.compare(currentPassword, admin.password))
				) {
					return res
						.status(400)
						.json({ error: '現在のパスワードを入力してください' })
				}
			}
			let response = await AdminService.updateAdmin(req.params.id, {
				...updateData,
				password: password || undefined, // Обновляем пароль только если он предоставлен
			})

			// Update Settings
			const settingsUpdates = [
				{ key: 'contactEmail', value: contactEmail },
				{ key: 'contactPhone', value: contactPhone },
				{ key: 'workingHours', value: workingHours },
				{ key: 'location', value: location },
			]

			for (const { key, value } of settingsUpdates) {
				const { setting } = await SettingsService.updateSetting(key, value)
				response.dataValues[key] = setting.dataValues.value
			}

			res.status(200).json(response)
		} catch (error) {
			res.status(400).json({ error: error.message })
		}
	}

	static async delete(req, res) {
		try {
			await AdminService.deleteAdmin(req.params.id)
			res.status(204).send()
		} catch (error) {
			res.status(400).json({ error: error.message })
		}
	}
}

module.exports = AdminController
