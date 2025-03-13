const express = require('express');
const LogController = require('../controllers/logController');

const router = express.Router();

router.post('/', LogController.createLog);

router.get('/:id', LogController.getLogById);

router.put('/:id', LogController.updateLog);

router.delete('/:id', LogController.deleteLog);

router.get('/', LogController.getAllLogs);

module.exports = router;
