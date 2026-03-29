const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { readExcel, normalizeKey } = require('../src/readExcel');

const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'sample.xlsx');

beforeAll(() => {
  fs.mkdirSync(path.join(__dirname, 'fixtures'), { recursive: true });

  const ws = XLSX.utils.aoa_to_sheet([
    ['EMAIL', 'SÓCIO ADMINISTRADOR', 'Razão Social', 'STATUS'],
    ['alice@example.com', 'Alice Souza', 'Empresa A', 'ATIVO'],
    ['bob@example.com', 'Bob Lima', 'Empresa B', 'INATIVO'],
    ['', 'Carlos', 'Empresa C', 'ATIVO'], // missing email
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, FIXTURE_PATH);
});

afterAll(() => {
  fs.rmSync(path.join(__dirname, 'fixtures'), { recursive: true, force: true });
});

describe('normalizeKey', () => {
  test('lowercases and strips accents', () => {
    expect(normalizeKey('SÓCIO ADMINISTRADOR')).toBe('socio_administrador');
  });

  test('handles simple uppercase', () => {
    expect(normalizeKey('EMAIL')).toBe('email');
  });

  test('handles mixed case with accents', () => {
    expect(normalizeKey('Razão Social')).toBe('razao_social');
  });

  test('replaces multiple spaces with single underscore', () => {
    expect(normalizeKey('RESP  NAME')).toBe('resp__name');
  });
});

describe('readExcel', () => {
  test('returns an array of row objects', () => {
    const rows = readExcel(FIXTURE_PATH);
    expect(Array.isArray(rows)).toBe(true);
    expect(rows).toHaveLength(3);
  });

  test('normalizes column headers', () => {
    const rows = readExcel(FIXTURE_PATH);
    expect(rows[0]).toHaveProperty('email', 'alice@example.com');
    expect(rows[0]).toHaveProperty('socio_administrador', 'Alice Souza');
    expect(rows[0]).toHaveProperty('razao_social', 'Empresa A');
  });

  test('includes row with empty email', () => {
    const rows = readExcel(FIXTURE_PATH);
    expect(rows[2].email).toBe('');
  });

  test('throws if file does not exist', () => {
    expect(() => readExcel('/nonexistent/path.xlsx')).toThrow();
  });
});
