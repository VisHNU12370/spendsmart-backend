const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pushSubscription: { type: Object, default: null },
    budgetGoals: {
      Food:          { type: Number, default: 0 },
      Transport:     { type: Number, default: 0 },
      Shopping:      { type: Number, default: 0 },
      Entertainment: { type: Number, default: 0 },
      Health:        { type: Number, default: 0 },
      Bills:         { type: Number, default: 0 },
      Other:         { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);