const express = require('express');
const Reminder = require('../models/Reminder');
const jwt = require('jsonwebtoken');

const router = express.Router();

function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// Create reminder
router.post('/', auth, async (req, res) => {
  try {
    const reminder = new Reminder({ ...req.body, user: req.user.id });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all reminders for user
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user.id }).sort({ time: -1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 