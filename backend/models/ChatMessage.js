const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  anonymousId: { type: String, required: true },
  room: { type: String, default: 'general' },
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);