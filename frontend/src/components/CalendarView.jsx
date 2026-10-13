import { useEffect, useState } from "react";
import axios from "axios";
import AddCreativeModal from "./AddCreativeModal";
import CreativeDetailsModal from "./CreativeDetailsModal";
function CalendarView() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState(null);
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  // Fetch creatives from MongoDB
  const fetchCreatives = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/creatives");
      if (response.data.success) {
        setCreatives(response.data.creatives || []);
      } else {
        setCreatives([]);
        console.error("Failed to fetch creatives:", response.data.message);
      }
    } catch (error) {
      console.error(
        "Failed to fetch creatives:",
        error.response?.status,
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCreatives();
  }, []);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString(
    "default",
    {
      month: "long",
    }
  );
  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();
  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();
  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const d = String(
      date.getDate()
    ).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  // Find creative for a particular date
  const getCreativeForDate = (date) => {
    if (!date) return null;
    const targetDate = formatDate(date);
    return creatives.find((creative) => {
      if (!creative.creative_date) {
        return false;
      }
      const creativeDate = new Date(
        creative.creative_date
      );
      return (
        formatDate(creativeDate) ===
        targetDate
      );
    });
  };
  // Previous month
  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
    setSelectedDate(null);
  };
  // Next month
  const handleNextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
    setSelectedDate(null);
  };
  // Select date
const handleDateClick = (day) => {
  const clickedDate = new Date(year, month, day);
  setSelectedDate(clickedDate);
  const creative = getCreativeForDate(clickedDate);
  if (creative) {
    setSelectedCreative(creative);
    setShowModal(false);
  } else {
    setSelectedCreative(null);
    setShowModal(true);
  }
};
  // After adding creative
  const handleCreativeAdded = (newCreative) => {
    setCreatives((previous) => [
      ...previous,
      newCreative,
    ]);
    setShowModal(false);
    setSelectedCreative(newCreative);
  };
  const handleStatusUpdated = (updatedCreative) => {
  setCreatives((previous) =>
    previous.map((creative) =>
      creative._id === updatedCreative._id
        ? updatedCreative
        : creative
    )
  );
  setSelectedCreative(updatedCreative);
};
  // Build calendar
  const calendarDays = [];
  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(
      <div
        key={`empty-${i}`}
        className="calendar-day empty"
      />
    );
  }
  // Actual dates
  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    const date = new Date(
      year,
      month,
      day
    );
    const creative =
      getCreativeForDate(date);
    const isSelected =
      selectedDate &&
      formatDate(selectedDate) ===
        formatDate(date);
    const isToday =
      formatDate(today) ===
      formatDate(date);
    calendarDays.push(
      <div
        key={day}
        className={`calendar-day
          ${isSelected ? "selected" : ""}
          ${creative ? "has-creative" : ""}
          ${isToday ? "today" : ""}
        `}
        onClick={() =>
          handleDateClick(day)
        }
      >
        {/* Date number */}
        <div className="day-number">
          {day}
        </div>
        {/* Empty date */}
        {!creative && (
          <div className="empty-day-content">
            <div className="plus-icon">
              +
            </div>
            <span className="add-text">
              Add Creative
            </span>
          </div>
        )}
        {/* Existing creative */}
        {creative && (
          <div className="calendar-creative">
            <img
              src={creative.image}
              alt="Creative"
            />
            <div className="creative-overlay">
              <span
                className={`status-badge ${creative.status}`}
              >
                {creative.status}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  const currentSelectedCreative = getCreativeForDate(selectedDate);
  // Filter creatives for the currently selected month
  const monthlyCreatives = creatives.filter((creative) => {
    if (!creative.creative_date) return false;
    const creativeDate = new Date(creative.creative_date);
    return (
      creativeDate.getMonth() === month &&
      creativeDate.getFullYear() === year
    );
  });
  // Month-wise Creative Statistics
  const totalCreatives = monthlyCreatives.length;
  const approvedCreatives = monthlyCreatives.filter(
    (creative) => creative.status === "approved"
  ).length;
  const pendingCreatives = monthlyCreatives.filter(
    (creative) => creative.status === "pending"
  ).length;
  const rejectedCreatives = monthlyCreatives.filter(
    (creative) => creative.status === "rejected"
  ).length;
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button
          className="month-btn"
          onClick={handlePreviousMonth}
          type="button"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="month-title">
          <h2>
            {monthName} {year}
          </h2>
          <p>
            Plan and manage your creatives
          </p>
        </div>
        <button
          className="month-btn"
          onClick={handleNextMonth}
          type="button"
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className="creative-stats">
        <div className="creative-stat-card total-stat">
          <p>Total Creatives</p>
          <h3>{totalCreatives}</h3>
        </div>
        <div className="creative-stat-card approved-stat">
          <p>Approved Creatives</p>
          <h3>{approvedCreatives}</h3>
        </div>
        <div className="creative-stat-card pending-stat">
          <p>Pending Creatives</p>
          <h3>{pendingCreatives}</h3>
        </div>
        <div className="creative-stat-card rejected-stat">
          <p>Rejected Creatives</p>
          <h3>{rejectedCreatives}</h3>
        </div>
      </div>
      {/* Loading */}
      {loading && (
        <div className="calendar-loading">
          <div className="loading-spinner"></div>
          <span>
            Loading creatives...
          </span>
        </div>
      )}
      {/* Weekdays */}
      <div className="calendar-weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      {/* Calendar */}
      <div className="calendar-grid">
        {calendarDays}
      </div>
      {/* Add Creative Modal */}
      {showModal && selectedDate && (
        <AddCreativeModal
          selectedDate={selectedDate}
          onClose={() =>
            setShowModal(false)
          }
          onCreativeAdded={
            handleCreativeAdded
          }
        />
      )}
      {/* Creative Details Modal */}
      {selectedCreative && (
<CreativeDetailsModal
  creative={selectedCreative}
  onClose={() =>
    setSelectedCreative(null)
  }
  onStatusUpdated={handleStatusUpdated}
/>
      )}
    </div>
  );
}
export default CalendarView;
