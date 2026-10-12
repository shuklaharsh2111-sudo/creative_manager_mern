const Creative = require("../models/Creative");
const addCreative = async (req, res) => {
  try {
    const {
      creative_date,
      caption,
      seo_title,
      seo_description,
      keywords,
    } = req.body;
    if (!creative_date || !caption) {
      return res.status(400).json({
        success: false,
        message: "Date and caption are required.",
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Creative image is required.",
      });
    }
    const creative = await Creative.create({
      creative_date: new Date(creative_date),
      image: `/uploads/creatives/${req.file.filename}`,
      caption,
      seo: {
        title: seo_title || "",
        description: seo_description || "",
        keywords: keywords
          ? keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean)
          : [],
      },
      status: "pending",
      reviewedAt: null,
    });
    return res.status(201).json({
      success: true,
      message: "Creative added successfully.",
      creative,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to add creative.",
    });
  }
};
const getCreatives = async (req, res) => {
  try {
    const creatives = await Creative.find().sort({ creative_date: 1 });
    return res.json({
      success: true,
      creatives,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch creatives.",
    });
  }
};
const updateCreativeStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status.",
      });
    }
    if (
      status === "rejected" &&
      (typeof rejectionReason !== "string" || !rejectionReason.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Reason for rejecting is required.",
      });
    }
    const updateFields = {
      status,
      rejectionReason:
        status === "rejected"
          ? rejectionReason.trim().slice(0, 1000)
          : "",
      reviewedAt: status === "pending" ? null : new Date(),
    };
    const creative = await Creative.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!creative) {
      return res.status(404).json({
        success: false,
        message: "Creative not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Creative status updated successfully.",
      creative,
    });
  } catch (error) {
    console.error("Status update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update creative status.",
    });
  }
};
const getCreativeAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const defaultEnd = new Date(now);
    const defaultStart = new Date(now);
    defaultStart.setDate(defaultStart.getDate() - 29);
    const parseDate = (value, fallback) => {
      if (!value) return fallback;
      const parsed = new Date(`${value}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error("Invalid date format. Use YYYY-MM-DD.");
      }
      return parsed;
    };
    const startDate = parseDate(req.query.startDate, defaultStart);
    const endDate = parseDate(req.query.endDate, now);
    const endExclusive = new Date(endDate);
    endExclusive.setDate(endExclusive.getDate() + 1);
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before or equal to end date.",
      });
    }
    const dayCount = Math.max(
      1,
      Math.ceil((endExclusive - startDate) / 86400000)
    );
    const creatives = await Creative.find({
      createdAt: {
        $gte: startDate,
        $lt: endExclusive,
      },
    })
      .select("status createdAt reviewedAt")
      .lean();
    const analytics = {
      total: creatives.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      reviewed: 0,
      approvalRate: 0,
      averageReviewHours: null,
      trend: [],
    };
    const reviewDurations = [];
    creatives.forEach((creative) => {
      const status = String(creative.status || "pending").toLowerCase();
      if (status === "approved") {
        analytics.approved++;
      } else if (status === "rejected") {
        analytics.rejected++;
      } else {
        analytics.pending++;
      }
      if (
        creative.status !== "pending" &&
        creative.reviewedAt &&
        creative.createdAt
      ) {
        const duration =
          new Date(creative.reviewedAt).getTime() -
          new Date(creative.createdAt).getTime();
        if (duration >= 0) {
          reviewDurations.push(duration / 3600000);
        }
      }
    });
    analytics.reviewed = analytics.approved + analytics.rejected;
    analytics.approvalRate =
      analytics.reviewed > 0
        ? Math.round((analytics.approved / analytics.reviewed) * 100)
        : 0;
    analytics.averageReviewHours =
      reviewDurations.length > 0
        ? Math.round(
            (reviewDurations.reduce((sum, hours) => sum + hours, 0) /
              reviewDurations.length) *
              10
          ) / 10
        : null;
    const intervalDays = dayCount <= 31 ? 1 : 7;
    const buckets = new Map();
    for (let offset = 0; offset < dayCount; offset += intervalDays) {
      const bucketDate = new Date(startDate);
      bucketDate.setDate(bucketDate.getDate() + offset);
      const key = [
        bucketDate.getFullYear(),
        String(bucketDate.getMonth() + 1).padStart(2, "0"),
        String(bucketDate.getDate()).padStart(2, "0"),
      ].join("-");
      buckets.set(key, {
        date: key,
        label:
          intervalDays === 1
            ? bucketDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })
            : bucketDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              }),
        count: 0,
      });
    }
    creatives.forEach((creative) => {
      if (!creative.createdAt) return;
      const uploadDate = new Date(creative.createdAt);
      const daysSinceStart = Math.floor(
        (uploadDate - startDate) / 86400000
      );
      if (daysSinceStart < 0 || daysSinceStart >= dayCount) return;
      const bucketOffset =
        Math.floor(daysSinceStart / intervalDays) * intervalDays;
      const bucketDate = new Date(startDate);
      bucketDate.setDate(bucketDate.getDate() + bucketOffset);
      const key = [
        bucketDate.getFullYear(),
        String(bucketDate.getMonth() + 1).padStart(2, "0"),
        String(bucketDate.getDate()).padStart(2, "0"),
      ].join("-");
      const bucket = buckets.get(key);
      if (bucket) bucket.count++;
    });
    analytics.trend = Array.from(buckets.values());
    const currentDate = new Date();
    const sixMonthsAgo = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 5,
      1
    );
    const monthlyResults = await Creative.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sixMonthsAgo,
            $lte: currentDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);
    const monthlyUploads = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthNumber = date.getMonth() + 1;
      const year = date.getFullYear();
      const matchingMonth = monthlyResults.find(
        (item) =>
          item._id.month === monthNumber &&
          item._id.year === year
      );
      monthlyUploads.push({
        month: date.toLocaleString("en-US", {
          month: "long",
        }),
        year,
        count: matchingMonth ? matchingMonth.count : 0,
      });
    }
    return res.status(200).json({
      success: true,
      analytics: {
        ...analytics,
        monthlyUploads,
      },
    });
  } catch (error) {
    console.error("Creative analytics error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch creative analytics.",
    });
  }
};
module.exports = {
  addCreative,
  getCreatives,
  updateCreativeStatus,
  getCreativeAnalytics,
};