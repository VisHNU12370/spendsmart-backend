// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const cron = require("node-cron");

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// // const { sendEmail, buildReportEmail } = require("./utils/sendEmail");

// // app.get("/test-email", async (req, res) => {
// //   await sendEmail({
// //     to: "kaspevishnu19@gmail.com",  // here i put my gmail
// //     subject: "✅ SpendSmart Test Email",
// //     html: buildReportEmail("Test User", 850, {
// //       Food: 400,
// //       Transport: 250,
// //       Shopping: 200
// //     })
// //   });
// //   res.json({ message: "Email sent! Check your inbox 📧" });
// // });
// app.use("/api/auth",     require("./routes/authRoutes"));
// app.use("/api/expenses", require("./routes/expenseRoutes"));
// app.use("/api/budgets",  require("./routes/budgetRoutes"));
// app.use("/api/reports",  require("./routes/reportRoutes"));
// app.use("/api/notify",   require("./routes/notifyRoutes"));
// app.use("/api/sms", require("./routes/smsRoutes"));

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err));

// // Night Cron Job — runs every day at 9:00 PM
// const nightNotification = require("./cron/nightNotification");
// cron.schedule("36 23 * * *", () => {
//   console.log("🔔 Running nightly notification job...");
//   nightNotification.sendNightlyReport();
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");
const https = require("https");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Keep server awake — ping every 10 mins
setInterval(() => {
  https.get("https://spendsmart-backend-1-h0gb.onrender.com/health");
  console.log("🏓 Ping to keep server alive");
}, 10 * 60 * 1000);

// Routes
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/budgets",  require("./routes/budgetRoutes"));
app.use("/api/reports",  require("./routes/reportRoutes"));
app.use("/api/notify",   require("./routes/notifyRoutes"));
app.use("/api/sms",      require("./routes/smsRoutes"));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Cron Job — runs every day at 11:50 PM
const nightNotification = require("./cron/nightNotification");
cron.schedule("50 23 * * *", () => {
  console.log("🔔 Running nightly notification job...");
  nightNotification.sendNightlyReport();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));