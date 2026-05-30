const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use Gmail App Password
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"SpendSmart 💰" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};

// Build nightly report email HTML
const buildReportEmail = (name, total, byCategory) => {
  const rows = Object.entries(byCategory)
    .map(([cat, amt]) => `<tr><td>${cat}</td><td>₹${amt}</td></tr>`)
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#f9f9f9;border-radius:10px;">
      <h2 style="color:#4CAF50;">💰 SpendSmart — Daily Report</h2>
      <p>Hi <b>${name}</b>, here's your spending summary for today:</p>
      <h3 style="color:#333;">Total Spent: ₹${total}</h3>
      <table style="width:100%;border-collapse:collapse;margin-top:10px;">
        <thead>
          <tr style="background:#4CAF50;color:white;">
            <th style="padding:8px;text-align:left;">Category</th>
            <th style="padding:8px;text-align:left;">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:20px;color:#888;font-size:12px;">Keep tracking your expenses to stay on budget! 🎯</p>
    </div>
  `;
};

module.exports = { sendEmail, buildReportEmail };