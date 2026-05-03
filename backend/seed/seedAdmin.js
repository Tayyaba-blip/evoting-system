require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  await connectDB();
  const Admin = require('../models/Admin');
  const existing = await Admin.findOne({ email: 'admin@ecp.gov.pk' });
  if (existing) { console.log('✅ Admin already exists: admin@ecp.gov.pk'); process.exit(); }
  const admin = await Admin.create({ name: 'Election Commissioner', email: 'admin@ecp.gov.pk', password: 'Admin@1234' });
  console.log('✅ Admin seeded successfully!');
  console.log('   Email: admin@ecp.gov.pk');
  console.log('   Password: Admin@1234');
  process.exit();
};

seedAdmin().catch(err => { console.error(err); process.exit(1); });