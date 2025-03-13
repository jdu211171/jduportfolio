const BookmarkService = require('../services/bookmarkService');

class BookmarkController {
  // Method to toggle bookmark
  async toggleBookmark(req, res) {
    const { recruiterId, studentId } = req.body;

    try {
      const result = await BookmarkService.toggleBookmark(recruiterId, studentId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Method to get students with bookmark status
  async getStudentsWithBookmarkStatus(req, res) {
    const recruiterId = req.user.id; // Assuming the recruiter ID is stored in req.user

    try {
      const students = await BookmarkService.getStudentsWithBookmarkStatus(recruiterId);
      res.status(200).json(students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new BookmarkController();
