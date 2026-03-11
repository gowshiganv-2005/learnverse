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

let serviceAccountAuth = null;
if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && formattedKey) {
  try {
    serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } catch (err) {
    console.error('❌ Failed to initialize JWT Auth:', err.message);
  }
}

// Lazy initialize doc to prevent crash on load if ID is missing
let doc = null;
const getDoc = () => {
  if (doc) return doc;
  if (!process.env.GOOGLE_SHEET_ID) {
    console.error('❌ GOOGLE_SHEET_ID is missing from environment variables');
    throw new Error('GOOGLE_SHEET_ID is missing');
  }
  if (!serviceAccountAuth) {
    console.error('❌ Google Auth not initialized. Check service account email and private key.');
    throw new Error('Google Auth not initialized');
  }
  doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  return doc;
};

let _isLoaded = false;

const initSheet = async () => {
  if (_isLoaded) return doc;
  try {
    const d = getDoc();
    await d.loadInfo();
    _isLoaded = true;
    console.log('✅ Google Sheets Connected:', d.title);
    return d;
  } catch (error) {
    console.error('❌ Google Sheets Connection Error:', error.message);
    throw error;
  }
};

const getSheet = async (sheetTitle) => {
  if (!_isLoaded) await initSheet();
  const d = getDoc();
  const sheet = d.sheetsByTitle[sheetTitle];
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
  isLoaded: () => _isLoaded,
  getDoc
};
