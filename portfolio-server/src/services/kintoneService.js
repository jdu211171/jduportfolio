const axios = require('axios');
const kintoneConfig = require('../config/kintoneConfig');
const StudentService = require('./studentService');

class KintoneService {
  static baseUrl = process.env.KINTONE_API_BASE_URL;

  static getAppConfig(appName) {
    const appConfig = kintoneConfig[appName];
    if (!appConfig) {
      throw new Error(`App configuration for ${appName} not found.`);
    }
    return appConfig;
  }

  // Service method to retrieve all records
  static async getAllRecords(appName) {
    try {
      const { appId, token } = this.getAppConfig(appName);
      let allRecords = [];
      let offset = 0;
      let hasMoreRecords = true;

      while (hasMoreRecords) {
        const response = await axios.get(`${this.baseUrl}/k/v1/records.json`, {
          headers: {
            'X-Cybozu-API-Token': token,
          },
          params: {
            app: appId,
            query: `limit 100 offset ${offset}`   // Limit per request (maximum is 100)
          },
        });

        // Add the current batch of records to the allRecords array
        allRecords = allRecords.concat(response.data.records);
        // Check if more records are available (if the response contains 100 records)
        hasMoreRecords = response.data.records.length === 100;

        // Increment offset for next batch
        offset += 100;
      }

      let data = {
        records: allRecords
      }
      return data;
    } catch (error) {
      console.error('Error fetching records from Kintone:', error.message);
      console.error('Error details:', error.response ? error.response.data : error);
      throw error;
    }
  }


  // Service method to retrieve records by column name and value
  static async getRecordBy(appName, colName, colValue) {
    try {
      const { appId, token } = this.getAppConfig(appName);

      let allRecords = [];
      let offset = 0;
      let hasMoreRecords = true;

      let query;

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
        });

        // Add the current batch of records to the allRecords array
        allRecords = allRecords.concat(response.data.records);
        // Check if more records are available (if the response contains 100 records)
        hasMoreRecords = response.data.records.length === 100;

        // Increment offset for next batch
        offset += 100;
      }

      let data = {
        records: allRecords
      }
      return data;
    } catch (error) {
      console.error(`Error fetching record by ${colName} from Kintone:`, error.message);
      console.error('Error details:', error.response ? error.response.data : error);
      throw error;
    }
  }

  // Service method to create a new record
  static async createRecord(appName, data) {
    try {
      const { appId, token } = this.getAppConfig(appName);
      console.log(`Creating record in app ${appId} with data:`, data);

      const response = await axios.post(`${this.baseUrl}/k/v1/record.json`, {
        app: appId,
        record: data,
      }, {
        headers: {
          'X-Cybozu-API-Token': token,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating record in Kintone:', error.message);
      console.error('Error details:', error.response ? error.response.data : error);
      throw error;
    }
  }

  // Service method to update a record
  static async updateRecord(appName, recordId, data) {
    try {
      const { appId, token } = this.getAppConfig(appName);
      console.log(`Updating record ${recordId} in app ${appId} with data:`, data);

      const response = await axios.put(`${this.baseUrl}/k/v1/record.json`, {
        app: appId,
        id: recordId,
        record: data,
      }, {
        headers: {
          'X-Cybozu-API-Token': token,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error updating record in Kintone:', error.message);
      console.error('Error details:', error.response ? error.response.data : error);
      throw error;
    }
  }

  // Service method to delete a record
  static async deleteRecord(appName, recordId) {
    try {
      const { appId, token } = this.getAppConfig(appName);
      console.log(`Deleting record ${recordId} from app ${appId}`);

      const response = await axios.delete(`${this.baseUrl}/k/v1/record.json`, {
        headers: {
          'X-Cybozu-API-Token': token,
        },
        data: {
          app: appId,
          ids: [recordId],
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error deleting record from Kintone:', error.message);
      console.error('Error details:', error.response ? error.response.data : error);
      throw error;
    }
  }

  // Service method to delete a record
  static async syncData() {
    try {
      let students = (await this.getAllRecords("students")).records
      
      let certificate_jlpt = (await this.getAllRecords("certificate_jlpt")).records
      let certificate_jdu_jlpt = (await this.getAllRecords("certificate_jdu_jlpt")).records
      let certificate_ielts = (await this.getAllRecords("certificate_ielts")).records
      let certificate_benron = (await this.getAllRecords("certificate_benron")).records
      let certificate_it_contest = (await this.getAllRecords("certificate_it_contest")).records

      let jlptData = this.formatCertificateData(certificate_jlpt, "level", true);
      let jduJlptData = this.formatCertificateData(certificate_jdu_jlpt, "level", true);
      let ieltsData = this.formatCertificateData(certificate_ielts, "score");
      let benronData = this.formatCertificateData(certificate_benron, "rank", true);
      let itContestData = this.formatCertificateData(certificate_it_contest, "award", true);

      const formattedStudentData = students.map(record => ({
        studentId: record.studentId.value,
        studentName: record.studentName.value,
        mail: record.studentEmail.value,
        jduDate: record.jduEnrollmentDate.value,
        birthday: record.birthDate.value,
        semester: record.semester.value,
        univer: record.partnerUniversity.value,
        レコード番号: record['レコード番号'],
        jlpt: JSON.stringify(jlptData[record.studentId.value] ? jlptData[record.studentId.value] : ""),
        jdu_japanese_certification: JSON.stringify(jduJlptData[record.studentId.value] ? jduJlptData[record.studentId.value] : ""),
        ielts: JSON.stringify(ieltsData[record.studentId.value] ? ieltsData[record.studentId.value] : ""),
        japanese_speech_contest: JSON.stringify(benronData[record.studentId.value] ? benronData[record.studentId.value] : ""),
        it_contest: JSON.stringify(itContestData[record.studentId.value] ? itContestData[record.studentId.value] : ""),
      }));

      let result = await StudentService.syncStudentData(formattedStudentData);
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  static formatCertificateData(certificateJlpt, level, isReverse) {
    const data = {};
    // console.log(certificateJlpt, level, isReverse)
    certificateJlpt.forEach(record => {
      const studentId = record.studentId.value;
      const nLevel = record[level].value;
      const date = record.date.value;

      if (!data[studentId]) {
        data[studentId] = {
          highest: nLevel,
          list: [{ level: nLevel, date: date }]
        };
      } else {
        data[studentId].list.push({ level: nLevel, date: date });

        // Update the highest level if the current level is higher
        if (this.isHigherLevel(nLevel, data[studentId].highest, isReverse)) {
          data[studentId].highest = nLevel;
        }
      }
    });

    return data;
  }

  static extractLevelNumber(level) {
    const match = level.match(/\d+/); // Extract digits from the string
    return match ? parseInt(match[0], 10) : null;
  }

  static isHigherLevel(level1, level2, isReverse = false) {
    const level1Number = this.extractLevelNumber(level1);
    const level2Number = this.extractLevelNumber(level2);

    // Ensure that levels are valid and numbers are extracted
    if (level1Number === null || level2Number === null) {
      throw new Error("Invalid level format.");
    }

    // Compare the numeric values
    if (isReverse) {
      return level1Number < level2Number;
    } else {
      return level1Number > level2Number;
    }// Lower number means a higher level
  }



}

module.exports = KintoneService;
