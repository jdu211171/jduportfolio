const { uploadFile, deleteFile } = require('../utils/storageService')
const generateUniqueFilename = require('../utils/uniqueFilename')
const { Image } = require('../models') // Agar rasm ma'lumotlarini bazada saqlasangiz
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

// Rasmni yuklash va yaratish (Create)
exports.createImage = [
	upload.single('image'),
	async (req, res) => {
		// console.log('req.file:', req.file);
		// console.log('req.body:', req.body);
		try {
			if (!req.file) {
				return res.status(400).json({ message: 'Rasm fayli yuklanmadi' })
			}

			const {
				role = 'images',
				imageType = 'general',
				id = 'default',
			} = req.body
			const uniqueFilename = generateUniqueFilename(req.file.originalname)
			const result = await uploadFile(
				req.file.buffer,
				`${role}/${imageType}/${id}/` + uniqueFilename
			)
			const imageUrl = result.Location
			// console.log('imageUrl:', imageUrl);
			// Ma'lumotlar bazasiga rasm haqida yozuv qo'shish (agar kerak bo'lsa)
			const newImage = await Image.create({ imageUrl })
			res.status(201).json(newImage)
		} catch (error) {
			console.error('Rasm yuklashda xatolik:', error)
			res.status(500).json({
				message: 'Rasm yuklashda xatolik yuz berdi',
				error: error.message,
			})
		}
	},
]

// Barcha rasmlarni olish (Read)
exports.getAllImages = async (req, res) => {
	try {
		const images = await Image.findAll()
		res.status(200).json(images)
	} catch (error) {
		console.error('Rasmlarni olishda xatolik:', error)
		res.status(500).json({
			message: 'Rasmlarni olishda xatolik yuz berdi',
			error: error.message,
		})
	}
}

// ID bo'yicha rasmni olish (Read)
exports.getImageById = async (req, res) => {
	const { id } = req.params
	try {
		const image = await Image.findByPk(id)
		if (!image) {
			return res.status(404).json({ message: 'Rasm topilmadi' })
		}
		res.status(200).json(image)
	} catch (error) {
		console.error(`ID ${id} bo'yicha rasmni olishda xatolik:`, error)
		res.status(500).json({
			message: 'Rasmni olishda xatolik yuz berdi',
			error: error.message,
		})
	}
}

// Rasmni yangilash (Update)
// exports.updateImage = [
//     upload.single('image'),
//     async (req, res) => {
//         const { id } = req.params;
//         const { role = 'images', imageType = 'general', newId = 'default', oldImageUrl } = req.body;

//         try {
//             const image = await Image.findByPk(id);
//             if (!image) {
//                 return res.status(404).json({ message: 'Rasm topilmadi' });
//             }

//             let imageUrl = image.imageUrl;

//             // Agar yangi rasm yuklangan bo'lsa
//             if (req.file) {
//                 // Avvalgi rasmni o'chirish
//                 if (oldImageUrl && oldImageUrl !== 'none') {
//                     try {
//                         await deleteFile(oldImageUrl);
//                     } catch (deleteError) {
//                         console.error('Avvalgi rasmni o\'chirishda xatolik:', deleteError);
//                         // O'chirishda xatolik bo'lsa ham, yangi rasmni yuklashga harakat qilish
//                     }
//                 }

//                 const uniqueFilename = generateUniqueFilename(req.file.originalname);
//                 imageUrl = await uploadFile(req.file.buffer, `${role}/${imageType}/${newId}/` + uniqueFilename);
//             } else if (req.body.imageUrl) {
//                 // Agar faqat rasm URL manzili yangilangan bo'lsa
//                 imageUrl = req.body.imageUrl;
//             }

//             const [updatedRows] = await Image.update({ imageUrl }, { where: { id } });

//             if (updatedRows > 0) {
//                 const updatedImage = await Image.findByPk(id);
//                 res.status(200).json(updatedImage);
//             } else {
//                 res.status(404).json({ message: 'Rasm topilmadi' });
//             }
//         } catch (error) {
//             console.error(`ID ${id} bo'yicha rasmni yangilashda xatolik:`, error);
//             res.status(500).json({ message: 'Rasmni yangilashda xatolik yuz berdi', error: error.message });
//         }
//     },
// ];

exports.updateImage = [
	upload.single('image'),
	async (req, res) => {
		const { id } = req.params
		const {
			role = 'images',
			imageType = 'general',
			newId = 'default',
			oldImageUrl,
		} = req.body

		try {
			const image = await Image.findByPk(id)
			if (!image) {
				return res.status(404).json({ message: 'Rasm topilmadi' })
			}

			let imageUrl = image.imageUrl

			// Agar yangi rasm yuklangan bo'lsa
			if (req.file) {
				// Avvalgi rasmni o'chirish
				if (oldImageUrl && oldImageUrl !== 'none') {
					try {
						await deleteFile(oldImageUrl)
					} catch (deleteError) {
						console.error("Avvalgi rasmni o'chirishda xatolik:", deleteError)
					}
				}

				const uniqueFilename = generateUniqueFilename(req.file.originalname)
				const result = await uploadFile(
					req.file.buffer,
					`${role}/${imageType}/${newId}/` + uniqueFilename
				)
				imageUrl = result.Location // Faqat Location qiymatini oling
			} else if (req.body.imageUrl) {
				// Agar faqat rasm URL manzili yangilangan bo'lsa
				imageUrl = req.body.imageUrl
			}

			// console.log('Yangilangan imageUrl:', imageUrl); // Konsolda chop eting

			const [updatedRows] = await Image.update({ imageUrl }, { where: { id } })

			if (updatedRows > 0) {
				const updatedImage = await Image.findByPk(id)
				res.status(200).json(updatedImage)
			} else {
				res.status(404).json({ message: 'Rasm topilmadi' })
			}
		} catch (error) {
			console.error(`ID ${id} bo'yicha rasmni yangilashda xatolik:`, error)
			res.status(500).json({
				message: 'Rasmni yangilashda xatolik yuz berdi',
				error: error.message,
			})
		}
	},
]

// Rasmni o'chirish (Delete)
exports.deleteImage = async (req, res) => {
	const { id } = req.params

	try {
		const image = await Image.findByPk(id)
		if (!image) {
			return res.status(404).json({ message: 'Rasm topilmadi' })
		}

		const imageUrl = image.imageUrl

		// Faylni Minio dan o'chirish
		if (imageUrl) {
			try {
				await deleteFile(imageUrl)
			} catch (deleteError) {
				console.error("Rasmni Minio dan o'chirishda xatolik:", deleteError)
				// O'chirishda xatolik bo'lsa ham, ma'lumotlar bazasidan yozuvni o'chirishga harakat qilish
			}
		}

		const deletedRows = await Image.destroy({ where: { id } })

		if (deletedRows > 0) {
			// return res.status(204).send();
			return res.status(200).json({
				message: "Rasm muvaffaqiyatli o'chirildi",
				deletedImage: {
					id: image.id,
					imageUrl: image.imageUrl,
					createdAt: image.createdAt,
					updatedAt: image.updatedAt,
				},
			})
		} else {
			res.status(404).json({ message: 'Rasm topilmadi' })
		}
	} catch (error) {
		console.error(`ID ${id} bo'yicha rasmni o'chirishda xatolik:`, error)
		res.status(500).json({
			message: "Rasmni o'chirishda xatolik yuz berdi",
			error: error.message,
		})
	}
}
