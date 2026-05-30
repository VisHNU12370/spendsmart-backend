const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

const resetPassword = async () => {
  const hashed = await bcrypt.hash("newpassword123", 10);
  await User.updateOne(
    { email: "friend@gmail.com" },  // ← friend's email
    { password: hashed }
  );
  console.log("✅ Password reset!");
  process.exit();
};

resetPassword();