const express = require("express");
const router  = express.Router();
const User    = require("figlet/importable-fonts/smartspend/server/models/User");
const { protect } = require("figlet/importable-fonts/smartspend/server/middleware/authMiddleware");

router.use(protect);

// Save push subscription from browser
router.post("/subscribe", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { pushSubscription: req.body });
    res.json({ message: "Push subscription saved ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get VAPID public key (needed by frontend to subscribe)
router.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

module.exports = router;