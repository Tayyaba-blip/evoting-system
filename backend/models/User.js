const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, required: true, trim: true },
  cnicNumber: { type: String, required: true, unique: true, trim: true },
  cnicExpiry: { type: String },
  dateOfBirth: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: { type: String },
  district: { type: String },
  city: { type: String },
  area: { type: String },
  tehsil: { type: String },
  province: { type: String },
  password: { type: String, required: true, minlength: 6 },
  profileImage: { type: String },
  cnicFrontImage: { type: String },
  cnicBackImage: { type: String },
  faceDescriptor: { type: [Number], default: [] },
  additionalImages: [{ type: String }],
  role: { type: String, default: 'voter' },
  isVerified: { type: Boolean, default: false },
  hasVotedMNA: { type: Boolean, default: false },
  hasVotedMPA: { type: Boolean, default: false },
  notifications: [{
    message: { type: String },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);