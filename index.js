require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { readExcel } = require('./src/readExcel');
const { renderTemplate } = require('./src/renderTemplate');
const { sendEmail } = require('./src/sendEmail');

async function main() {
  const { RESEND_API_KEY, FROM_EMAIL, EMAIL_SUBJECT } = process.env;

  if (!RESEND_API_KEY || !FROM_EMAIL || !EMAIL_SUBJECT) {
    console.error(
      'Error: Missing required env variables. Ensure RESEND_API_KEY, FROM_EMAIL, and EMAIL_SUBJECT are set in .env'
    );
    process.exit(1);
  }

  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node index.js <path-to-excel-file>');
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found: ${absolutePath}`);
    process.exit(1);
  }

  let rows;
  try {
    rows = readExcel(absolutePath);
  } catch (err) {
    console.error(`Error reading Excel file: ${err.message}`);
    process.exit(1);
  }

  const txtTemplatePath = path.join(__dirname, 'templates', 'template.txt');
  const htmlTemplatePath = path.join(__dirname, 'templates', 'template.html');

  const txtTemplate = fs.readFileSync(txtTemplatePath, 'utf-8');
  const rawHtml = fs.existsSync(htmlTemplatePath)
    ? fs.readFileSync(htmlTemplatePath, 'utf-8').trim()
    : '';

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed + header row

    if (!row.email) {
      console.warn(`Row ${rowNum}: Missing EMAIL — skipped`);
      skipped++;
      continue;
    }

    const text = renderTemplate(txtTemplate, row);
    const html = rawHtml ? renderTemplate(rawHtml, row) : undefined;
    const subject = renderTemplate(EMAIL_SUBJECT, row);

    try {
      await sendEmail({
        apiKey: RESEND_API_KEY,
        from: FROM_EMAIL,
        to: row.email,
        subject,
        text,
        html,
      });
      console.log(`Row ${rowNum}: Sent to ${row.email}`);
      sent++;
    } catch (err) {
      console.error(`Row ${rowNum}: Failed to send to ${row.email} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${sent} sent, ${failed} failed, ${skipped} skipped`);
}

main();
