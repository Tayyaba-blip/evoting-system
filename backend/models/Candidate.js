const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  tempPassword: { type: String },
  mustChangePassword: { type: Boolean, default: true },
  cnic: { type: String, required: true, unique: true },
  constituency: { type: String },
  tehsil: { type: String },
  city: { type: String },
  province: { type: String },
  electionType: { type: String, enum: ['MNA', 'MPA'], required: true },
  party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', default: null },
  symbol: { type: String },
  photo: { type: String },
  totalVotes: { type: Number, default: 0 },
  role: { type: String, default: 'candidate' },
  resetOtp: { type: String },
  resetOtpExpiry: { type: Date },
  notifications: [{
    message: { type: String },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

candidateSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

candidateSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Candidate', candidateSchema);