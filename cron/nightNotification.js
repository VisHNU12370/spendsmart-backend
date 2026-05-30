const webpush = require("web-push");
const User    = require("../models/User");
const Expense = require("../models/Expense");
const { sendEmail, buildReportEmail } = require("../utils/sendEmail");

// Setup VAPID for push notifications
webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const sendNightlyReport = async () => {
  try {
    const users = await User.find({});

    for (const user of users) {
      // Get today's expenses
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end   = new Date(); end.setHours(23, 59, 59, 999);

      const expenses = await Expense.find({ user: user._id, date: { $gte: start, $lte: end } });
      if (expenses.length === 0) continue; // Skip if no expenses today

      const total      = expenses.reduce((sum, e) => sum + e.amount, 0);
      const byCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

      const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

      // 1️⃣ Send Email Notification
      await sendEmail({
        to:      user.email,
        subject: `💰 SpendSmart: You spent ₹${total} today!`,
        html:    buildReportEmail(user.name, total, byCategory),
      });

      // 2️⃣ Send Push Notification
      if (user.pushSubscription) {
        const payload = JSON.stringify({
          title: "💰 SpendSmart Daily Report",
          body:  `You spent ₹${total} today. Top category: ${topCategory[0]} (₹${topCategory[1]})`,
          icon:  "/logo192.png",
        });
        try {
          await webpush.sendNotification(user.pushSubscription, payload);
          console.log(`🔔 Push sent to ${user.email}`);
        } catch (pushErr) {
          console.error(`Push error for ${user.email}:`, pushErr.message);
        }
      }
    }

    console.log("✅ Nightly reports sent!");
  } catch (err) {
    console.error("❌ Nightly report error:", err.message);
  }
};

module.exports = { sendNightlyReport };
