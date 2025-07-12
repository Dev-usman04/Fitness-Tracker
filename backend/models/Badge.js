const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Badge', BadgeSchema); 