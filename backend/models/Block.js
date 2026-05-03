const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  voteData: { type: Object, required: true },
  previousHash: { type: String, required: true },
  hash: { type: String, required: true },
  nonce: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Block', blockSchema);