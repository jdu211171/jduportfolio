const fs = require('fs')
const path = require('path')

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true })
}

const uploadFile = async (fileBuffer, objectName) => {
	try {
		// Create directory structure if needed
		const filePath = path.join(uploadsDir, objectName)
		const dir = path.dirname(filePath)

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true })
		}

		// Write file to disk
		fs.writeFileSync(filePath, fileBuffer)

		// Return the public URL
		const Location = `http://localhost:4000/uploads/${objectName}`

		return { Location }
	} catch (error) {
		console.error('Error uploading file:', error)
		throw error
	}
}

const deleteFile = async fileUrl => {
	try {
		// Extract object name from URL
		const urlParts = fileUrl.split('/uploads/')
		if (urlParts.length < 2) {
			throw new Error('Invalid file URL format')
		}

		const objectName = urlParts[1]
		const filePath = path.join(uploadsDir, objectName)

		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath)
		}
	} catch (error) {
		console.error('Error deleting file:', error)
		throw error
	}
}

const getFile = async (objectName, downloadPath) => {
	try {
		const filePath = path.join(uploadsDir, objectName)

		if (!fs.existsSync(filePath)) {
			throw new Error('File not found')
		}

		const fileBuffer = fs.readFileSync(filePath)
		fs.writeFileSync(downloadPath, fileBuffer)
	} catch (error) {
		console.error('Error downloading file:', error)
		throw error
	}
}

module.exports = {
	uploadFile,
	deleteFile,
	getFile,
}
