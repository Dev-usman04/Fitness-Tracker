const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  workoutType: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  email: { type: String, required: true },
  notes: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', ReminderSchema); 