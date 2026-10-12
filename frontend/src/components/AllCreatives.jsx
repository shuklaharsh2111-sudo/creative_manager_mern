import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import "../styles/all-creatives.css";
const API_URL = axios.get("/api/creatives");
const SERVER_URL = "";
function AllCreatives({ statusFilter = "all" }) {
  const [creatives, setCreatives] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchCreatives = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL);
      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.creatives)
        ? data.creatives
        : Array.isArray(data.data)
        ? data.data
        : [];
      setCreatives(list);
    } catch (err) {
      console.error("Failed to fetch creatives:", err);
      setError(
        "Creatives load nahi ho paaye. Backend check karke retry karo."
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCreatives();
  }, []);
  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `${SERVER_URL}/${image.replace(/^\/+/, "")}`;
  };
  const filteredCreatives = creatives.filter((creative) => {
    const status = String(creative.status || "pending").toLowerCase();
    const matchesStatus =
      statusFilter !== "all"
        ? status === statusFilter.toLowerCase()
        : selectedStatus === "all" || status === selectedStatus;
    const searchText = [
      creative.caption,
      creative.seo?.title,
      creative.seo?.description,
      ...(Array.isArray(creative.seo?.keywords)
        ? creative.seo.keywords
        : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = searchText.includes(
      searchTerm.toLowerCase()
    );
    return matchesStatus && matchesSearch;
  });
  const pageTitle =
    statusFilter === "pending"
      ? "Pending Review"
      : statusFilter === "rejected"
      ? "Rejected Creatives"
      : statusFilter === "approved"
      ? "Approved Creatives"
      : "All Creatives";
  const formatDate = (date) => {
    if (!date) return "No date";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Invalid date";
    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  return (
    <section className="all-creatives-page">
      <div className="all-creatives-header">
        <div>
          <p className="all-creatives-eyebrow">CONTENT MANAGEMENT</p>
          <h1>{pageTitle}</h1>
          <p className="all-creatives-subtitle">
            View and manage your {pageTitle.toLowerCase()}.
          </p>
        </div>
        <button
          type="button"
          className="creatives-refresh-btn"
          onClick={fetchCreatives}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>
      <div className="all-creatives-toolbar">
        <div className="creatives-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by caption or SEO title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {statusFilter === "all" && (
          <select
            className="creatives-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter creatives by status"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        )}
      </div>
      {!loading && !error && (
        <div className="all-creatives-count">
          Showing {filteredCreatives.length} of {creatives.length} creatives
        </div>
      )}
      {loading ? (
        <div className="creatives-message">Loading creatives...</div>
      ) : error ? (
        <div className="creatives-message creatives-error">
          <p>{error}</p>
          <button type="button" onClick={fetchCreatives}>
            Try Again
          </button>
        </div>
      ) : filteredCreatives.length === 0 ? (
        <div className="creatives-empty-state">
          <ImageIcon size={42} />
          <h3>No creatives found</h3>
          <p>
            {creatives.length === 0
              ? "Abhi koi creative upload nahi hua hai."
              : "Is status mein koi creative nahi mila, ya search change karni hogi."}
          </p>
        </div>
      ) : (
        <div className="all-creatives-grid">
          {filteredCreatives.map((creative) => {
            const creativeStatus = String(
              creative.status || "pending"
            ).toLowerCase();
            return (
              <article
                className="all-creative-card"
                key={creative._id}
              >
                <div className="all-creative-image">
                  {creative.image ? (
                    <img
                      src={getImageUrl(creative.image)}
                      alt={creative.caption || "Creative"}
                      loading="lazy"
                    />
                  ) : (
                    <div className="creative-image-placeholder">
                      <ImageIcon size={36} />
                    </div>
                  )}
                  <span
                    className={`creative-status-badge ${creativeStatus}`}
                  >
                    {creative.status || "pending"}
                  </span>
                </div>
                <div className="all-creative-content">
                  <p className="all-creative-date">
                    {formatDate(creative.creative_date)}
                  </p>
                  <h3>{creative.seo?.title || "Untitled Creative"}</h3>
                  <p className="all-creative-caption">
                    {creative.caption || "No caption available"}
                  </p>
                  {creative.seo?.description && (
                    <p className="all-creative-description">
                      {creative.seo.description}
                    </p>
                  )}
                  {Array.isArray(creative.seo?.keywords) &&
                    creative.seo.keywords.length > 0 && (
                      <div className="all-creative-keywords">
                        {creative.seo.keywords.map((keyword, index) => (
                          <span key={`${keyword}-${index}`}>
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  {creativeStatus === "rejected" &&
                    creative.rejectionReason && (
                      <p className="all-creative-rejection">
                        <strong>Rejection reason:</strong>{" "}
                        {creative.rejectionReason}
                      </p>
                    )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
export default AllCreatives;
