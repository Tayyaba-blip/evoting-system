const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: false },
  isEnded: { type: Boolean, default: false },
  electionType: { type: String, enum: ['MNA', 'MPA', 'Both'], default: 'Both' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);