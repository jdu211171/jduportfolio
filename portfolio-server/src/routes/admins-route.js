const express = require('express');
const AdminController = require('../controllers/adminController');
const router = express.Router();

router.post('/', AdminController.create);
router.get('/:id', AdminController.getById);
router.put('/:id', AdminController.update);
router.delete('/:id', AdminController.delete);

module.exports = router;
