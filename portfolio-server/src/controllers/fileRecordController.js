const { UserFile } = require('../models'); // index.js orqali import qilish
const { deleteFile } = require('../utils/storageService'); // S3 dan o'chirish logikasi

class FileRecordController {

    /**
     * Fayl URLini va metadatasini ma'lumotlar bazasiga saqlaydi
     */
    static async createFileRecord(req, res) {
        const { file_url, object_name, original_filename, purpose } = req.body;
        const { id: owner_id, userType: owner_type } = req.user;

        if (!file_url || !object_name || !purpose) {
            return res.status(400).json({ error: 'file_url, object_name, and purpose are required.' });
        }

        try {
            const newRecord = await UserFile.create({
                file_url,
                object_name,
                original_filename,
                purpose,
                owner_id,
                owner_type,
            });
            return res.status(201).json(newRecord);
        } catch (error) {
            console.error('Error creating file record:', error);
            return res.status(500).json({ error: 'Failed to create file record' });
        }
    }

    /**
     * Tizimga kirgan foydalanuvchining o'z fayllarini qaytaradi
     */
    static async getMyFiles(req, res) {
        const { id: owner_id, userType: owner_type } = req.user;
        const { purpose } = req.query; // Query orqali filterlash (masalan: ?purpose=gallery)

        try {
            const whereClause = { owner_id, owner_type };
            if (purpose) {
                whereClause.purpose = purpose;
            }
            
            const files = await UserFile.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']]
            });
            
            return res.status(200).json(files);
        } catch (error) {
            console.error('Error fetching user files:', error);
            return res.status(500).json({ error: 'Failed to fetch files' });
        }
    }

    /**
     * Faylni S3 dan va ma'lumotlar bazasidan o'chiradi
     */
    static async deleteFileRecord(req, res) {
    const { fileId } = req.params;
    // Token'dan olingan user ma'lumotlari
    const { id: owner_id, userType: owner_type } = req.user; 
        try {
            // So'rov endi owner_type'ni ham tekshiradi
            const fileRecord = await UserFile.findOne({
                where: {
                    id: fileId,
                    owner_id: owner_id,
                    owner_type: owner_type // <<< QO'SHILGAN ENG MUHIM SHART
                }
            });

            if (!fileRecord) {
                // Endi bu xabar yanada aniqroq: "Fayl topilmadi yoki bu faylni o'chirishga sizning haqqingiz yo'q"
                return res.status(404).json({ error: 'File not found or you do not have permission to delete it.' });
            }

            // 1. Faylni S3 omboridan o'chirish
            await deleteFile(fileRecord.file_url);

            // 2. Ma'lumotlar bazasidan yozuvni o'chirish
            await fileRecord.destroy();

            return res.status(200).json({ message: 'File deleted successfully' });
        } catch (error) {
            console.error('Error deleting file:', error);
            return res.status(500).json({ error: 'Failed to delete file' });
        }
    }
    // Bu yerga adminlar uchun boshqa foydalanuvchilar fayllarini olish logikasini qo'shishingiz mumkin
}

module.exports = FileRecordController;