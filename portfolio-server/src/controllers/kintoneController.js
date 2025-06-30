const KintoneService = require('../services/kintoneService')
const kintoneConfig = require('../config/kintoneConfig')

// App ID’dan nomga mapping
const appIdToName = Object.keys(kintoneConfig).reduce((acc, key) => {
 acc[kintoneConfig[key].appId] = key
 return acc
}, {})

class KintoneController {
 
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
static async delete(req, res) {
    try {
        const appId = req.query.app || kintoneConfig.students.appId; // Default: students app
        const appName = appIdToName[appId];
        // console.log(`App ID: ${appId}, App Name: ${appName}`); // Debugging uchun

        if (!appName) {
            throw new Error(`No app name found for appId: ${appId}`);
        }

        const recordId = req.params.id;
        // console.log(`Deleting record with ID: ${recordId}`); // Debugging uchun

        await KintoneService.deleteRecord(appName, recordId);
        res.status(204).json();
    } catch (error) {
        console.error('Error deleting record:', error.message); // Debugging uchun
        res.status(500).json({ message: 'Error deleting record', error: error.message });
    }
}
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

