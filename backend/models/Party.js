const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  abbreviation: { type: String, required: true },
  leaderName: { type: String },
  foundedYear: { type: Number },
  flag: { type: String },
  history: { type: String },
  isIndependent: { type: Boolean, default: false },
  totalVotes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Party', partySchema);