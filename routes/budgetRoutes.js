const express  = require("express");
const router   = express.Router();
const Budget   = require("../models/Budget");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// GET current month budget
router.get("/", async (req, res) => {
  const now = new Date();
  const budget = await Budget.findOne({ user: req.user._id, month: now.getMonth() + 1, year: now.getFullYear() });
  res.json(budget || {});
});

// SET / UPDATE budget
router.post("/", async (req, res) => {
  const now    = new Date();
  const month  = now.getMonth() + 1;
  const year   = now.getFullYear();
  try {
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month, year },
      { limits: req.body.limits },
      { new: true, upsert: true }
    );
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;