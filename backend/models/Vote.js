const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  electionType: { type: String, enum: ['MNA', 'MPA'], required: true },
  tehsil: { type: String, required: true },
  province: { type: String },
  blockHash: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Vote', voteSchema);