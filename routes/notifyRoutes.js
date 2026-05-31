const express = require("express");
const router  = express.Router();
const User    = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/subscribe", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { pushSubscription: req.body });
    res.json({ message: "Push subscription saved ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

module.exports = router;