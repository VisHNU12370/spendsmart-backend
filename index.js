const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Require nightNotification at top
const nightNotification = require("./cron/nightNotification");

// Health check route
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Test nightly report
app.get("/test-nightly", async (req, res) => {
  await nightNotification.sendNightlyReport();
  res.json({ message: "Nightly report triggered! Check email 📧" });
});

// Keep server awake — only in production
if (process.env.NODE_ENV === "production") {
  const https = require("https");
  setInterval(() => {
    https.get("https://spendsmart-backend-1-h0gb.onrender.com/health", () => {
      console.log("🏓 Ping to keep server alive");
    }).on("error", (err) => {
      console.log("Ping error:", err.message);
    });
  }, 15 * 60 * 1000);
}

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

// Cron Job — 11:50 PM India = 6:20 PM UTC
cron.schedule("25 21 * * *", () => {
  console.log("🔔 Running nightly notification job...");
  nightNotification.sendNightlyReport();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));