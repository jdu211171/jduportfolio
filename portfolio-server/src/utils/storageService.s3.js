const {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
} = require('@aws-sdk/client-s3')

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
		const uploadParams = {
			Bucket: bucketName,
			Key: objectName,
			Body: fileBuffer,
			ACL: 'public-read',
		}
		const command = new PutObjectCommand(uploadParams)
		await s3Client.send(command)

		// Correctly construct the file URL
		const Location = `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${objectName}`

		return { Location }
	} catch (error) {
		console.error('Error uploading file:', error)
		throw error
	}
}

const deleteFile = async fileUrl => {
	try {
		const url = new URL(fileUrl)
		const objectName = decodeURIComponent(url.pathname.substring(1)) // Remove leading '/'
		const deleteParams = {
			Bucket: bucketName,
			Key: objectName,
		}
		const command = new DeleteObjectCommand(deleteParams)
		await s3Client.send(command)
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
