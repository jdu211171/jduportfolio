const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const https = require('https');
const fs = require('fs');


const s3Client = new S3Client({
    endpoint: `${process.env.AWS_S3_ENDPOINT}:${process.env.AWS_S3_PORT}`,
    region: process.env.AWS_S3_REGION, 
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    },
    forcePathStyle: true, // needed with MinIO
    requestHandler: new https.Agent({ rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0' }),
    signatureVersion: 'v4',
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Function to upload a file
const uploadFile = async (fileBuffer, objectName) => {
    try {
        const uploadParams = {
            Bucket: bucketName,
            Key: objectName,
            Body: fileBuffer,
            ACL: 'public-read'
        };
        const command = new PutObjectCommand(uploadParams);
        const data = await s3Client.send(command);

        const Location = `${process.env.AWS_S3_ENDPOINT}:${process.env.AWS_S3_PORT}/${bucketName}/${objectName}`;

        return {
            ...data,
            Location, // Include the constructed URL in the response
        };
    } catch (error) {
        console.log('Error uploading file:', error);
        throw error;
    }
};

// Function to delete a file using the file's URL
const deleteFile = async (fileUrl) => {
    try {
        // Extract the object key from the file URL
        const url = new URL(fileUrl);
        let objectName = decodeURIComponent(url.pathname.substring(1)); // Remove the leading '/' and decode any encoded characters

        // Remove the "portfolio/" prefix if it exists
        const prefix = 'portfolio/';
        if (objectName.startsWith(prefix)) {
            objectName = objectName.substring(prefix.length);
        }

        const deleteParams = {
            Bucket: bucketName,
            Key: objectName,
        };

        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);
        console.log(`File ${objectName} deleted successfully.`);
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
        };

        const command = new GetObjectCommand(downloadParams);
        const data = await s3Client.send(command);

        // Write the file to disk
        const body = await streamToBuffer(data.Body);
        fs.writeFileSync(downloadPath, body);
        console.log(`File ${objectName} downloaded to ${downloadPath}`);
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
};

// Helper function to convert stream to buffer
const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};

module.exports = {
    uploadFile,
    deleteFile,
    getFile,
};