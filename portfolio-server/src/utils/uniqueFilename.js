// src/utils/uniqueFilename.js
const crypto = require('crypto')
const path = require('path')

const generateUniqueFilename = originalFilename => {
	const timestamp = Date.now()
	const randomString = crypto.randomBytes(2).toString('hex')
	const extension = path.extname(originalFilename)
	const nameWithoutExt = path.basename(originalFilename, extension)
	
	// Sanitize filename to be filesystem-safe while preserving Unicode characters
	// Replace problematic characters but keep Japanese, Korean, Chinese, etc.
	const sanitizedName = nameWithoutExt
		.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_') // Replace Windows forbidden chars
		.replace(/\.+/g, '_') // Replace multiple dots
		.trim() // Remove leading/trailing spaces
	
	// Create unique filename with original characters preserved
	// Pattern: timestamp_random_originalName.extension
	return `${timestamp}_${randomString}_${sanitizedName}${extension}`
}

module.exports = generateUniqueFilename
