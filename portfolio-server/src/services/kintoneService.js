const axios = require('axios')
const kintoneConfig = require('../config/kintoneConfig')
const StudentService = require('./studentService')

class KintoneService {
	static baseUrl = process.env.KINTONE_API_BASE_URL

	static getAppConfig(appName) {
		const appConfig = kintoneConfig[appName]
		if (!appConfig) {
			throw new Error(`App configuration for ${appName} not found.`)
		}
		return appConfig
	}

	// Service method to retrieve all records
	static async getAllRecords(appName) {
		try {
			const { appId, token } = this.getAppConfig(appName)
			let allRecords = []
			let offset = 0
			let hasMoreRecords = true

			while (hasMoreRecords) {
				const response = await axios.get(`${this.baseUrl}/k/v1/records.json`, {
					headers: {
						'X-Cybozu-API-Token': token,
					},
					params: {
						app: appId,
						query: `limit 100 offset ${offset}`, // Limit per request (maximum is 100)
					},
				})

				// Add the current batch of records to the allRecords array
				allRecords = allRecords.concat(response.data.records)
				// Check if more records are available (if the response contains 100 records)
				hasMoreRecords = response.data.records.length === 100

				// Increment offset for next batch
				offset += 100
			}

			let data = {
				records: allRecords,
			}
			return data
		} catch (error) {
			console.error('Error fetching records from Kintone:', error.message)
			console.error(
				'Error details:',
				error.response ? error.response.data : error
			)
			throw error
		}
	}

	// Service method to retrieve records by column name and value
	static async getRecordBy(appName, colName, colValue) {
		try {
			const { appId, token } = this.getAppConfig(appName)

			let allRecords = []
			let offset = 0
			let hasMoreRecords = true

			let query

			while (hasMoreRecords) {
				query = `${colName} = "${colValue}" limit 100 offset ${offset}`
				const response = await axios.get(`${this.baseUrl}/k/v1/records.json`, {
					headers: {
						'X-Cybozu-API-Token': token,
					},
					params: {
						app: appId,
						query: query,
					},
				})

				// Add the current batch of records to the allRecords array
				allRecords = allRecords.concat(response.data.records)
				// Check if more records are available (if the response contains 100 records)
				hasMoreRecords = response.data.records.length === 100

				// Increment offset for next batch
				offset += 100
			}

			let data = {
				records: allRecords,
			}
			return data
		} catch (error) {
			console.error(
				`Error fetching record by ${colName} from Kintone:`,
				error.message
			)
			console.error(
				'Error details:',
				error.response ? error.response.data : error
			)
			throw error
		}
	}

	// Service method to create a new record
	static async createRecord(appName, data) {
		try {
			const { appId, token } = this.getAppConfig(appName)
			// console.log(`Creating record in app ${appId} with data:`, data)

			const response = await axios.post(
				`${this.baseUrl}/k/v1/record.json`,
				{
					app: appId,
					record: data,
				},
				{
					headers: {
						'X-Cybozu-API-Token': token,
					},
				}
			)

			return response.data
		} catch (error) {
			console.error('Error creating record in Kintone:', error.message)
			console.error(
				'Error details:',
				error.response ? error.response.data : error
			)
			throw error
		}
	}

	// Service method to update a record
	static async updateRecord(appName, recordId, data) {
		try {
			const { appId, token } = this.getAppConfig(appName)
			// console.log(
			// 	`Updating record ${recordId} in app ${appId} with data:`,
			// 	data
			// )

			const response = await axios.put(
				`${this.baseUrl}/k/v1/record.json`,
				{
					app: appId,
					id: recordId,
					record: data,
				},
				{
					headers: {
						'X-Cybozu-API-Token': token,
					},
				}
			)

			return response.data
		} catch (error) {
			console.error('Error updating record in Kintone:', error.message)
			console.error(
				'Error details:',
				error.response ? error.response.data : error
			)
			throw error
		}
	}

	// Service method to delete a record
	// static async deleteRecord(appName, recordId) {
	// 	try {
	// 		const { appId, token } = this.getAppConfig(appName)
	// 		console.log(`Deleting record ${recordId} from app ${appId}`)

	// 		const response = await axios.post(`${this.baseUrl}/k/v1/record.json`, {
	// 			headers: {
	// 				'X-Cybozu-API-Token': token,
	// 			},
	// 			data: {
	// 				app: appId,
	// 				ids: [recordId],
	// 			},
	// 		})

	// 		return response.data
	// 	} catch (error) {
	// 		console.error('Error deleting record from Kintone:', error.message)
	// 		console.error(
	// 			'Error details:',
	// 			error.response ? error.response.data : error
	// 		)
	// 		throw error
	// 	}
	// }
	static async deleteRecord(appName, recordId) {
		try {
			const { appId, token } = this.getAppConfig(appName);
			// console.log(`Deleting record ${recordId} from app ${appId}`); // Debugging uchun
	
			const response = await axios.post(
				`${this.baseUrl}/k/v1/records.json`,
				{
					app: appId,
					ids: [recordId], // O'chiriladigan yozuvlar ID'si
				},
				{
					headers: {
						'X-Cybozu-API-Token': token,
					},
				}
			);
	
			return response.data;
		} catch (error) {
			console.error('Error deleting record from Kintone:', error.message);
			console.error('Error details:', error.response ? error.response.data : error);
			throw error;
		}
	}

	// Service method to delete a record
	// static async syncData() {
	// 	try {
	// 		 const students = (await this.getAllRecords('students')).records;
    //         const credits = (await this.getAllRecords('student_credits')).records; // Yangi credits app
            
    //         // Sertifikatlar
    //         const ieltsCerts = (await this.getAllRecords('student_ielts')).records;
    //         const itContestCerts = (await this.getAllRecords('student_it_contest')).records;
    //         const jlptCerts = (await this.getAllRecords('student_jlpt')).records;
    //         const benronCerts = (await this.getAllRecords('student_benron_taikai')).records;
    //         const jduNinteiCerts = (await this.getAllRecords('student_jdu_ninteishiken')).records;

	// 		const creditsMap = new Map();
    //         credits.forEach(rec => {
    //             creditsMap.set(rec.studentId.value, {
    //                 worldLanguageUniversityCredits: rec.worldLanguageUniversityCredits.value,
    //                 businessSkillsCredits: rec.businessSkillsCredits.value,
    //                 japaneseEmploymentCredits: rec.japaneseEmploymentCredits.value,
    //                 liberalArtsEducationCredits: rec.liberalArtsEducationCredits.value,
    //                 totalCredits: rec.totalCredits.value,
    //                 specializedEducationCredits: rec.specializedEducationCredits.value,
    //                 partnerUniversityCredits: rec.partnerUniversityCredits.value,
    //             });
    //         });

	// 		const ieltsData = this.formatCertificateData(ieltsCerts, 'ielts');
    //         const itContestData = this.formatCertificateData(itContestCerts, 'it_contest', true);
    //         const jlptData = this.formatCertificateData(jlptCerts, 'jlptCertificate', true);
    //         const benronData = this.formatCertificateData(benronCerts, 'japanese_speech_contest', true);
    //         const jduNinteiData = this.formatCertificateData(jduNinteiCerts, 'jdu_japanese_certification', true);

	// 		// const formattedStudentData = students.map(record => ({
	// 		// 	studentId: record.studentId?.value,
	// 		// 	// studentName: record.studentName.value,
	// 		// 	studentFirstName: record.studentFirstName.value, // To‘g‘ri nom
    // 		// 	studentLastName: record.studentLastName.value, // To‘g‘ri nom

	// 		// 	mail: record.studentEmail.value,
	// 		// 	jduDate: record.jduEnrollmentDate.value,
	// 		// 	birthday: record.birthDate.value,
	// 		// 	semester: record.semester.value,
	// 		// 	univer: record.partnerUniversity.value,
	// 		// 	// レコード番号: record['amallarniレコード番号'],
	// 		// 	kintone_id_value: record['レコード番号']?.value || record.$id?.value,

	// 		// 	jlpt: JSON.stringify(
	// 		// 		jlptData[record.studentId.value]
	// 		// 			? jlptData[record.studentId.value]
	// 		// 			: ''
	// 		// 	),
	// 		// 	jdu_japanese_certification: JSON.stringify(
	// 		// 		jduJlptData[record.studentId.value]
	// 		// 			? jduJlptData[record.studentId.value]
	// 		// 			: ''
	// 		// 	),
	// 		// 	ielts: JSON.stringify(
	// 		// 		ieltsData[record.studentId.value]
	// 		// 			? ieltsData[record.studentId.value]
	// 		// 			: ''
	// 		// 	),
	// 		// 	japanese_speech_contest: JSON.stringify(
	// 		// 		benronData[record.studentId.value]
	// 		// 			? benronData[record.studentId.value]
	// 		// 			: ''
	// 		// 	),
	// 		// 	it_contest: JSON.stringify(
	// 		// 		itContestData[record.studentId.value]
	// 		// 			? itContestData[record.studentId.value]
	// 		// 			: ''
	// 		// 	),
	// 		// 	// New Fields 
	// 		// 	graduation_year: record.graduation_year?.value || null, 
    //         //     graduation_season: record.graduation_season?.value || null, 
    //         //     language_skills: record.language_skills?.value || null,  
	// 		// }))
	// 		 const formattedStudentData = students.map(record => {
    //             const studentId = record.studentId?.value;
    //             const studentCredits = creditsMap.get(studentId) || {}; // Agar kredit topilmasa, bo'sh obyekt

    //             return {
    //                 // Yangi asosiy maydonlar
    //                 studentId: studentId,
    //                 studentFirstName: record.studentFirstName?.value,
    //                 studentLastName: record.studentLastName?.value,
    //                 birthday: record.birthday?.value,
    //                 gender: record.gender?.value,
    //                 address: record.address?.value,
    //                 mail: record.mail?.value,
    //                 phoneNumber: record.phoneNumber?.value,
    //                 parentsPhoneNumber: record.parentsPhoneNumber?.value,
    //                 jduDate: record.jduDate?.value,
    //                 partnerUniversity: record.partnerUniversity?.value,
    //                 partnerUniversityEnrollmentDate: record.partnerUniversityEnrollmentDate?.value,
    //                 semester: record.semester?.value,
    //                 studentStatus: record.studentStatus?.value,
    //                 kintone_id_value: record['レコード番号']?.value || record.$id?.value,

    //                 // Kreditlar
    //                 ...studentCredits,

    //                 // Sertifikatlar (JSON string ko'rinishida)
    //                 ielts: JSON.stringify(ieltsData[studentId] || ''),
    //                 it_contest: JSON.stringify(itContestData[studentId] || ''),
    //                 jlpt: JSON.stringify(jlptData[studentId] || ''),
    //                 japanese_speech_contest: JSON.stringify(benronData[studentId] || ''),
    //                 jdu_japanese_certification: JSON.stringify(jduNinteiData[studentId] || ''),
    //             };
    //         });
	// 		await StudentService.syncStudentData(formattedStudentData);
	// 	} catch (error) {
	// 		console.log(error)
	// 		throw error
	// 	}
	// }
    
	    static async syncData() {
        try {
            console.log("Sinxronizatsiya boshlandi...");
            const [
                students, credits, ieltsCerts, itContestCerts, 
                jlptCerts, benronCerts, jduNinteiCerts
            ] = await Promise.all([
                this.getAllRecords('students').then(res => res.records),
                this.getAllRecords('student_credits').then(res => res.records),
                this.getAllRecords('student_ielts').then(res => res.records),
                this.getAllRecords('student_it_contest').then(res => res.records),
                this.getAllRecords('student_jlpt').then(res => res.records),
                this.getAllRecords('student_benron_taikai').then(res => res.records),
                this.getAllRecords('student_jdu_ninteishiken').then(res => res.records),
            ]);
            console.log(`${students.length} ta talaba ma'lumoti topildi.`);

            const creditsMap = new Map();
            credits.forEach(rec => {
                creditsMap.set(rec.studentId?.value, {
                    worldLanguageUniversityCredits: rec.worldLanguageUniversityCredits?.value,
                    businessSkillsCredits: rec.businessSkillsCredits?.value,
                    japaneseEmploymentCredits: rec.japaneseEmploymentCredits?.value,
                    liberalArtsEducationCredits: rec.liberalArtsEducationCredits?.value,
                    totalCredits: rec.totalCredits?.value,
                    specializedEducationCredits: rec.specializedEducationCredits?.value,
                    partnerUniversityCredits: rec.partnerUniversityCredits?.value,
                });
            });

            const ieltsData = this.formatCertificateData(ieltsCerts, 'ielts', 'date');
            const itContestData = this.formatCertificateData(itContestCerts, 'it_contest', 'date', true);
            const jlptData = this.formatCertificateData(jlptCerts, 'jlptCertificate', 'jlpt_date', true);
            const benronData = this.formatCertificateData(benronCerts, 'japanese_speech_contest', 'campusDate', true);
            const jduNinteiData = this.formatCertificateData(jduNinteiCerts, 'jdu_japanese_certification', 'date', true);

            const formattedStudentData = students.map(record => {
                const studentId = record.studentId?.value;
                if (!studentId) return null;

                const studentCredits = creditsMap.get(studentId) || {};

                return {
                    studentId,
                    studentFirstName: record.studentFirstName?.value,
                    studentLastName: record.studentLastName?.value,
                    birthday: record.birthday?.value,
                    gender: record.gender?.value,
                    address: record.address?.value,
                    mail: record.mail?.value,
                    phoneNumber: record.phoneNumber?.value,
                    parentsPhoneNumber: record.parentsPhoneNumber?.value,
                    jduDate: record.jduDate?.value,
                    partnerUniversity: record.partnerUniversity?.value,
                    partnerUniversityEnrollmentDate: record.partnerUniversityEnrollmentDate?.value,
                    semester: record.semester?.value,
                    studentStatus: record.studentStatus?.value,
                    kintone_id_value: record['レコード番号']?.value || record.$id?.value,
                    ...studentCredits,
                    ielts: JSON.stringify(ieltsData[studentId] || null),
                    it_contest: JSON.stringify(itContestData[studentId] || null),
                    jlpt: JSON.stringify(jlptData[studentId] || null),
                    japanese_speech_contest: JSON.stringify(benronData[studentId] || null),
                    jdu_japanese_certification: JSON.stringify(jduNinteiData[studentId] || null),
                };
            }).filter(Boolean);

            await StudentService.syncStudentData(formattedStudentData);
            console.log("Sinxronizatsiya muvaffaqiyatli yakunlandi.");

        } catch (error) {
            console.log("KintoneService syncData xatosi:", error);
            throw error;
        }
    }


	// static formatCertificateData(certificateJlpt, level, isReverse) {
	// 	const data = {}
	// 	// console.log(certificateJlpt, level, isReverse)
	// 	certificateJlpt.forEach(record => {
	// 		const studentId = record.studentId.value
	// 		const nLevel = record[level].value
	// 		const date = record.date.value

	// 		if (!data[studentId]) {
	// 			data[studentId] = {
	// 				highest: nLevel,
	// 				list: [{ level: nLevel, date: date }],
	// 			}
	// 		} else {
	// 			data[studentId].list.push({ level: nLevel, date: date })

	// 			// Update the highest level if the current level is higher
	// 			if (this.isHigherLevel(nLevel, data[studentId].highest, isReverse)) {
	// 				data[studentId].highest = nLevel
	// 			}
	// 		}
	// 	})

	// 	return data
	// }
	static formatCertificateData(certificateRecords, levelField, dateField, isReverse) {
        const data = {};
        certificateRecords.forEach(record => {
            const studentId = record.studentId?.value;
            if (!studentId) return; // studentId bo'lmasa, o'tkazib yuborish

            const nLevel = record[levelField]?.value;
            const date = record[dateField]?.value;

            if (!nLevel) return; // level bo'lmasa, o'tkazib yuborish

            const newEntry = { level: nLevel, date: date };
            
            if (!data[studentId]) {
                data[studentId] = {
                    highest: nLevel,
                    list: [newEntry],
                };
            } else {
                data[studentId].list.push(newEntry);
                if (this.isHigherLevel(nLevel, data[studentId].highest, isReverse)) {
                    data[studentId].highest = nLevel;
                }
            }
        });
        return data;
    }

	static extractLevelNumber(level) {
		const match = level.match(/\d+/) // Extract digits from the string
		return match ? parseInt(match[0], 10) : null
	}

	static isHigherLevel(level1, level2, isReverse = false) {
		const level1Number = this.extractLevelNumber(level1)
		const level2Number = this.extractLevelNumber(level2)

		// Ensure that levels are valid and numbers are extracted
		if (level1Number === null || level2Number === null) {
			throw new Error('Invalid level format.')
		}

		// Compare the numeric values
		if (isReverse) {
			return level1Number < level2Number
		} else {
			return level1Number > level2Number
		} // Lower number means a higher level
	}
}

module.exports = KintoneService
