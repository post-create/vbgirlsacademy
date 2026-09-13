const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

function isConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

async function sendMail({ to, subject, text, html }) {
  if (!isConfigured()) {
    throw new Error("Gmail credentials are not configured (GMAIL_USER / GMAIL_APP_PASSWORD)");
  }
  return getTransporter().sendMail({
    from: `"VB Pige Akademi" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail, isConfigured };
