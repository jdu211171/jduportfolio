// routes/fileRecordRoute.js
const express = require('express')
const router = express.Router()
const FileRecordController = require('../controllers/fileRecordController')
const authMiddleware = require('../middlewares/auth-middleware')

router.get('/my-files', authMiddleware, FileRecordController.getMyFiles)
router.delete('/:fileId', authMiddleware, FileRecordController.deleteFileRecord)

module.exports = router
