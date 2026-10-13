import { useEffect, useState } from "react";
import axios from "axios";
import {
  Images,
  Clock3,
  CheckCircle2,
  XCircle,
  CalendarDays,
  ArrowRight,
  Image as ImageIcon,
  RefreshCw,
  ChartNoAxesCombined,
} from "lucide-react";
import "../styles/dashboard.css";
const API_URL = axios.get("/api/creatives");
function Dashboard({ setActivePage }) {
  const [analytics, setAnalytics] = useState(null);
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const [analyticsResponse, creativesResponse] =
        await Promise.all([
          axios.get(`${API_URL}/analytics`),
          axios.get(API_URL),
        ]);
      const analyticsData = analyticsResponse.data?.analytics;
      const creativesData = creativesResponse.data;
      setAnalytics(analyticsData || {});
      const creativeList = Array.isArray(creativesData)
        ? creativesData
        : Array.isArray(creativesData?.creatives)
          ? creativesData.creatives
          : [];
      setCreatives(
        [...creativeList].sort(
          (a, b) =>
            new Date(b.createdAt || b.creative_date || 0) -
            new Date(a.createdAt || a.creative_date || 0)
        )
      );
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const stats = [
    {
      title: "Total Creatives",
      value: analytics?.total ?? 0,
      icon: Images,
      color: "blue",
      page: "All Creatives",
    },
    {
      title: "Pending Review",
      value: analytics?.pending ?? 0,
      icon: Clock3,
      color: "orange",
      page: "Pending Review",
    },
    {
      title: "Approved",
      value: analytics?.approved ?? 0,
      icon: CheckCircle2,
      color: "green",
      page: "Approved",
    },
    {
      title: "Rejected",
      value: analytics?.rejected ?? 0,
      icon: XCircle,
      color: "red",
      page: "Rejected",
    },
  ];
  const monthlyUploads = analytics?.monthlyUploads || [];
  const maxMonthlyCount = Math.max(
    1,
    ...monthlyUploads.map((item) => Number(item.count) || 0)
  );
  const recentCreatives = creatives.slice(0, 5);
  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
return `${
  image.startsWith("/") ? image : `/${image}`
}`;
  };
  const formatDate = (date) => {
    if (!date) return "—";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "—";
    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const getStatus = (status) => {
    const normalizedStatus = (status || "pending").toLowerCase();
    return normalizedStatus;
  };
  const navigateTo = (page) => {
    setActivePage?.(page);
  };
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-message">
          <RefreshCw size={22} className="dashboard-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome back! Here's an overview of your creative content.
          </p>
        </div>
        <button
          type="button"
          className="dashboard-refresh-btn"
          onClick={fetchDashboardData}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>
      {error && (
        <div className="dashboard-error">
          <p>{error}</p>
          <button type="button" onClick={fetchDashboardData}>
            Try Again
          </button>
        </div>
      )}
      <div className="dashboard-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              type="button"
              className="dashboard-stat-card"
              key={stat.title}
              onClick={() => navigateTo(stat.page)}
            >
              <div className="dashboard-stat-top">
                <span>{stat.title}</span>
                <div className={`dashboard-stat-icon ${stat.color}`}>
                  <Icon size={21} />
                </div>
              </div>
              <div className="dashboard-stat-value">
                {stat.value}
              </div>
              <div className="dashboard-stat-footer">
                View details <ArrowRight size={15} />
              </div>
            </button>
          );
        })}
      </div>
      <div className="dashboard-main-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Monthly Uploads</h2>
              <p>Creative uploads over the last 6 months</p>
            </div>
            <ChartNoAxesCombined size={21} />
          </div>
          {monthlyUploads.length > 0 ? (
            <div className="dashboard-monthly-chart">
              {monthlyUploads.map((item) => (
                <div
                  className="dashboard-month-column"
                  key={`${item.year}-${item.month}`}
                >
                  <span className="dashboard-month-count">
                    {item.count}
                  </span>
                  <div className="dashboard-month-track">
                    <div
                      className="dashboard-month-bar"
                      style={{
                        height: `${
                          ((Number(item.count) || 0) /
                            maxMonthlyCount) *
                          100
                        }%`,
                      }}
                      title={`${item.month} ${item.year}: ${item.count} uploads`}
                    />
                  </div>
                  <span className="dashboard-month-label">
                    {item.month}
                  </span>
                  <span className="dashboard-month-year">
                    {item.year}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              No monthly upload data available yet.
            </div>
          )}
        </section>
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Jump to a section</p>
            </div>
          </div>
          <div className="dashboard-quick-actions">
            <button
              type="button"
              onClick={() => navigateTo("Calendar")}
            >
              <CalendarDays size={20} />
              <span>
                <strong>Open Calendar</strong>
                <small>View creatives by date</small>
              </span>
              <ArrowRight size={17} />
            </button>
            <button
              type="button"
              onClick={() => navigateTo("All Creatives")}
            >
              <Images size={20} />
              <span>
                <strong>All Creatives</strong>
                <small>Browse all uploaded content</small>
              </span>
              <ArrowRight size={17} />
            </button>
            <button
              type="button"
              onClick={() => navigateTo("Pending Review")}
            >
              <Clock3 size={20} />
              <span>
                <strong>Pending Review</strong>
                <small>Review awaiting creatives</small>
              </span>
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </div>
      <section className="dashboard-panel dashboard-recent-panel">
        <div className="dashboard-panel-header">
          <div>
            <h2>Recent Creatives</h2>
            <p>Your latest uploaded content</p>
          </div>
          <button
            type="button"
            className="dashboard-view-all"
            onClick={() => navigateTo("All Creatives")}
          >
            View All <ArrowRight size={16} />
          </button>
        </div>
        {recentCreatives.length > 0 ? (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Creative</th>
                  <th>Upload Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentCreatives.map((creative, index) => {
                  const status = getStatus(creative.status);
                  return (
                    <tr
                      key={
                        creative._id ||
                        creative.id ||
                        `${creative.caption}-${index}`
                      }
                    >
                      <td>
                        <div className="dashboard-creative-cell">
                          {creative.image ? (
                            <img
                              src={getImageUrl(creative.image)}
                              alt={creative.caption || "Creative"}
                            />
                          ) : (
                            <div className="dashboard-image-placeholder">
                              <ImageIcon size={20} />
                            </div>
                          )}
                          <div className="dashboard-creative-info">
                            <strong>
                              {creative.caption || "Untitled Creative"}
                            </strong>
                            <small>
                              {creative.seo?.title ||
                                creative.seoTitle ||
                                "Creative content"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {formatDate(
                          creative.createdAt || creative.creative_date
                        )}
                      </td>
                      <td>
                        <span
                          className={`dashboard-status-badge ${status}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-empty-state">
            No creatives have been uploaded yet.
          </div>
        )}
      </section>
    </div>
  );
}
export default Dashboard;
