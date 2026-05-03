const mongoose = require('mongoose');

const cnicDummySchema = new mongoose.Schema({
  cnicNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  dateOfBirth: { type: String },
  gender: { type: String },
  address: { type: String },
  district: { type: String },
  city: { type: String },
  area: { type: String },
  tehsil: { type: String },
  province: { type: String },
  cnicExpiry: { type: String },
  isRegistered: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('CnicDummy', cnicDummySchema);