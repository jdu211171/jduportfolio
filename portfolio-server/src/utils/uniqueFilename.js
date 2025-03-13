// src/utils/uniqueFilename.js
const crypto = require('crypto');

const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(2).toString('hex'); // Generate a random string of 12 characters
  const extension = originalFilename.split('.').pop(); // Get the file extension

  return `${timestamp}.${randomString};${originalFilename}`;
};

module.exports = generateUniqueFilename;
