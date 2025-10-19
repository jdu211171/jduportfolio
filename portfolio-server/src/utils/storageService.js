// utils/storageService.js

const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')

const s3Client = new S3Client({
	region: process.env.AWS_S3_REGION,
	credentials: {
		accessKeyId: process.env.AWS_S3_ACCESS_KEY,
		secretAccessKey: process.env.AWS_S3_SECRET_KEY,
	},
})

const bucketName = process.env.AWS_S3_BUCKET_NAME

const uploadFile = async (fileBuffer, objectName) => {
	try {
		// Check if AWS credentials are configured
		if (!process.env.AWS_S3_ACCESS_KEY || !process.env.AWS_S3_SECRET_KEY || !bucketName) {
			// Fallback to local storage
			const fs = require('fs')
			const path = require('path')

			// Create uploads directory if it doesn't exist
			const uploadsDir = path.join(__dirname, '../../uploads')
			if (!fs.existsSync(uploadsDir)) {
				fs.mkdirSync(uploadsDir, { recursive: true })
			}

			// Create subdirectories based on objectName
			const filePath = path.join(uploadsDir, objectName)
			const fileDir = path.dirname(filePath)
			if (!fs.existsSync(fileDir)) {
				fs.mkdirSync(fileDir, { recursive: true })
			}

			// Save file locally
			fs.writeFileSync(filePath, fileBuffer)

			// Return local URL
			const Location = `http://localhost:${process.env.PORT || 3001}/uploads/${objectName}`
			console.log('File uploaded locally:', Location)
			return { Location }
		}

		const uploadParams = {
			Bucket: bucketName,
			Key: objectName,
			Body: fileBuffer,
			ACL: 'public-read',
			ContentType: 'image/*',
			CacheControl: 'max-age=31536000',
			Metadata: {
				'original-name': 'uploaded-file',
			},
		}
		const command = new PutObjectCommand(uploadParams)
		await s3Client.send(command)

		// Correctly construct the file URL
		const Location = `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${objectName}`

		return { Location }
	} catch (error) {
		console.error('Error uploading file:', error)

		// Fallback to local storage on S3 error
		try {
			const fs = require('fs')
			const path = require('path')

			const uploadsDir = path.join(__dirname, '../../uploads')
			if (!fs.existsSync(uploadsDir)) {
				fs.mkdirSync(uploadsDir, { recursive: true })
			}

			const filePath = path.join(uploadsDir, objectName)
			const fileDir = path.dirname(filePath)
			if (!fs.existsSync(fileDir)) {
				fs.mkdirSync(fileDir, { recursive: true })
			}

			fs.writeFileSync(filePath, fileBuffer)

			const Location = `http://localhost:${process.env.PORT || 3001}/uploads/${objectName}`
			console.log('File uploaded locally (fallback):', Location)
			return { Location }
		} catch (fallbackError) {
			console.error('Error with fallback storage:', fallbackError)
			throw error
		}
	}
}

const deleteFile = async objectName => {
	try {
		// Check if AWS credentials are configured
		if (!process.env.AWS_S3_ACCESS_KEY || !process.env.AWS_S3_SECRET_KEY || !bucketName) {
			// Local storage deletion
			const fs = require('fs')
			const path = require('path')
			const filePath = path.join(__dirname, '../../uploads', objectName)

			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath)
				console.log('Local file deleted:', filePath)
			}
			return
		}

		// S3 deletion
		const deleteParams = {
			Bucket: bucketName,
			Key: objectName,
		}
		const command = new DeleteObjectCommand(deleteParams)
		await s3Client.send(command)
		console.log('S3 file deleted:', objectName)
	} catch (error) {
		console.error('Error deleting file:', error)
		throw error
	}
}

const getFile = async (objectName, downloadPath) => {
	try {
		const downloadParams = {
			Bucket: bucketName,
			Key: objectName,
		}

		const command = new GetObjectCommand(downloadParams)
		const data = await s3Client.send(command)

		// Write the file to disk
		const fs = require('fs')
		const body = await streamToBuffer(data.Body)
		fs.writeFileSync(downloadPath, body)
	} catch (error) {
		console.error('Error downloading file:', error)
		throw error
	}
}

// Helper function to convert stream to buffer
const streamToBuffer = async stream => {
	const chunks = []
	for await (const chunk of stream) {
		chunks.push(chunk)
	}
	return Buffer.concat(chunks)
}

module.exports = {
	uploadFile,
	deleteFile,
	getFile,
}
