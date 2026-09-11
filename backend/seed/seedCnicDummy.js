require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const CnicDummy = require('../models/CnicDummy');

const dummyCNICs = [
    {
    cnicNumber: '35201-8487910-0',
    firstName: 'Tayyaba',
    middleName: '',
    lastName: 'Akram',
    dateOfBirth: '2004-06-07',
    gender: 'Female',
    address: 'House 12/B, Muhalla Main Bazar, Nabipura, Lalpul,',
    district: 'Lahore',
    city: 'Lahore',
    area: 'Mughalpura',
    tehsil: 'Lahore City',
    province: 'Punjab',
    cnicExpiry: '2032-09-02',
  },
  // {
  //   cnicNumber: '35202-1234567-1',
  //   firstName: 'Ahmed',
  //   middleName: 'Ali',
  //   lastName: 'Khan',
  //   dateOfBirth: '1990-05-15',
  //   gender: 'Male',
  //   address: 'House 12, Street 4, Gulberg III',
  //   district: 'Lahore',
  //   city: 'Lahore',
  //   area: 'Gulberg',
  //   tehsil: 'Lahore City',
  //   province: 'Punjab',
  //   cnicExpiry: '2030-05-15',
  // },
  // {
  //   cnicNumber: '35202-7654321-2',
  //   firstName: 'Fatima',
  //   middleName: '',
  //   lastName: 'Malik',
  //   dateOfBirth: '1995-08-22',
  //   gender: 'Female',
  //   address: 'Flat 3B, DHA Phase 5',
  //   district: 'Lahore',
  //   city: 'Lahore',
  //   area: 'DHA',
  //   tehsil: 'Lahore Cantt',
  //   province: 'Punjab',
  //   cnicExpiry: '2032-08-22',
  // },
  // {
  //   cnicNumber: '42301-9876543-3',
  //   firstName: 'Zainab',
  //   middleName: 'Noor',
  //   lastName: 'Hussain',
  //   dateOfBirth: '1988-11-30',
  //   gender: 'Female',
  //   address: 'House 45, Block B, North Nazimabad',
  //   district: 'Karachi',
  //   city: 'Karachi',
  //   area: 'North Nazimabad',
  //   tehsil: 'Karachi Central',
  //   province: 'Sindh',
  //   cnicExpiry: '2028-11-30',
  // },
  // {
  //   cnicNumber: '17301-1122334-4',
  //   firstName: 'Usman',
  //   middleName: '',
  //   lastName: 'Farooq',
  //   dateOfBirth: '1992-03-10',
  //   gender: 'Male',
  //   address: 'Plot 7, Hayatabad Phase 2',
  //   district: 'Peshawar',
  //   city: 'Peshawar',
  //   area: 'Hayatabad',
  //   tehsil: 'Peshawar City',
  //   province: 'KPK',
  //   cnicExpiry: '2031-03-10',
  // },
  // {
  //   cnicNumber: '52101-5544332-5',
  //   firstName: 'Sana',
  //   middleName: '',
  //   lastName: 'Baloch',
  //   dateOfBirth: '1993-07-18',
  //   gender: 'Female',
  //   address: 'Street 9, Satellite Town',
  //   district: 'Quetta',
  //   city: 'Quetta',
  //   area: 'Satellite Town',
  //   tehsil: 'Quetta',
  //   province: 'Balochistan',
  //   cnicExpiry: '2029-07-18',
  // },
  // {
  //   cnicNumber: '35202-9988776-6',
  //   firstName: 'Muhammad',
  //   middleName: 'Bilal',
  //   lastName: 'Chaudhry',
  //   dateOfBirth: '1985-12-05',
  //   gender: 'Male',
  //   address: 'House 33, Model Town',
  //   district: 'Lahore',
  //   city: 'Lahore',
  //   area: 'Model Town',
  //   tehsil: 'Lahore City',
  //   province: 'Punjab',
  //   cnicExpiry: '2027-12-05',
  // },
  // {
  //   cnicNumber: '37405-1234000-7',
  //   firstName: 'Ayesha',
  //   middleName: '',
  //   lastName: 'Rehman',
  //   dateOfBirth: '1997-04-25',
  //   gender: 'Female',
  //   address: 'House 1, Satellite Town, Rawalpindi',
  //   district: 'Rawalpindi',
  //   city: 'Rawalpindi',
  //   area: 'Satellite Town',
  //   tehsil: 'Rawalpindi',
  //   province: 'Punjab',
  //   cnicExpiry: '2033-04-25',
  // },
  // {
  //   cnicNumber: '42201-3214567-8',
  //   firstName: 'Hassan',
  //   middleName: 'Raza',
  //   lastName: 'Shah',
  //   dateOfBirth: '1991-09-12',
  //   gender: 'Male',
  //   address: 'Clifton Block 4',
  //   district: 'Karachi',
  //   city: 'Karachi',
  //   area: 'Clifton',
  //   tehsil: 'Karachi South',
  //   province: 'Sindh',
  //   cnicExpiry: '2030-09-12',
  // },
  // {
  //   cnicNumber: '13101-9001234-9',
  //   firstName: 'Imran',
  //   middleName: '',
  //   lastName: 'Niazi',
  //   dateOfBirth: '1982-06-20',
  //   gender: 'Male',
  //   address: 'Bani Gala, Islamabad',
  //   district: 'Islamabad',
  //   city: 'Islamabad',
  //   area: 'Bani Gala',
  //   tehsil: 'Islamabad',
  //   province: 'Punjab',
  //   cnicExpiry: '2026-06-20',
  // },
  // {
  //   cnicNumber: '35401-7770001-0',
  //   firstName: 'Mariam',
  //   middleName: '',
  //   lastName: 'Nawaz',
  //   dateOfBirth: '1973-10-28',
  //   gender: 'Female',
  //   address: 'Jati Umra, Raiwind',
  //   district: 'Lahore',
  //   city: 'Lahore',
  //   area: 'Raiwind',
  //   tehsil: 'Raiwind',
  //   province: 'Punjab',
  //   cnicExpiry: '2028-10-28',
  // },
];

const seedCnics = async () => {
  await connectDB()

  try {
    await CnicDummy.deleteMany({});
    console.log('🗑️  Cleared existing CNIC records.');

    await CnicDummy.insertMany(dummyCNICs);
    console.log(`✅ Successfully seeded ${dummyCNICs.length} dummy CNIC records.`);
    console.log('\n📋 Available CNICs for testing:');
    dummyCNICs.forEach((c) => {
      console.log(`   ${c.cnicNumber} → ${c.firstName} ${c.lastName} (${c.province})`);
    });
  } catch (err) {
    console.error('❌ CNIC Seed Error:', err.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedCnics();