const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  // --- NEW FIELDS ---
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['todo', 'doing', 'done'], // Can only be one of these values
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'], // Can only be one of these values
    default: 'medium',
  },
  dueDate: {
    type: Date,
    default: null,
  },
  // --- END OF NEW FIELDS ---
}, {
  timestamps: true, // This adds createdAt and updatedAt fields automatically
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;