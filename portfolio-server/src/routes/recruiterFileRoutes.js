// routes/recruiterFileRoutes
const express = require('express')
const router = express.Router()

const controller = require('../controllers/recruiterFileController')
const recruiterUploader = require('../middlewares/recruiterUploader')

router.post('/', recruiterUploader.array('files', 3), controller.uploadRecruiterFiles)

router.get('/', controller.getRecruiterFiles)

router.put('/:id', recruiterUploader.single('file'), controller.updateRecruiterFile)

router.delete('/:id', controller.deleteRecruiterFile)

router.get('/:id/download', controller.downloadRecruiterFile)

module.exports = router
