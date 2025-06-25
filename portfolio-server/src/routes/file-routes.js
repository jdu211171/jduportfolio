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

const authMiddleware = require('../middlewares/auth-middleware');
const { UserFile } = require('../models');

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
router.post('/upload', authMiddleware, upload.any(), async (req, res) => {
    
    // 3. O'ZGARISH: Barcha logikani yangilash
    const files = req.files;
    const { imageType, oldFilePath } = req.body; // `role` va `id` endi form-data'dan olinmaydi
    const { id: owner_id, userType: owner_type } = req.user; // Ma'lumot xavfsiz tarzda token'dan olinadi

    if (!imageType) {
        return res.status(400).json({ error: "imageType field is required." });
    }
    
    try {
        if (oldFilePath && oldFilePath !== 'none') {
            const oldFilePaths = Array.isArray(oldFilePath) ? oldFilePath : [oldFilePath];
            for (const fileUrl of oldFilePaths) {
                try {
                    await deleteFile(fileUrl);
                } catch (err) {
                    console.error(`Failed to delete file at ${fileUrl}: ${err}`);
                }
            }
        }

        const createdRecords = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const fileBuffer = file.buffer;
                const uniqueFilename = generateUniqueFilename(file.originalname);
                
                const objectName = `${owner_type.toLowerCase()}/${imageType}/${owner_id}/${uniqueFilename}`;

                // 1-qadam: Faylni S3'ga yuklash
                const { Location } = await uploadFile(fileBuffer, objectName);

                // 2-qadam: Ma'lumotni to'g'ridan-to'g'ri bazaga yozish
                const newRecord = await UserFile.create({
                    file_url: Location,
                    object_name: objectName,
                    original_filename: file.originalname,
                    purpose: imageType,
                    owner_id: owner_id,
                    owner_type: owner_type,
                });
                
                createdRecords.push(newRecord);
            }
        }

        // Javob sifatida bazaga yozilgan yozuvlarni qaytaramiz
        res.status(201).send(createdRecords.length === 1 ? createdRecords[0] : createdRecords);

    } catch (error) {
        console.error('Error during file upload and record creation:', error);
        res.status(500).send('Error processing file upload');
    }
});

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

