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
