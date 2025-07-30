// controllers/recruiterFileController.js
const { UserFile } = require('../models');
const { uploadFile, deleteFile, getFile } = require('../utils/storageService');
const generateUniqueFilename = require('../utils/uniqueFilename');
const path = require('path');

exports.uploadRecruiterFiles = async (req, res) => {
    try {
        if (req.user.userType !== 'Recruiter') {
            return res.status(403).json({ message: 'Ruxsat yo\'q. Faqat rekuterlar fayl yuklay oladi.' });
        }

        const recruiterId = req.user.id;
        const filesToUpload = req.files;

        if (!filesToUpload || filesToUpload.length === 0) {
            return res.status(400).send('Yuklash uchun fayllar topilmadi.');
        }

        const existingFilesCount = await UserFile.count({ where: { owner_id: recruiterId, owner_type: 'Recruiter' } });

        if (existingFilesCount + filesToUpload.length > 3) {
            return res.status(400).json({ message: `Siz jami 3 tagacha fayl yuklay olasiz. Sizda allaqachon ${existingFilesCount} ta fayl mavjud.` });
        }

        const uploadedFileRecords = [];
        for (const file of filesToUpload) {
            const fileBuffer = file.buffer;
            const uniqueFilename = generateUniqueFilename(file.originalname);
            const objectName = `Recruiter/${recruiterId}/documents/${uniqueFilename}`;
            const uploadedS3Info = await uploadFile(fileBuffer, objectName);

            const newFileRecord = await UserFile.create({
                file_url: uploadedS3Info.Location,
                object_name: objectName,
                original_filename: file.originalname,
                imageType: 'recruiter_document',
                owner_id: recruiterId,
                owner_type: 'Recruiter',
            });
            uploadedFileRecords.push(newFileRecord);
        }

        res.status(201).json(uploadedFileRecords);
    } catch (error) {
        console.error('Rekruter faylini yuklashda xatolik:', error);
        res.status(500).send('Fayllarni qayta ishlashda server xatoligi yuz berdi.');
    }
};
exports.getRecruiterFiles = async (req, res) => {
    try {
        if (req.user.userType !== 'Recruiter') {
            return res.status(403).json({ message: 'Ruxsat yo\'q.' });
        }
        const recruiterId = req.user.id;
        const files = await UserFile.findAll({
            where: { owner_id: recruiterId, owner_type: 'Recruiter' },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(files);
    } catch (error) {
        console.error('Rekruter fayllarini olishda xatolik:', error);
        res.status(500).json({ error: 'Fayllarni olib bo‘lmadi' });
    }
};
exports.updateRecruiterFile = async (req, res) => {
    try {
        if (req.user.userType !== 'Recruiter') {
            return res.status(403).json({ message: 'Ruxsat yo\'q.' });
        }

        const { id: fileId } = req.params;
        const recruiterId = req.user.id;
        const newFile = req.file;

        if (!newFile) {
            return res.status(400).send('Yangilash uchun fayl topilmadi.');
        }

        const oldFileRecord = await UserFile.findOne({ where: { id: fileId, owner_id: recruiterId, owner_type: 'Recruiter' } });
        if (!oldFileRecord) {
            return res.status(404).json({ error: 'Fayl topilmadi yoki uni yangilashga ruxsatingiz yo\'q.' });
        }

        // 1. Eski faylni ombordan o'chiramiz
        await deleteFile(oldFileRecord.file_url);

        // 2. Yangi faylni yuklaymiz
        const fileBuffer = newFile.buffer;
        const uniqueFilename = generateUniqueFilename(newFile.originalname);
        const objectName = `Recruiter/${recruiterId}/documents/${uniqueFilename}`;
        const uploadedS3Info = await uploadFile(fileBuffer, objectName);

        // 3. Bazadagi yozuvni yangilaymiz
        oldFileRecord.file_url = uploadedS3Info.Location;
        oldFileRecord.object_name = objectName;
        oldFileRecord.original_filename = newFile.originalname;
        await oldFileRecord.save();
        
        res.status(200).json(oldFileRecord);
    } catch (error) {
        console.error('Rekruter faylini yangilashda xatolik:', error);
        res.status(500).json({ error: 'Faylni yangilab bo‘lmadi' });
    }
};
exports.deleteRecruiterFile = async (req, res) => {
    try {
        if (req.user.userType !== 'Recruiter') {
            return res.status(403).json({ message: 'Ruxsat yo\'q.' });
        }
        
        const { id: fileId } = req.params;
        const recruiterId = req.user.id;
        
        const fileRecord = await UserFile.findOne({ where: { id: fileId, owner_id: recruiterId, owner_type: 'Recruiter' } });
        if (!fileRecord) {
            return res.status(404).json({ error: 'Fayl topilmadi yoki uni o\'chirishga ruxsatingiz yo\'q.' });
        }

        await deleteFile(fileRecord.file_url);
        await fileRecord.destroy();

        res.status(200).json({ message: 'Fayl muvaffaqiyatli o\'chirildi.' });
    } catch (error) {
        console.error('Rekruter faylini o\'chirishda xatolik:', error);
        res.status(500).json({ error: 'Faylni o\'chirib bo‘lmadi' });
    }
};
exports.downloadRecruiterFile = async (req, res) => {
    try {
        if (req.user.userType !== 'Recruiter') {
            return res.status(403).json({ message: 'Ruxsat yo\'q.' });
        }

        const { id: fileId } = req.params;
        const recruiterId = req.user.id;

        const fileRecord = await UserFile.findOne({ where: { id: fileId, owner_id: recruiterId, owner_type: 'Recruiter' } });
        if (!fileRecord) {
            return res.status(404).json({ error: 'Fayl topilmadi yoki uni yuklab olishga ruxsatingiz yo\'q.' });
        }

        const tempDir = path.join(__dirname, '..', 'temp_downloads');
        const downloadPath = path.join(tempDir, fileRecord.original_filename);

        await getFile(fileRecord.object_name, downloadPath);

        res.download(downloadPath, fileRecord.original_filename, (err) => {
            if (err) {
                console.error('Faylni yuborishda xatolik:', err);
            }
            // Vaqtinchalik faylni o'chirish
            const fs = require('fs');
            fs.unlinkSync(downloadPath);
        });

    } catch (error) {
        console.error('Rekruter faylini yuklab olishda xatolik:', error);
        res.status(500).json({ error: 'Faylni yuklab bo‘lmadi' });
    }
};