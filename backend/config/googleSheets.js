const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Enhanced key cleaning for various environment (Vercel/Local/Docker)
const cleanKey = (key) => {
  if (!key) return null;
  let k = key;
  // Handle Vercel's potentially extra-quoted env vars
  if (k.startsWith('"') && k.endsWith('"')) k = k.slice(1, -1);
  return k.replace(/\\n/g, '\n').trim();
};

const rawKey = process.env.GOOGLE_PRIVATE_KEY;
const formattedKey = cleanKey(rawKey);

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: formattedKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

let isLoaded = false;

const initSheet = async () => {
  if (isLoaded) return doc;
  try {
    await doc.loadInfo();
    isLoaded = true;
    console.log('✅ Google Sheets Connected:', doc.title);
    return doc;
  } catch (error) {
    console.error('❌ Google Sheets Connection Error:', error.message);
    throw error;
  }
};

const getSheet = async (sheetTitle) => {
  if (!isLoaded) await initSheet();
  const sheet = doc.sheetsByTitle[sheetTitle];
  if (!sheet) {
    throw new Error(`Sheet with title "${sheetTitle}" not found in spreadsheet.`);
  }
  return sheet;
};

// Generic CRUD operations
const getAllRows = async (sheetTitle) => {
  const sheet = await getSheet(sheetTitle);
  const rows = await sheet.getRows();
  return rows.map(row => row.toObject());
};

const findRow = async (sheetTitle, filterFn) => {
  const sheet = await getSheet(sheetTitle);
  const rows = await sheet.getRows();
  const row = rows.find(filterFn);
  return row;
};

const addRow = async (sheetTitle, data) => {
  const sheet = await getSheet(sheetTitle);
  const newRow = await sheet.addRow(data);
  return newRow.toObject();
};

const updateRow = async (sheetTitle, filterFn, updateData) => {
  const sheet = await getSheet(sheetTitle);
  const rows = await sheet.getRows();
  const row = rows.find(filterFn);
  if (row) {
    Object.assign(row, updateData);
    await row.save();
    return row.toObject();
  }
  return null;
};

const deleteRow = async (sheetTitle, filterFn) => {
  const sheet = await getSheet(sheetTitle);
  const rows = await sheet.getRows();
  const index = rows.findIndex(filterFn);
  if (index !== -1) {
    await rows[index].delete();
    return true;
  }
  return false;
};

module.exports = {
  initSheet,
  getSheet,
  getAllRows,
  findRow,
  addRow,
  updateRow,
  deleteRow,
  isLoaded: () => isLoaded, // Export as a function to get real-time value
  doc
};
