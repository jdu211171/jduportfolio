// routes/deliverableRoutes.js

const express = require('express')
const router = express.Router()
const DeliverableController = require('../controllers/deliverableController')
const multer = require('multer')

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }, // Har bir fayl uchun 5MB
})

router.post('/', upload.array('files', 10), DeliverableController.add)

router.put('/:deliverableId', upload.array('files', 10), DeliverableController.update)
router.delete('/:deliverableId', DeliverableController.remove)

module.exports = router
