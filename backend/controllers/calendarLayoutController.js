
const CalendarLayout = require("../models/CalendarLayout");

const getCalendarOrder = async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      month < 0 ||
      month > 11
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid year and month are required.",
      });
    }

    const layout = await CalendarLayout.findOne({ year, month });

    return res.status(200).json({
      success: true,
      dayOrder: layout ? layout.dayOrder : [],
    });
  } catch (error) {
    console.error("Get calendar order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch calendar order.",
    });
  }
};

const saveCalendarOrder = async (req, res) => {
  try {
    const year = Number(req.body.year);
    const month = Number(req.body.month);
    const dayOrder = req.body.dayOrder;

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      month < 0 ||
      month > 11 ||
      !Array.isArray(dayOrder)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid year, month and day order are required.",
      });
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const isValidOrder =
      dayOrder.length === daysInMonth &&
      dayOrder.every(
        (day) =>
          Number.isInteger(day) &&
          day >= 1 &&
          day <= daysInMonth
      ) &&
      new Set(dayOrder).size === daysInMonth;

    if (!isValidOrder) {
      return res.status(400).json({
        success: false,
        message: "Day order must contain every date exactly once.",
      });
    }

    const layout = await CalendarLayout.findOneAndUpdate(
      { year, month },
      { $set: { dayOrder } },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Calendar order saved successfully.",
      dayOrder: layout.dayOrder,
    });
  } catch (error) {
    console.error("Save calendar order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save calendar order.",
    });
  }
};

module.exports = {
  getCalendarOrder,
  saveCalendarOrder,
};
