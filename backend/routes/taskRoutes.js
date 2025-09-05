const express = require('express');
const router = express.Router();

// 1. Import your actual controller functions
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController'); // Make sure this path is correct

// 2. Import the 'protect' middleware
const { protect } = require('../middleware/authMiddleware');

// 3. Apply the 'protect' middleware to your routes
// Now, a user must be logged in (i.e., provide a valid token) to access these endpoints
router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;