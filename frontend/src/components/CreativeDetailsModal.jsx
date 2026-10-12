import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

function CreativeDetailsModal({
  creative,
  onClose,
  onStatusUpdated,
}) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!creative) return null;

  const imageUrl = `http://localhost:5000${creative.image}`;

  const formattedDate = new Date(
    creative.creative_date
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleStatusUpdate = async (status) => {
    if (
      status === "rejected" &&
      !rejectionReason.trim()
    ) {
      setError("Please enter a reason for rejecting.");
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const payload = { status };

      if (status === "rejected") {
        payload.rejectionReason = rejectionReason.trim();
      }

      const response = await axios.patch(
        `http://localhost:5000/api/creatives/${creative._id}/status`,
        payload
      );

      if (response.data.success) {
        onStatusUpdated(response.data.creative);
        setShowRejectForm(false);
        setRejectionReason("");
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to update status."
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="creative-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="details-modal-header">
          <div>
            <h2>Creative Details</h2>
            <p>{formattedDate}</p>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="details-modal-content">
          {/* Image */}
          <div className="details-image-wrapper">
            <img
              src={imageUrl}
              alt="Creative"
              className="details-image"
            />
          </div>

          {/* Details */}
          <div className="creative-details-info">
            <div className="detail-item">
              <span className="detail-label">
                Caption
              </span>
              <p className="detail-value">
                {creative.caption || "No caption available."}
              </p>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                SEO Title
              </span>
              <p className="detail-value">
                {creative.seo?.title || "No SEO title added."}
              </p>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                SEO Description
              </span>
              <p className="detail-value">
                {creative.seo?.description ||
                  "No SEO description added."}
              </p>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                SEO Keywords
              </span>

              <div className="keyword-list">
                {creative.seo?.keywords?.length > 0 ? (
                  creative.seo.keywords.map(
                    (keyword, index) => (
                      <span
                        className="keyword-tag"
                        key={index}
                      >
                        {keyword}
                      </span>
                    )
                  )
                ) : (
                  <span className="no-data">
                    No keywords added.
                  </span>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="detail-item">
              <span className="detail-label">
                Status
              </span>

              <span
                className={`details-status ${creative.status}`}
              >
                {creative.status}
              </span>
            </div>

            {/* Saved rejection reason */}
            {creative.status === "rejected" &&
              creative.rejectionReason && (
                <div className="detail-item">
                  <span className="detail-label">
                    Reason for Rejecting
                  </span>

                  <p className="detail-value">
                    {creative.rejectionReason}
                  </p>
                </div>
              )}

            {/* Error */}
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            {/* Status Actions */}
            {creative.status === "pending" && (
              <div className="status-actions">
                <button
                  type="button"
                  className="status-btn approve-btn"
                  disabled={updating}
                  onClick={() =>
                    handleStatusUpdate("approved")
                  }
                >
                  {updating ? "Updating..." : "Approve"}
                </button>

                <button
                  type="button"
                  className="status-btn reject-btn"
                  disabled={updating}
                  onClick={() => {
                    setError("");
                    setShowRejectForm(true);
                  }}
                >
                  Reject
                </button>
              </div>
            )}

            {/* Rejection Form */}
            {creative.status === "pending" &&
              showRejectForm && (
                <div className="reject-reason-form">
                  <label htmlFor="rejectionReason">
                    Reason for Rejecting
                  </label>

                  <textarea
                    id="rejectionReason"
                    name="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => {
                      setRejectionReason(e.target.value);
                      setError("");
                    }}
                    placeholder="Explain why this creative is being rejected..."
                    rows={4}
                    maxLength={1000}
                    required
                    disabled={updating}
                  />

                  <div className="reject-form-actions">
                    <button
                      type="button"
                      className="status-btn reject-btn"
                      disabled={updating}
                      onClick={() =>
                        handleStatusUpdate("rejected")
                      }
                    >
                      {updating
                        ? "Rejecting..."
                        : "Confirm Rejection"}
                    </button>

                    <button
                      type="button"
                      className="status-btn cancel-reject-btn"
                      disabled={updating}
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectionReason("");
                        setError("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

            {/* Upload Creative */}
            {creative.status === "approved" && (
              <div className="upload-creative-section">
                <button
                  type="button"
                  className="upload-creative-btn"
                  onClick={() => {
                    alert("Upload Creative clicked.");
                  }}
                >
                  Upload Creative
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreativeDetailsModal;