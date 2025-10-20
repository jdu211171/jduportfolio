// src/routes/fileRoutes.js
const express = require('express')
const { uploadFile, deleteFile, getFile } = require('../utils/storageService')
const generateUniqueFilename = require('../utils/uniqueFilename')
const router = express.Router()
const path = require('path')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const fs = require('fs')
const axios = require('axios')

const authMiddleware = require('../middlewares/auth-middleware')
const { UserFile } = require('../models')

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
// router.post('/upload', upload.single('file'), async (req, res) => {
// 	const files = req.files // This will be an array of files
// 	const { role, imageType, id, oldFilePath } = req.body

// 	try {
// 		if (oldFilePath && oldFilePath !== 'none') {
// 			const oldFilePaths = Array.isArray(oldFilePath)
// 				? oldFilePath
// 				: [oldFilePath]
// 			for (const fileUrl of oldFilePaths) {
// 				try {
// 					await deleteFile(fileUrl)
// 				} catch (err) {
// 					console.error(`Failed to delete file at ${fileUrl}: ${err}`)
// 				}
// 			}
// 		}
// 		const uploadedFiles = []
// 		if (files && files.length !== 0) {
// 			for (const file of files) {
// 				const fileBuffer = file.buffer
// 				const uniqueFilename = generateUniqueFilename(file.originalname)
// 				const uploadedFile = await uploadFile(
// 					fileBuffer,
// 					`${role}/${imageType}/${id}/` + uniqueFilename
// 				)
// 				uploadedFiles.push(uploadedFile)
// 			}
// 		}

// 		// Return the uploaded files array
// 		res.status(201).send(uploadedFiles);

//     } catch (error) {
//         console.error('Error during file upload and record creation:', error);
//         res.status(500).send('Error processing file upload');
//     }
// });

// Single file upload endpoint (for compatibility with existing frontend)
router.post('/upload', upload.single('file'), async (req, res) => {
	const file = req.file
	const { role, imageType, id, oldFilePath } = req.body

	try {
		// Delete old file if specified
		if (oldFilePath && oldFilePath !== 'none' && !oldFilePath.startsWith('blob:')) {
			try {
				await deleteFile(oldFilePath)
				console.log(`Deleted old file: ${oldFilePath}`)
			} catch (err) {
				console.error(`Failed to delete file at ${oldFilePath}: ${err}`)
			}
		}

		if (!file) {
			return res.status(400).send('No file uploaded.')
		}

		if (!role || !imageType || !id) {
			return res.status(400).send('Missing required parameters: role, imageType, id')
		}

		const fileBuffer = file.buffer
		const uniqueFilename = generateUniqueFilename(file.originalname)
		const objectName = `${role}/${imageType}/${id}/${uniqueFilename}`

		// Upload to S3/storage
		const uploadedFile = await uploadFile(fileBuffer, objectName)

		console.log(`File uploaded successfully: ${uploadedFile.Location}`)
		res.status(201).send(uploadedFile)
	} catch (error) {
		console.error('Error during file upload:', error)
		res.status(500).send('Error uploading file')
	}
})

// Multiple files upload endpoint (with authentication)
router.post('/upload-multiple', authMiddleware, upload.array('files'), async (req, res) => {
	// 3. Foydalanuvchi ma'lumotlari authMiddleware'dan olinadi
	const ownerId = req.user.id
	const ownerType = req.user.userType
	const { imageType } = req.body
	const files = req.files // Endi bu har doim massiv bo'ladi

	if (!files || files.length === 0) {
		return res.status(400).send('Yuklash uchun fayllar topilmadi.')
	}

	if (!imageType) {
		return res.status(400).send('Fayl maqsadi (imageType) talab qilinadi.')
	}

	try {
		const uploadedFileRecords = []

		for (const file of files) {
			const fileBuffer = file.buffer
			const uniqueFilename = generateUniqueFilename(file.originalname)
			const objectName = `${ownerType}/${ownerId}/${imageType}/${uniqueFilename}`

			// S3 ga yuklash
			const uploadedS3Info = await uploadFile(fileBuffer, objectName)

			// 4. Ma'lumotlar bazasiga yozuv yaratish
			const newFileRecord = await UserFile.create({
				file_url: uploadedS3Info.Location,
				object_name: objectName,
				original_filename: file.originalname,
				imageType: imageType,
				owner_id: ownerId,
				owner_type: ownerType,
			})

			uploadedFileRecords.push(newFileRecord)
		}

		res.status(201).send(uploadedFileRecords)
	} catch (error) {
		console.error('Fayl yuklash va yozuv yaratishda xatolik:', error)
		res.status(500).send('Fayllarni qayta ishlashda xatolik yuz berdi.')
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

// // Endpoint to upload images (Create)
// router.post('/images/upload', upload.any(), async (req, res) => {
//     const files = req.files // Array of image files
//     const { role, imageType, id } = req.body

//     try {
//         const uploadedImages = []
//         if (files && files.length !== 0) {
//             for (const file of files) {
//                 const fileBuffer = file.buffer
//                 const uniqueFilename = generateUniqueFilename(file.originalname)
//                 const uploadedImage = await uploadFile(
//                     fileBuffer,
//                     `${role}/${imageType}/${id}/` + uniqueFilename
//                 )
//                 uploadedImages.push(uploadedImage)
//             }
//         }

//         res.status(200).send(uploadedImages)
//     } catch (error) {
//         console.error(error)
//         res.status(500).send('Error uploading image(s)')
//     }
// })

// // Endpoint to update images (Update)
// router.put('/images/update', upload.any(), async (req, res) => {
//     const files = req.files // Array of new image files
//     const { role, imageType, id, oldImagePaths } = req.body

//     try {
//         // Delete old images
//         if (oldImagePaths && oldImagePaths.length > 0) {
//             for (const imagePath of oldImagePaths) {
//                 try {
//                     await deleteFile(imagePath)
//                 } catch (err) {
//                     console.error(`Failed to delete image at ${imagePath}: ${err}`)
//                 }
//             }
//         }

//         // Upload new images
//         const uploadedImages = []
//         if (files && files.length !== 0) {
//             for (const file of files) {
//                 const fileBuffer = file.buffer
//                 const uniqueFilename = generateUniqueFilename(file.originalname)
//                 const uploadedImage = await uploadFile(
//                     fileBuffer,
//                     `${role}/${imageType}/${id}/` + uniqueFilename
//                 )
//                 uploadedImages.push(uploadedImage)
//             }
//         }

//         res.status(200).send(uploadedImages)
//     } catch (error) {
//         console.error(error)
//         res.status(500).send('Error updating image(s)')
//     }
// })

// // Endpoint to delete images (Delete)
// router.delete('/images/delete', async (req, res) => {
//     const { imagePaths } = req.body // Array of image paths to delete

//     try {
//         if (imagePaths && imagePaths.length > 0) {
//             for (const imagePath of imagePaths) {
//                 try {
//                     await deleteFile(imagePath)
//                 } catch (err) {
//                     console.error(`Failed to delete image at ${imagePath}: ${err}`)
//                 }
//             }
//         }

//         res.status(200).send('Images deleted successfully')
//     } catch (error) {
//         console.error(error)
//         res.status(500).send('Error deleting image(s)')
//     }
// })

module.exports = router
