const express = require('express');
const BookmarkController = require('../controllers/bookmarkController');
const router = express.Router();

// Route to toggle bookmark
router.post('/toggle', BookmarkController.toggleBookmark.bind(BookmarkController));

// Route to get students with bookmark status
router.get('/students', BookmarkController.getStudentsWithBookmarkStatus.bind(BookmarkController));

module.exports = router;
