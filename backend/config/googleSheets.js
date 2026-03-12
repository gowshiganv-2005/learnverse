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
    console.error('❌ GOOGLE_SHEET_ID missing');
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
      console.error('❌ Auth credentials missing');
      throw new Error('Google Auth Credentials missing');
    }
    await d.useServiceAccountAuth(creds);
    await d.loadInfo();
    _isLoaded = true;
    console.log('✅ Google Sheets V3 Connected:', d.title);
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
    throw new Error(`Sheet "${sheetTitle}" not found.`);
  }
  return sheet;
};

/**
 * Robust Row Wrapper for v3/v4/v5 compatibility
 */
const wrapRow = (row, sheet) => {
  if (!row) return null;
  
  const data = {};
  // Google Sheets v3 often puts data in indexed properties or lowercase properties
  // We'll iterate the headers to be sure
  if (sheet.headerValues) {
    sheet.headerValues.forEach(header => {
      data[header] = row[header];
      // Also provide lowercase access for robustness
      data[header.toLowerCase()] = row[header];
    });
  }

  // Fallback for metadata
  if (!data.id && row.id) data.id = row.id;
  if (!data._id && row.id) data._id = row.id;

  // Create the rich object
  const wrapped = { ...data };
  
  // v4/v5 Function compatibility
  wrapped.get = function(key) {
    if (!key) return null;
    const k = key.toLowerCase();
    return this[k] !== undefined ? this[k] : this[key];
  };

  wrapped.set = function(key, value) {
    this[key] = value;
    row[key] = value;
  };

  wrapped.save = async function() {
    try { await row.save(); } catch (err) { console.error('Save failed:', err.message); throw err; }
  };

  wrapped.delete = async function() {
    try {
      await row.delete();
    } catch (err) {
      console.error('Row delete failed:', err.message);
      throw err;
    }
  };

  wrapped.toObject = function() {
    const plain = {};
    Object.keys(this).forEach(k => {
      if (typeof this[k] !== 'function') plain[k] = this[k];
    });
    return plain;
  };

  if (!wrapped.id && row.id) wrapped.id = row.id;
  if (!wrapped._id && row.id) wrapped._id = row.id;

  return wrapped;
};

// Generic CRUD operations
const getAllRows = async (sheetTitle) => {
  try {
    const sheet = await getSheet(sheetTitle);
    const rows = await sheet.getRows();
    return (rows || []).map(row => wrapRow(row, sheet));
  } catch (err) {
    console.error(`Error in getAllRows:`, err.message);
    return [];
  }
};

const findRow = async (sheetTitle, filterFn) => {
  try {
    const sheet = await getSheet(sheetTitle);
    const rows = await sheet.getRows();
    if (!rows) return null;
    
    for (const row of rows) {
      const wrapped = wrapRow(row, sheet);
      if (typeof filterFn === 'function' && filterFn(wrapped)) return wrapped;
    }
  } catch (err) {
    console.error(`Error in findRow:`, err.message);
  }
  return null;
};

const addRow = async (sheetTitle, data) => {
  const sheet = await getSheet(sheetTitle);
  const newRow = await sheet.addRow(data);
  return wrapRow(newRow, sheet);
};

const updateRow = async (sheetTitle, filterFn, updateData) => {
  const row = await findRow(sheetTitle, filterFn);
  if (row) {
    Object.keys(updateData).forEach(key => {
      row.set(key, updateData[key]);
    });
    await row.save();
    return row;
  }
  return null;
};

const deleteRow = async (sheetTitle, filterFn) => {
  const row = await findRow(sheetTitle, filterFn);
  if (row) {
    await row.delete();
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
