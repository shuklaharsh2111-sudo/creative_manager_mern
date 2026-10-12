
const mongoose = require("mongoose");

const calendarLayoutSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 0,
      max: 11,
    },
    dayOrder: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

calendarLayoutSchema.index(
  { year: 1, month: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "CalendarLayout",
  calendarLayoutSchema
);
