import { createWorker } from 'tesseract.js';

export const autofillFromCnic = async (frontFile, backFile) => {
  const worker = await createWorker('eng');

  let fullText = '';

  if (frontFile) {
    const frontResult = await worker.recognize(frontFile);
    fullText += '\n' + frontResult.data.text;
  }

  if (backFile) {
    const backResult = await worker.recognize(backFile);
    fullText += '\n' + backResult.data.text;
  }

  await worker.terminate();

  return parseCnicText(fullText);
};

const parseCnicText = (text) => {
  const cnicMatch = text.match(/\b\d{5}[- ]?\d{7}[- ]?\d\b/);
  const dates = text.match(/\b\d{2}[./-]\d{2}[./-]\d{4}\b/g);

  const cleanedCnic = cnicMatch
    ? cnicMatch[0].replace(/[-\s]/g, '')
    : '';

  let gender = '';
  if (/female/i.test(text)) gender = 'Female';
  else if (/male/i.test(text)) gender = 'Male';

  return {
    cnicNumber: cleanedCnic,
    dateOfBirth: dates?.[0] || '',
    cnicExpiry: dates?.[dates.length - 1] || '',
    gender,
  };
};