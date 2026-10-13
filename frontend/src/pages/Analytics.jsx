import { useEffect, useState } from "react";
import axios from "axios";
import {
  Image,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import "../styles/analytics.css";
const API_URL = "/api/creatives/analytics";
function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL);
      const data = response.data;
      // Supports both nested and direct analytics responses.
      const analyticsData =
        data?.analytics ??
        data?.data?.analytics ??
        data?.data ??
        data;
      setAnalytics(analyticsData || {});
      console.log("Analytics API response:", data);
      console.log("Analytics data:", analyticsData);
    } catch (err) {
      console.error(
        "Analytics fetch error:",
        err.response?.status,
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          "Analytics load nahi ho paaya. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAnalytics();
  }, []);
  if (loading) {
    return (
      <div className="analytics-message">
        Loading analytics...
      </div>
    );
  }
  if (error) {
    return (
      <div className="analytics-message analytics-error">
        <p>{error}</p>
        <button
          type="button"
          onClick={fetchAnalytics}
          disabled={loading}
        >
          Try Again
        </button>
      </div>
    );
  }
  const total = Number(analytics?.total ?? 0);
  const pending = Number(analytics?.pending ?? 0);
  const approved = Number(analytics?.approved ?? 0);
  const rejected = Number(analytics?.rejected ?? 0);
  const approvalRate =
    total > 0
      ? Math.round((approved / total) * 100)
      : 0;
  const statusData = [
    {
      label: "Approved",
      value: approved,
      className: "approved",
    },
    {
      label: "Pending",
      value: pending,
      className: "pending",
    },
    {
      label: "Rejected",
      value: rejected,
      className: "rejected",
    },
  ];
  const monthlyUploads = Array.isArray(
    analytics?.monthlyUploads
  )
    ? analytics.monthlyUploads
    : [];
  const maxMonthlyCount = Math.max(
    1,
    ...monthlyUploads.map(
      (item) => Number(item.count) || 0
    )
  );
  return (
    <section className="analytics-page">
      <header className="analytics-header">
        <div>
          <p className="analytics-eyebrow">
            PERFORMANCE OVERVIEW
          </p>
          <h1>Analytics</h1>
          <p>
            Track creative uploads and review performance.
          </p>
        </div>
        <button
          type="button"
          className="analytics-refresh"
          onClick={fetchAnalytics}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>
      <div className="analytics-stats-grid">
        <article className="analytics-stat-card">
          <div className="analytics-stat-icon total-icon">
            <Image size={21} />
          </div>
          <p>Total Creatives</p>
          <h2>{total}</h2>
          <span>All uploaded creatives</span>
        </article>
        <article className="analytics-stat-card">
          <div className="analytics-stat-icon pending-icon">
            <Clock size={21} />
          </div>
          <p>Pending Review</p>
          <h2>{pending}</h2>
          <span>Awaiting review</span>
        </article>
        <article className="analytics-stat-card">
          <div className="analytics-stat-icon approved-icon">
            <CheckCircle size={21} />
          </div>
          <p>Approved</p>
          <h2>{approved}</h2>
          <span>Approved creatives</span>
        </article>
        <article className="analytics-stat-card">
          <div className="analytics-stat-icon rejected-icon">
            <XCircle size={21} />
          </div>
          <p>Rejected</p>
          <h2>{rejected}</h2>
          <span>Rejected creatives</span>
        </article>
      </div>
      <div className="analytics-content-grid">
        <article className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <h3>Monthly Uploads</h3>
              <p>Creative uploads over the selected period</p>
            </div>
            <TrendingUp size={21} />
          </div>
          {monthlyUploads.length > 0 ? (
            <div className="monthly-chart">
              {monthlyUploads.map((item, index) => {
                const count = Number(item.count) || 0;
                const monthKey =
                  `${item.year}-${item.month}-${index}`;
                return (
                  <div
                    className="monthly-chart-column"
                    key={monthKey}
                  >
                    <span className="monthly-chart-count">
                      {count}
                    </span>
                    <div className="monthly-bar-track">
                      <div
                        className="monthly-bar"
                        style={{
                          height: `${
                            (count / maxMonthlyCount) * 100
                          }%`,
                        }}
                        title={`${item.month} ${item.year}: ${count} creatives`}
                      />
                    </div>
                    <span className="monthly-chart-label">
                      {item.month}
                    </span>
                    <span className="monthly-chart-year">
                      {item.year}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="analytics-message">
              No monthly upload data available yet.
            </div>
          )}
        </article>
        <article className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <h3>Status Distribution</h3>
              <p>Breakdown of all creatives</p>
            </div>
          </div>
          <div className="status-chart">
            {statusData.map((item) => {
              const percentage =
                total > 0
                  ? Math.round(
                      (item.value / total) * 100
                    )
                  : 0;
              return (
                <div
                  className="status-chart-item"
                  key={item.label}
                >
                  <div className="status-chart-label-row">
                    <span>
                      <span
                        className={`status-dot ${item.className}`}
                      />
                      {item.label}
                    </span>
                    <strong>
                      {item.value} ({percentage}%)
                    </strong>
                  </div>
                  <div className="status-track">
                    <div
                      className={`status-fill ${item.className}`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="approval-rate">
            <span>Approval Rate</span>
            <strong>{approvalRate}%</strong>
          </div>
        </article>
      </div>
    </section>
  );
}
export default Analytics;
