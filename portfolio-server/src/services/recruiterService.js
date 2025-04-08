const bcrypt = require('bcrypt')
const generatePassword = require('generate-password');
const { Recruiter } = require('../models')

class RecruiterService {
	// Service method to create a new recruiter
	// static async createRecruiter(recruiterData) {
	// 	try {
	// 		const newRecruiter = await Recruiter.create(recruiterData)
	// 		return newRecruiter
	// 	} catch (error) {
	// 		throw error // Throw the error for the controller to handle
	// 	}
		
	// }
	static async createRecruiter(recruiterData) {
		try {
		  // Parolni hash qilish (agar berilgan bo'lsa)
		  if (recruiterData.password) {
			const salt = await bcrypt.genSalt(10);
			recruiterData.password = await bcrypt.hash(recruiterData.password, salt);
		  }
		  const newRecruiter = await Recruiter.create(recruiterData);
		  return newRecruiter;
		} catch (error) {
		  throw error; // Throw the error for the controller to handle
		}
	  }

	// Service method to retrieve all recruiters
	static async getAllRecruiters(filter) {
		try {
			let query = {} // Initialize an empty query object
			const searchableColumns = [
				'email',
				'first_name',
				'last_name',
				'company_name',
				'company_description',
				'phone',
			] // Example list of searchable columns

			// Iterate through filter keys
			Object.keys(filter).forEach(key => {
				if (filter[key]) {
					// Handle different types of filter values
					if (key === 'search') {
						// Search across all searchable columns
						query[Op.or] = searchableColumns.map(column => {
							// Use Op.iLike for case insensitive search on other columns
							return { [column]: { [Op.iLike]: `%${filter[key]}%` } }
						})
					} else if (Array.isArray(filter[key])) {
						// If filter value is an array, use $in operator
						query[key] = { [Op.in]: filter[key] }
					} else if (typeof filter[key] === 'string') {
						query[key] = { [Op.like]: `%${filter[key]}%` }
					} else {
						// Handle other types of filter values as needed
						query[key] = filter[key]
					}
				}
			})
			const recruiters = await Recruiter.findAll({ where: query })
			return recruiters
		} catch (error) {
			throw error
		}
	}

	// Service method to retrieve a recruiter by ID
	static async getRecruiterById(recruiterId, password = false) {
		try {
			let excluded = ['createdAt', 'updatedAt']
			if (!password) {
				excluded.push('password')
			}
			const recruiter = await Recruiter.findByPk(recruiterId, {
				attributes: { exclude: excluded },
			})
			if (!recruiter) {
				throw new Error('Recruiter not found')
			}
			return recruiter
		} catch (error) {
			throw error
		}
	}

	static async getRecruiterByIdWithPassword(recruiterId) {
		try {
			const recruiter = await Recruiter.findByPk(recruiterId)
			if (!recruiter) {
				throw new Error('Recruiter not found')
			}
			return recruiter
		} catch (error) {
			throw error
		}
	}

	static async updateRecruiter(id, data) {
		try {
			const recruiter = await Recruiter.findByPk(id)
			if (!recruiter) {
				throw new Error('Recruiter not found')
			}

			const updatedData = {
				first_name: data.first_name,
				last_name: data.last_name,
				phone: data.phone,
				email: data.email,
				company_name: data.company_name,
				company_description: data.company_description,
				gallery: data.gallery,
				photo: data.photo,
				date_of_birth: data.date_of_birth,
				active: data.active,
				kintone_id: data.kintone_id,
			}

			// if (data.password) {
			// 	updatedData.password = data.password
			// }
			if (data.password) {
				const salt = await bcrypt.genSalt(10);
				updatedData.password = await bcrypt.hash(data.password, salt);
			}

			await recruiter.update(updatedData)
			return recruiter;
		} catch (error) {
			throw error
		}
	}

	static async deleteRecruiter(recruiterId) {
		try {
			await Recruiter.destroy({ where: { kintone_id: recruiterId } })
		} catch (error) {
			console.error('Error deleting recruiter:', error)
			throw error
		}
	}

	// static async syncRecruiterData(recruiterData) {
	// 	try {
	// 	  for (const data of recruiterData) {
	// 		const existing = await Recruiter.findOne({ where: { kintone_id: data.kintone_id } });
	// 		if (existing) {
	// 		  await existing.update(data);
	// 		} else {
	// 		  await Recruiter.create(data);
	// 		}
	// 	  }
	// 	  console.log('Recruiter ma\'lumotlari muvaffaqiyatli sinxronlashtirildi');
	// 	} catch (error) {
	// 	  console.error('Recruiter ma\'lumotlarini sinxronlashtirishda xato:', error);
	// 	  throw error;
	// 	}
	// }

	static async syncRecruiterData(recruiterData) {
        try {
            for (const data of recruiterData) {
                const existing = await Recruiter.findOne({ where: { kintone_id: data.kintone_id } });
                if (existing) {
                    await existing.update(data);
                } else {
                    // Generate a plain password
                    const plainPassword = generatePassword.generate({ 
                        length: 12, 
                        numbers: true 
                    });
                    
                    // Send welcome email with plain password
                    await EmailService.EmailToRecruiter(
                        data.email,
                        plainPassword,
                        data.first_name,
                        data.last_name
                    );

                    // Hash the password for storage
                    const salt = await bcrypt.genSalt(10);
                    data.password = await bcrypt.hash(plainPassword, salt);

                    // Create the new recruiter
                    await Recruiter.create(data);
                }
            }
            console.log('Recruiter ma\'lumotlari muvaffaqiyatli sinxronlashtirildi');
        } catch (error) {
            console.error('Recruiter ma\'lumotlarini sinxronlashtirishda xato:', error);
            throw error;
        }
    }
}

module.exports = RecruiterService
