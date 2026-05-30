const Expense = require("../models/Expense");

// @GET /api/reports/daily — Daily report
const getDailyReport = async (req, res) => {
  const date  = req.query.date ? new Date(req.query.date) : new Date();
  const start = new Date(date); start.setHours(0, 0, 0, 0);
  const end   = new Date(date); end.setHours(23, 59, 59, 999);

  try {
    const expenses  = await Expense.find({ user: req.user._id, date: { $gte: start, $lte: end } });
    const total     = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    res.json({ date: date.toDateString(), total, byCategory, expenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/reports/weekly — Weekly report
const getWeeklyReport = async (req, res) => {
  const today = new Date();
  const start = new Date(today); start.setDate(today.getDate() - 6); start.setHours(0, 0, 0, 0);
  const end   = new Date(today); end.setHours(23, 59, 59, 999);

  try {
    const expenses   = await Expense.find({ user: req.user._id, date: { $gte: start, $lte: end } });
    const total      = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    // Group by day
    const byDay = {};
    expenses.forEach((e) => {
      const day = new Date(e.date).toDateString();
      byDay[day] = (byDay[day] || 0) + e.amount;
    });

    res.json({ total, byCategory, byDay, expenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/reports/monthly — Monthly report
const getMonthlyReport = async (req, res) => {
  const now   = new Date();
  const month = parseInt(req.query.month) || now.getMonth() + 1;
  const year  = parseInt(req.query.year)  || now.getFullYear();
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0, 23, 59, 59);

  try {
    const expenses   = await Expense.find({ user: req.user._id, date: { $gte: start, $lte: end } });
    const total      = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    // Group by week
    const byWeek = { "Week 1": 0, "Week 2": 0, "Week 3": 0, "Week 4": 0 };
    expenses.forEach((e) => {
      const day = new Date(e.date).getDate();
      if (day <= 7)       byWeek["Week 1"] += e.amount;
      else if (day <= 14) byWeek["Week 2"] += e.amount;
      else if (day <= 21) byWeek["Week 3"] += e.amount;
      else                byWeek["Week 4"] += e.amount;
    });

    res.json({ month, year, total, byCategory, byWeek, expenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDailyReport, getWeeklyReport, getMonthlyReport };
