/**
 * cnicService.js
 * Handles CNIC OCR / parsing logic.
 * In production, integrate with a proper OCR API (e.g. Google Vision, Tesseract, NADRA API).
 * This version provides a mock parser + pattern matching for Pakistan CNICs.
 */

const CnicDummy = require('../models/CnicDummy');

/**
 * Extract CNIC number from raw OCR text.
 * Pakistan CNIC format: XXXXX-XXXXXXX-X
 */
const extractCnicNumber = (text) => {
  const pattern = /\b(\d{5}-\d{7}-\d{1})\b/;
  const match = text.match(pattern);
  return match ? match[1] : null;
};

/**
 * Extract expiry date from CNIC text.
 * Common formats: DD.MM.YYYY or DD/MM/YYYY
 */
const extractExpiryDate = (text) => {
  const pattern = /(\d{2}[./]\d{2}[./]\d{4})/g;
  const matches = [...text.matchAll(pattern)];
  // Usually expiry is the second date found (first is DOB)
  if (matches.length >= 2) {
    return matches[1][0].replace(/\./g, '-');
  }
  return null;
};

/**
 * Extract date of birth from CNIC text.
 */
const extractDOB = (text) => {
  const pattern = /(\d{2}[./]\d{2}[./]\d{4})/g;
  const matches = [...text.matchAll(pattern)];
  if (matches.length >= 1) {
    return matches[0][0].replace(/\./g, '-');
  }
  return null;
};

/**
 * Extract name parts from CNIC text.
 * Pakistan CNICs have Name and Father's Name in Urdu and English.
 */
const extractName = (text) => {
  // Look for lines after "Name" keyword
  const namePattern = /Name[:\s]+([A-Z][A-Z\s]+)/i;
  const match = text.match(namePattern);
  if (match) {
    const fullName = match[1].trim().split(/\s+/);
    return {
      firstName: fullName[0] || '',
      middleName: fullName.length === 3 ? fullName[1] : '',
      lastName: fullName[fullName.length - 1] || '',
    };
  }
  return { firstName: '', middleName: '', lastName: '' };
};

/**
 * Extract gender from CNIC text.
 */
const extractGender = (text) => {
  if (/\bM\b|\bMALE\b/i.test(text)) return 'Male';
  if (/\bF\b|\bFEMALE\b/i.test(text)) return 'Female';
  return '';
};

/**
 * Main CNIC parser — takes raw OCR text and returns structured data.
 * @param {string} ocrText - Raw OCR output from CNIC image
 * @returns {Object} parsed CNIC fields
 */
const parseCnicText = (ocrText) => {
  const text = ocrText || '';
  const nameData = extractName(text);

  return {
    cnicNumber: extractCnicNumber(text),
    dateOfBirth: extractDOB(text),
    cnicExpiry: extractExpiryDate(text),
    gender: extractGender(text),
    ...nameData,
  };
};

/**
 * Verify CNIC against dummy database.
 * Returns matched record or null.
 * @param {string} cnicNumber
 * @param {Object} submittedData - { firstName, lastName }
 */
const verifyCnicAgainstDatabase = async (cnicNumber, submittedData) => {
  const record = await CnicDummy.findOne({ cnicNumber });
  if (!record) {
    return { verified: false, message: 'CNIC not found in national database.' };
  }

  if (record.isRegistered) {
    return { verified: false, message: 'This CNIC has already been used for voter registration.' };
  }

  // Basic name match (case insensitive)
  const firstNameMatch = record.firstName.toLowerCase() === submittedData.firstName?.toLowerCase();
  const lastNameMatch = record.lastName.toLowerCase() === submittedData.lastName?.toLowerCase();

  if (!firstNameMatch || !lastNameMatch) {
    return {
      verified: false,
      message: 'CNIC details do not match national records. Please check your name.',
    };
  }

  return {
    verified: true,
    record: {
      cnicNumber: record.cnicNumber,
      firstName: record.firstName,
      middleName: record.middleName,
      lastName: record.lastName,
      dateOfBirth: record.dateOfBirth,
      gender: record.gender,
      address: record.address,
      district: record.district,
      city: record.city,
      area: record.area,
      tehsil: record.tehsil,
      province: record.province,
      cnicExpiry: record.cnicExpiry,
    },
  };
};

/**
 * Auto-fill voter form from CNIC database record.
 * Called after CNIC scan — returns all extractable fields.
 * @param {string} cnicNumber
 */
const autofillFromCnic = async (cnicNumber) => {
  const record = await CnicDummy.findOne({ cnicNumber });
  if (!record) return null;

  return {
    firstName: record.firstName,
    middleName: record.middleName || '',
    lastName: record.lastName,
    dateOfBirth: record.dateOfBirth,
    gender: record.gender,
    address: record.address,
    district: record.district,
    city: record.city,
    area: record.area,
    tehsil: record.tehsil,
    province: record.province,
    cnicExpiry: record.cnicExpiry,
    cnicNumber: record.cnicNumber,
  };
};

module.exports = {
  parseCnicText,
  verifyCnicAgainstDatabase,
  autofillFromCnic,
  extractCnicNumber,
};