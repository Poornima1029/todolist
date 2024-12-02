const express = require('express');
const Todo = require('../models/Todo');
const router = express.Router();

// Route to get all todos
router.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find(); 
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to add a new todo with priority, completion status, and deadline
router.post('/todos', async (req, res) => {
  const { task, date, priority, completed, deadline, category } = req.body;

  try {
    const newTodo = new Todo({
      task,
      date: new Date(date),
      priority,
      completed,
      deadline: new Date(deadline),
      category
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to delete a todo by ID
router.delete('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to update a todo (e.g., mark as completed)
router.patch('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true }
    );
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
