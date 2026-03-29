const XLSX = require('xlsx');

function normalizeKey(header) {
  return header
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s/g, '_')
    .trim();
}

function readExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  return rows.map(row => {
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[normalizeKey(key)] = String(value).trim();
    }
    return normalized;
  });
}

module.exports = { readExcel, normalizeKey };
