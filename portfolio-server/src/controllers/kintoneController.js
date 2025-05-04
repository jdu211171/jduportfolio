// const KintoneService = require('../services/kintoneService')
// const { KINTONE_APP_ID_STUDENTS } = process.env // assuming you have this environment variable for the students app ID

// const appIdToName = Object.keys(kintoneConfig).reduce((acc, key) => {
// 	acc[kintoneConfig[key].appId] = key
// 	return acc
//    }, {})

// class KintoneController {
// 	// Controller method to retrieve all students
// 	static async getAll(req, res, next) {
// 		try {
// 			const students = await KintoneService.getAllRecords('students') //here it can get any app name set in /config/kintoneConfig.js
// 			res.status(200).json(students)
// 		} catch (error) {
// 			res.status(500).json({ message: 'Error fetching students', error: error })
// 		}
// 	}

// 	static async getBy(req, res, next) {
// 		try {
// 			const { table, col, val } = req.body
// 			const students = await KintoneService.getRecordBy(table, col, val) //here it can get any app name set in /config/kintoneConfig.js
// 			res.status(200).json(students)
// 		} catch (error) {
// 			res.status(500).json({ message: 'Error fetching students', error: error })
// 		}
// 	}

// 	// Controller method to create a new student
// 	// static async create(req, res) {
// 	// 	try {
// 	// 		const newStudent = await KintoneService.createRecord(
// 	// 			KINTONE_APP_ID_STUDENTS,
// 	// 			req.body
// 	// 		)
// 	// 		res.status(201).json(newStudent)
// 	// 	} catch (error) {
// 	// 		res
// 	// 			.status(500)
// 	// 			.json({ message: 'Error creating student', error: error.message })
// 	// 	}
// 	// }
// 	static async create(req, res) {
// 		try {
// 		 const appId = req.query.app // "105" keladi
// 		 const appName = appIdToName[appId] // "105" → "students"
// 		 if (!appName) {
// 		  throw new Error(`No app name found for appId: ${appId}`)
// 		 }
// 		 const data = req.body
// 		 console.log(`App Name: ${appName}, Data:`, data) // Debugging uchun
// 		 const result = await KintoneService.createRecord(appName, data)
// 		 res.status(201).json(result)
// 		} catch (error) {
// 		 res
// 		  .status(500)
// 		  .json({ message: 'Error creating record', error: error.message })
// 		}
// 	   }

// 	// Controller method to update a student
// 	static async update(req, res) {
// 		try {
// 			const updatedStudent = await KintoneService.updateRecord(
// 				KINTONE_APP_ID_STUDENTS,
// 				req.params.id,
// 				req.body
// 			)
// 			res.status(200).json(updatedStudent)
// 		} catch (error) {
// 			res
// 				.status(500)
// 				.json({ message: 'Error updating student', error: error.message })
// 		}
// 	}

// 	// Controller method to delete a student
// 	static async delete(req, res) {
// 		try {
// 			await KintoneService.deleteRecord(KINTONE_APP_ID_STUDENTS, req.params.id)
// 			res.status(204).json()
// 		} catch (error) {
// 			res
// 				.status(500)
// 				.json({ message: 'Error deleting student', error: error.message })
// 		}
// 	}

// 	static async sync(req, res) {
// 		try {
// 			await KintoneService.syncData()
// 			res.status(204).json()
// 		} catch (error) {
// 			res.status(500).json({ message: error })
// 		}
// 	}
// }

// module.exports = KintoneController

const KintoneService = require('../services/kintoneService')
const kintoneConfig = require('../config/kintoneConfig')

// App ID’dan nomga mapping
const appIdToName = Object.keys(kintoneConfig).reduce((acc, key) => {
	acc[kintoneConfig[key].appId] = key
	return acc
}, {})

class KintoneController {
	// Controller method to retrieve all students
	static async getAll(req, res, next) {
		try {
			const students = await KintoneService.getAllRecords('students')
			res.status(200).json(students)
		} catch (error) {
			res
				.status(500)
				.json({ message: 'Error fetching students', error: error.message })
		}
	}

	// Controller method to retrieve records by column name and value
	static async getBy(req, res, next) {
		try {
			const { table, col, val } = req.body
			const records = await KintoneService.getRecordBy(table, col, val)
			res.status(200).json(records)
		} catch (error) {
			res
				.status(500)
				.json({ message: 'Error fetching records', error: error.message })
		}
	}

	// Controller method to create a new record
	static async create(req, res) {
		try {
			const appId = req.query.app // "105" keladi
			const appName = appIdToName[appId] // "105" → "students"
			if (!appName) {
				throw new Error(`No app name found for appId: ${appId}`)
			}
			const data = req.body
			// console.log(`App Name: ${appName}, Data:`, data) // Debugging uchun
			const result = await KintoneService.createRecord(appName, data)
			res.status(201).json(result)
		} catch (error) {
			res
				.status(500)
				.json({ message: 'Error creating record', error: error.message })
		}
	}

	// Controller method to update a record
	static async update(req, res) {
		try {
			const appId = req.query.app || kintoneConfig.students.appId // Default: students app
			const appName = appIdToName[appId]
			if (!appName) {
				throw new Error(`No app name found for appId: ${appId}`)
			}
			const updatedRecord = await KintoneService.updateRecord(
				appName,
				req.params.id,
				req.body
			)
			res.status(200).json(updatedRecord)
		} catch (error) {
			res
				.status(500)
				.json({ message: 'Error updating record', error: error.message })
		}
	}

	// Controller method to delete a record
	//  static async delete(req, res) {
	//   try {
	//    const appId = req.query.app || kintoneConfig.students.appId // Default: students app
	//    const appName = appIdToName[appId]
	//    if (!appName) {
	//     throw new Error(`No app name found for appId: ${appId}`)
	//    }
	//    await KintoneService.deleteRecord(appName, req.params.id)
	//    res.status(204).json()
	//   } catch (error) {
	//    res
	//     .status(500)
	//     .json({ message: 'Error deleting record', error: error.message })
	//   }
	//  }

	static async delete(req, res) {
		try {
			const appId = req.query.app || kintoneConfig.students.appId // Default: students app
			const appName = appIdToName[appId]
			// console.log(`App ID: ${appId}, App Name: ${appName}`); // Debugging uchun

			if (!appName) {
				throw new Error(`No app name found for appId: ${appId}`)
			}

			const recordId = req.params.id
			// console.log(`Deleting record with ID: ${recordId}`); // Debugging uchun

			await KintoneService.deleteRecord(appName, recordId)
			res.status(204).json()
		} catch (error) {
			console.error('Error deleting record:', error.message) // Debugging uchun
			res
				.status(500)
				.json({ message: 'Error deleting record', error: error.message })
		}
	}

	// Controller method to sync data
	static async sync(req, res) {
		try {
			await KintoneService.syncData()
			res.status(204).json()
		} catch (error) {
			res
				.status(500)
				.json({ message: 'Error syncing data', error: error.message })
		}
	}
}

module.exports = KintoneController
