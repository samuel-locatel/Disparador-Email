const { Resend } = require('resend');

async function sendEmail({ apiKey, from, to, subject, text, html }) {
  const resend = new Resend(apiKey);

  const payload = { from, to, subject, text };
  if (html) payload.html = html;

  const { data, error } = await resend.emails.send(payload);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

module.exports = { sendEmail };
