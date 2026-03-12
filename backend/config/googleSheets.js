const { GoogleSpreadsheet } = require('google-spreadsheet');

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

const creds = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: formattedKey,
};

// Lazy initialize doc
let doc = null;
const getDoc = () => {
  if (doc) return doc;
  if (!process.env.GOOGLE_SHEET_ID) {
    throw new Error('GOOGLE_SHEET_ID is missing');
  }
  doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  return doc;
};

let _isLoaded = false;

const initSheet = async () => {
  if (_isLoaded) return doc;
  try {
    const d = getDoc();
    if (!creds.client_email || !creds.private_key) {
      throw new Error('Google Auth Credentials missing');
    }
    await d.useServiceAccountAuth(creds);
    await d.loadInfo();
    _isLoaded = true;
    console.log('✅ Google Sheets Connected (v3):', d.title);
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
  // In v3, rows have the data in a cleaner way if we use toObject if it exists, 
  // but usually we just map headers.
  return rows.map(row => {
    // V3 row property access
    const obj = {};
    sheet.headerValues.forEach(header => {
      obj[header] = row[header];
    });
    return obj;
  });
};

const findRow = async (sheetTitle, filterFn) => {
  const sheet = await getSheet(sheetTitle);
  const rows = await sheet.getRows();
  const row = rows.find(row => {
    const obj = {};
    sheet.headerValues.forEach(header => {
      obj[header] = row[header];
    });
    return filterFn(obj);
  });
  return row;
};

const addRow = async (sheetTitle, data) => {
  const sheet = await getSheet(sheetTitle);
  const newRow = await sheet.addRow(data);
  const obj = {};
  sheet.headerValues.forEach(header => {
    obj[header] = newRow[header];
  });
  return obj;
};

const updateRow = async (sheetTitle, filterFn, updateData) => {
  const sheet = await getSheet(sheetTitle);
  const rows = await sheet.getRows();
  const row = rows.find(row => {
    const obj = {};
    sheet.headerValues.forEach(header => {
      obj[header] = row[header];
    });
    return filterFn(obj);
  });
  
  if (row) {
    Object.assign(row, updateData);
    await row.save();
    const obj = {};
    sheet.headerValues.forEach(header => {
      obj[header] = row[header];
    });
    return obj;
  }
  return null;
};

const deleteRow = async (sheetTitle, filterFn) => {
  const sheet = await getSheet(sheetTitle);
  const rows = await sheet.getRows();
  const index = rows.findIndex(row => {
    const obj = {};
    sheet.headerValues.forEach(header => {
      obj[header] = row[header];
    });
    return filterFn(obj);
  });

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
