const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Configure Auth
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

const initSheet = async () => {
  try {
    await doc.loadInfo();
    console.log('✅ Google Sheets Connected:', doc.title);
    return doc;
  } catch (error) {
    console.error('❌ Google Sheets Connection Error:', error);
    throw error;
  }
};

const getSheet = async (sheetTitle) => {
  await doc.loadInfo();
  return doc.sheetsByTitle[sheetTitle];
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
};
