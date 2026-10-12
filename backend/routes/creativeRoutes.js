
const express = require("express");
const router = express.Router();

const {
  addCreative,
  getCreatives,
  updateCreativeStatus,
  getCreativeAnalytics,
} = require("../controllers/creativeController");

const {
  getCalendarOrder,
  saveCalendarOrder,
} = require("../controllers/calendarLayoutController");

const upload = require("../middleware/upload");

router.get("/analytics", getCreativeAnalytics);

router.get("/calendar-order", getCalendarOrder);
router.put("/calendar-order", saveCalendarOrder);

router.get("/", getCreatives);
router.post("/", upload.single("image"), addCreative);
router.patch("/:id/status", updateCreativeStatus);

module.exports = router;
