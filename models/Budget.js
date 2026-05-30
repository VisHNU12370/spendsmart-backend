const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month:  { type: Number, required: true }, // 1-12
    year:   { type: Number, required: true },
    limits: {
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

module.exports = mongoose.model("Budget", budgetSchema);