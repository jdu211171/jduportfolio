const express = require('express');
const router = express.Router();
const KintoneController = require('../controllers/kintoneController');

router.get('/', KintoneController.getAll);
router.post('/getby', KintoneController.getBy);
router.post('/', KintoneController.create);
router.post('/sync', KintoneController.sync);
router.put('/:id', KintoneController.update);
router.delete('/:id', KintoneController.delete);

module.exports = router;
