const express  = require("express");
const router   = express.Router();
const Expense  = require("../models/Expense");
const { parseSMS } = require("../utils/smsParser");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// @POST /api/sms/parse — Parse single SMS
router.post("/parse", async (req, res) => {
  const { sms } = req.body;
  if (!sms) return res.status(400).json({ message: "SMS text required" });

  const result = parseSMS(sms);
  if (!result.success) return res.status(400).json({ message: result.message });

  res.json(result);
});

// @POST /api/sms/parse-and-save — Parse SMS and save as expense
router.post("/parse-and-save", async (req, res) => {
  const { sms } = req.body;
  if (!sms) return res.status(400).json({ message: "SMS text required" });

  const result = parseSMS(sms);
  if (!result.success) return res.status(400).json({ message: result.message });

  try {
    const expense = await Expense.create({
      user:     req.user._id,
      title:    result.title,
      amount:   result.amount,
      category: result.category,
      note:     `Auto-imported from ${result.source}`,
      date:     result.date,
    });
    res.status(201).json({ expense, parsed: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/sms/parse-bulk — Parse multiple SMS at once
router.post("/parse-bulk", async (req, res) => {
  const { messages } = req.body;
  if (!messages?.length) return res.status(400).json({ message: "Messages array required" });

  const results  = [];
  const failed   = [];

  for (const sms of messages) {
    const result = parseSMS(sms);
    if (result.success) results.push({ ...result, sms });
    else failed.push({ sms, reason: result.message });
  }

  res.json({ parsed: results, failed, total: messages.length, success: results.length });
});

// @POST /api/sms/save-bulk — Save all parsed SMS as expenses
router.post("/save-bulk", async (req, res) => {
  const { expenses } = req.body;
  if (!expenses?.length) return res.status(400).json({ message: "Expenses array required" });

  try {
    const saved = await Expense.insertMany(
      expenses.map(e => ({
        user:     req.user._id,
        title:    e.title,
        amount:   e.amount,
        category: e.category,
        note:     `Auto-imported from ${e.source}`,
        date:     e.date || new Date(),
      }))
    );
    res.status(201).json({ saved, count: saved.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;