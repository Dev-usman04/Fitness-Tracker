const express = require('express');
const Badge = require('../models/Badge');
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

// Create badge
router.post('/', auth, async (req, res) => {
  try {
    const badge = new Badge({ ...req.body, user: req.user.id });
    await badge.save();
    res.status(201).json(badge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all badges for user
router.get('/', auth, async (req, res) => {
  try {
    const badges = await Badge.find({ user: req.user.id }).sort({ earnedAt: -1 });
    res.json(badges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update badge
router.put('/:id', auth, async (req, res) => {
  try {
    const badge = await Badge.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!badge) return res.status(404).json({ message: 'Badge not found' });
    res.json(badge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete badge
router.delete('/:id', auth, async (req, res) => {
  try {
    const badge = await Badge.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!badge) return res.status(404).json({ message: 'Badge not found' });
    res.json({ message: 'Badge deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 