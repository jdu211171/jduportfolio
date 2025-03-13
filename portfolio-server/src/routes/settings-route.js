const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingController');

router.get('/:key', SettingsController.getSetting); // Get specific setting by key
router.put('/:key', SettingsController.updateSetting); // Update setting by key
router.get('/', SettingsController.getAllSettings); // Get all settings
router.post('/keys', SettingsController.getSettingsByKeys);


module.exports = router;
