const {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
} = require('@aws-sdk/client-s3')
const https = require('https')
const fs = require('fs')

const s3Client = new S3Client({
    endpoint: process.env.AWS_S3_ENDPOINT,
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    },
    forcePathStyle: true, // MinIO uchun kerak
    requestHandler: new https.Agent({
        rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0',
    }),
});

const bucketName = process.env.AWS_S3_BUCKET_NAME

const uploadFile = async (fileBuffer, objectName) => {
    try {
        const uploadParams = {
            Bucket: bucketName,
            Key: objectName,
            Body: fileBuffer,
            ACL: 'public-read',
        };
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Correctly construct the file URL
        const Location = `${process.env.AWS_S3_ENDPOINT}/${bucketName}/${objectName}`;

        return { Location };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

const deleteFile = async (fileUrl) => {
    try {
        const url = new URL(fileUrl);
        const objectName = decodeURIComponent(url.pathname.substring(1)); // Remove leading '/'
        const deleteParams = {
            Bucket: bucketName,
            Key: objectName,
        };
        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

// Function to download a file
const getFile = async (objectName, downloadPath) => {
	try {
		const downloadParams = {
			Bucket: bucketName,
			Key: objectName,
		}

		const command = new GetObjectCommand(downloadParams)
		const data = await s3Client.send(command)

		// Write the file to disk
		const body = await streamToBuffer(data.Body)
		fs.writeFileSync(downloadPath, body)
		// console.log(`File ${objectName} downloaded to ${downloadPath}`)
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
