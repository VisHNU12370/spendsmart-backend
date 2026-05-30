const express = require("express");
const router  = express.Router();
const { addExpense, getExpenses, getTodayExpenses, deleteExpense, updateExpense } = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // All routes protected

router.post("/",        addExpense);
router.get("/",         getExpenses);
router.get("/today",    getTodayExpenses);
router.delete("/:id",   deleteExpense);
router.put("/:id",      updateExpense);

module.exports = router;