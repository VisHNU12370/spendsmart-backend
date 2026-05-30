const Expense = require("../models/Expense");
const Budget  = require("../models/Budget");

// @POST /api/expenses — Add expense
const addExpense = async (req, res) => {
  const { title, amount, category, note, date } = req.body;
  try {
    const expense = await Expense.create({
      user: req.user._id,
      title, amount, category, note,
      date: date || Date.now(),
    });

    // Check if budget exceeded for this category
    const now     = new Date();
    const budget  = await Budget.findOne({ user: req.user._id, month: now.getMonth() + 1, year: now.getFullYear() });
    let warning   = null;

    if (budget && budget.limits[category] > 0) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const totalSpent   = await Expense.aggregate([
        { $match: { user: req.user._id, category, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const spent = totalSpent[0]?.total || 0;
      if (spent >= budget.limits[category]) {
        warning = `⚠️ Budget exceeded for ${category}! Limit: ₹${budget.limits[category]}, Spent: ₹${spent}`;
      }
    }

    res.status(201).json({ expense, warning });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/expenses — Get all expenses (with filters)
const getExpenses = async (req, res) => {
  const { category, startDate, endDate, limit = 50 } = req.query;
  const filter = { user: req.user._id };

  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate)   filter.date.$lte = new Date(endDate);
  }

  try {
    const expenses = await Expense.find(filter).sort({ date: -1 }).limit(Number(limit));
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/expenses/today — Today's expenses
const getTodayExpenses = async (req, res) => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end   = new Date(); end.setHours(23, 59, 59, 999);
  try {
    const expenses = await Expense.find({ user: req.user._id, date: { $gte: start, $lte: end } });
    const total    = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.json({ expenses, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/expenses/:id — Delete expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/expenses/:id — Update expense
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addExpense, getExpenses, getTodayExpenses, deleteExpense, updateExpense };