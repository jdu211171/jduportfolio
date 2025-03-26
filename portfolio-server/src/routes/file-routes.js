// src/routes/fileRoutes.js
const express = require('express')
const { uploadFile, deleteFile, getFile } = require('../utils/storageService')
const generateUniqueFilename = require('../utils/uniqueFilename')
const router = express.Router()
const path = require('path')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const fs = require('fs')

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     tags: [Files]
 *     summary: Upload one or more files
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               role:
 *                 type: string
 *               imageType:
 *                 type: string
 *               id:
 *                 type: string
 *               oldFilePath:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns file upload info
 *       500:
 *         description: Error uploading file(s)
 */
// Endpoint to upload one or more files
router.post('/upload', upload.any(), async (req, res) => {
	const files = req.files // This will be an array of files
	const { role, imageType, id, oldFilePath } = req.body

	try {
		if (oldFilePath && oldFilePath !== 'none') {
			const oldFilePaths = Array.isArray(oldFilePath)
				? oldFilePath
				: [oldFilePath]
			for (const fileUrl of oldFilePaths) {
				try {
					await deleteFile(fileUrl)
				} catch (err) {
					console.error(`Failed to delete file at ${fileUrl}: ${err}`)
				}
			}
		}
		const uploadedFiles = []
		if (files && files.length !== 0) {
			for (const file of files) {
				const fileBuffer = file.buffer
				const uniqueFilename = generateUniqueFilename(file.originalname)
				const uploadedFile = await uploadFile(
					fileBuffer,
					`${role}/${imageType}/${id}/` + uniqueFilename
				)
				uploadedFiles.push(uploadedFile)
			}
		}

		res
			.status(200)
			.send(uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles)
	} catch (error) {
		console.log(error)
		res.status(500).send('Error uploading file(s)')
	}
})

/**
 * @swagger
 * /api/files/download/{objectName}:
 *   get:
 *     tags: [Files]
 *     summary: Download a file by its object name
 *     parameters:
 *       - in: path
 *         name: objectName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested file
 *       500:
 *         description: Error downloading file
 */
// Endpoint to download a file
router.get('/download/:objectName', async (req, res) => {
	const { objectName } = req.params
	const downloadPath = path.join(__dirname, 'downloads', objectName)

	try {
		await getFile(objectName, downloadPath)
		res.status(200).sendFile(downloadPath)
	} catch (error) {
		res.status(500).send('Error downloading file')
	}
})

module.exports = router

