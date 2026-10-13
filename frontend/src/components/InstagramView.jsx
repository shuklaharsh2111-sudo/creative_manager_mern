import { useEffect, useState } from "react";
import axios from "axios";
import CreativeDetailsModal from "./CreativeDetailsModal";
import AddCreativeModal from "./AddCreativeModal";
import "../styles/instagram.css";
const API_URL = "/api/creatives";
function InstagramView() {
  const [creatives, setCreatives] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCreative, setSelectedCreative] = useState(null);
  const [orderedDays, setOrderedDays] = useState([]);
  const [draggedDay, setDraggedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
  });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Fetch creatives
  const fetchCreatives = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL);
      if (response.data.success) {
        setCreatives(response.data.creatives || []);
      } else {
        setCreatives([]);
        setError("No creatives data returned by the server.");
      }
    } catch (err) {
      console.error(
        "Error fetching creatives:",
        err.response?.status,
        err.response?.data || err.message
      );
      setError("Unable to load creatives. Please check the API response.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCreatives();
  }, []);
  // Fetch saved calendar order
  useEffect(() => {
    let cancelled = false;
    const fetchCalendarOrder = async () => {
      const defaultOrder = Array.from(
        { length: daysInMonth },
        (_, index) => index + 1
      );
      setOrderedDays(defaultOrder);
      try {
        const response = await axios.get(
          `${API_URL}/calendar-order`,
          { params: { year, month } }
        );
        if (cancelled) return;
        const savedOrder = response.data.dayOrder;
        const isValidOrder =
          Array.isArray(savedOrder) &&
          savedOrder.length === daysInMonth &&
          savedOrder.every(
            (day) =>
              Number.isInteger(day) &&
              day >= 1 &&
              day <= daysInMonth
          ) &&
          new Set(savedOrder).size === daysInMonth;
        if (response.data.success && isValidOrder) {
          setOrderedDays(savedOrder);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Error fetching calendar order:",
            err
          );
        }
      }
    };
    fetchCalendarOrder();
    return () => {
      cancelled = true;
    };
  }, [year, month, daysInMonth]);
  // Format date as YYYY-MM-DD using local date values
  const formatDate = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  // Find creative for a particular date
  const getCreativeForDate = (day) => {
    const targetDate = formatDate(
      new Date(year, month, day)
    );
    return creatives.find((creative) => {
      if (!creative.creative_date) return false;
      const creativeDate = String(
        creative.creative_date
      ).slice(0, 10);
      return creativeDate === targetDate;
    });
  };
  // Handle date tile click
  // Same modal-opening logic as CalendarView.jsx
  const handleDateClick = (day) => {
    if (savingOrder) return;
    // Ignore clicks immediately following a drag
    if (draggedDay !== null) return;
    const clickedDate = new Date(year, month, day);
    const creative = getCreativeForDate(day);
    if (creative) {
      setSelectedDate(null);
      setShowModal(false);
      setSelectedCreative(creative);
    } else {
      setSelectedCreative(null);
      setSelectedDate(clickedDate);
      setShowModal(true);
    }
  };
  // Get image URL
const getImageUrl = (image) => {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) {
    return image;
  }
  return image.startsWith("/") ? image : `/${image}`;
};
  // Previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
    setShowModal(false);
    setSelectedCreative(null);
  };
  // Next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
    setShowModal(false);
    setSelectedCreative(null);
  };
  // Current month
  const goToCurrentMonth = () => {
    const today = new Date();
    setCurrentDate(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
    setSelectedDate(null);
    setShowModal(false);
    setSelectedCreative(null);
  };
  // Start dragging a date tile
  const handleDragStart = (event, day) => {
    if (savingOrder) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(day));
    setDraggedDay(day);
  };
  // Allow tile to receive a drop
  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };
  // Drop and save the updated order
  const handleDrop = async (event, targetDay) => {
    event.preventDefault();
    event.stopPropagation();
    if (savingOrder) return;
    const transferredDay =
      event.dataTransfer.getData("text/plain");
    const sourceDay = Number(
      transferredDay || draggedDay
    );
    if (
      !sourceDay ||
      !targetDay ||
      sourceDay === targetDay
    ) {
      return;
    }
    const currentOrder =
      orderedDays.length === daysInMonth
        ? [...orderedDays]
        : Array.from(
            { length: daysInMonth },
            (_, index) => index + 1
          );
    const sourceIndex = currentOrder.indexOf(sourceDay);
    const targetIndex = currentOrder.indexOf(targetDay);
    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }
    const updatedOrder = [...currentOrder];
    const [movedDay] = updatedOrder.splice(
      sourceIndex,
      1
    );
    updatedOrder.splice(targetIndex, 0, movedDay);
    setOrderedDays(updatedOrder);
    setSavingOrder(true);
    setError("");
    try {
      const response = await axios.put(
        `${API_URL}/calendar-order`,
        {
          year,
          month,
          dayOrder: updatedOrder,
        }
      );
      if (!response.data.success) {
        throw new Error(
          "The server did not confirm the saved order."
        );
      }
    } catch (err) {
      console.error(
        "Failed to save calendar order:",
        err.response?.data || err.message
      );
      setError(
        "Unable to save calendar order. Please try again."
      );
      try {
        const response = await axios.get(
          `${API_URL}/calendar-order`,
          { params: { year, month } }
        );
        if (
          response.data.success &&
          Array.isArray(response.data.dayOrder)
        ) {
          setOrderedDays(response.data.dayOrder);
        }
      } catch (restoreError) {
        console.error(
          "Could not restore calendar order:",
          restoreError
        );
      }
    } finally {
      setSavingOrder(false);
    }
  };
  // Clear drag state
  const handleDragEnd = () => {
    setDraggedDay(null);
  };
  // Handle newly added creative
  const handleCreativeAdded = (newCreative) => {
    if (newCreative) {
      setCreatives((previous) => {
        const exists = previous.some(
          (creative) =>
            creative._id === newCreative._id
        );
        if (exists) {
          return previous.map((creative) =>
            creative._id === newCreative._id
              ? newCreative
              : creative
          );
        }
        return [...previous, newCreative];
      });
      setSelectedCreative(newCreative);
    } else {
      // Refetch if the modal does not return the new document
      fetchCreatives();
    }
    setShowModal(false);
    setSelectedDate(null);
  };
  return (
    <div className="instagram-container">
      <div className="instagram-header">
        <div>
          <h2>Creative Calendar</h2>
          <p>
            Drag and drop tiles to rearrange their positions
          </p>
        </div>
        <div className="instagram-month-navigation">
          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            disabled={savingOrder}
          >
            &#8249;
          </button>
          <h3>
            {monthName} {year}
          </h3>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
            disabled={savingOrder}
          >
            &#8250;
          </button>
          <button
            type="button"
            className="instagram-today-button"
            onClick={goToCurrentMonth}
            disabled={savingOrder}
          >
            Today
          </button>
        </div>
      </div>
      {savingOrder && (
        <div className="instagram-save-status">
          Saving new order...
        </div>
      )}
      {error && (
        <div className="instagram-error">
          {error}
        </div>
      )}
      {loading ? (
        <div className="instagram-message">
          Loading creatives...
        </div>
      ) : (
        <div className="instagram-calendar">
          <div className="instagram-weekdays">
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="instagram-calendar-grid">
            {orderedDays.map((day) => {
              const creative = getCreativeForDate(day);
              return (
                <div
                  className={`instagram-date-cell ${
                    draggedDay === day
                      ? "instagram-dragging"
                      : ""
                  }`}
                  key={day}
                  draggable={!savingOrder}
                  onClick={() => handleDateClick(day)}
                  onDragStart={(event) =>
                    handleDragStart(event, day)
                  }
                  onDragOver={handleDragOver}
                  onDrop={(event) =>
                    handleDrop(event, day)
                  }
                  onDragEnd={handleDragEnd}
                  title={
                    creative
                      ? "Click to view creative"
                      : "Click to add creative"
                  }
                >
                  <div className="instagram-date-number">
                    {day}
                  </div>
                  {creative?.image ? (
                    <button
                      type="button"
                      className="instagram-creative-image"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedCreative(creative);
                        setShowModal(false);
                      }}
                      draggable={false}
                      title={`View creative for ${day} ${monthName}`}
                    >
                      <img
                        src={getImageUrl(creative.image)}
                        alt={`Creative for ${day} ${monthName} ${year}`}
                        loading="lazy"
                        draggable={false}
                        onError={(event) => {
                          console.error(
                            "Creative image failed to load:",
                            event.currentTarget.src
                          );
                        }}
                      />
                    </button>
                  ) : (
                    <div
                      className="instagram-no-creative"
                      aria-label={`No creative for date ${day}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Add Creative Modal - same props as CalendarView */}
      {showModal && selectedDate && (
        <AddCreativeModal
          selectedDate={selectedDate}
          onClose={() => {
            setShowModal(false);
            setSelectedDate(null);
          }}
          onCreativeAdded={handleCreativeAdded}
        />
      )}
      {/* Existing Creative Details Modal */}
      {selectedCreative && (
        <CreativeDetailsModal
          creative={selectedCreative}
          onClose={() => setSelectedCreative(null)}
        />
      )}
    </div>
  );
}
export default InstagramView;
