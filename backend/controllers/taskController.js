const Task = require('../models/taskModel');

// @desc    Get tasks for the logged-in user
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('GET TASKS ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a task for the logged-in user
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // THE FIX: If dueDate is an empty string or falsy, use null instead.
    const taskData = {
      title,
      description,
      priority,
      dueDate: dueDate || null, 
      user: req.user.id,
    };

    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (error) {
    // This will now show the specific database error in your backend terminal
    console.error('CREATE TASK ERROR:', error); 
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a task belonging to the logged-in user
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(4404).json({ error: 'Task not found' });
    }
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // This logic allows for partial updates
    const { title, description, status, priority, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    console.error('UPDATE TASK ERROR:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Delete a task belonging to the logged-in user
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('DELETE TASK ERROR:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};