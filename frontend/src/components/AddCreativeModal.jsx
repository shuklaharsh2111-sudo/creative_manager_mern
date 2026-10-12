import { useState } from "react";
import { X, Upload } from "lucide-react";
import axios from "axios";

function AddCreativeModal({ selectedDate, onClose, onCreativeAdded }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [keywords, setKeywords] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError("Please select a creative image.");
      return;
    }

    if (!caption.trim()) {
      setError("Please enter a caption.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append(
        "creative_date",
        selectedDate.toISOString()
      );

      formData.append("image", image);
      formData.append("caption", caption);
      formData.append("seo_title", seoTitle);
      formData.append("seo_description", seoDescription);
      formData.append("keywords", keywords);

      const response = await axios.post(
        "http://localhost:5000/api/creatives",
        formData
      );

      if (response.data.success) {
        onCreativeAdded(response.data.creative);
        onClose();
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to add creative."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="creative-modal">

        <div className="modal-header">
          <div>
            <h2>Add Creative</h2>

            <p>
              {selectedDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Creative Image</label>

            <label className="upload-box">
              <Upload size={25} />

              <span>
                {image
                  ? image.name
                  : "Click to upload image"}
              </span>

              <small>
                JPG, JPEG, PNG or WEBP
              </small>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) =>
                  setImage(e.target.files[0])
                }
                hidden
              />
            </label>
          </div>

          <div className="form-group">
            <label>Caption</label>

            <textarea
              value={caption}
              onChange={(e) =>
                setCaption(e.target.value)
              }
              placeholder="Write your creative caption..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>SEO Title</label>

            <input
              type="text"
              value={seoTitle}
              onChange={(e) =>
                setSeoTitle(e.target.value)
              }
              placeholder="Enter SEO title"
            />
          </div>

          <div className="form-group">
            <label>SEO Description</label>

            <textarea
              value={seoDescription}
              onChange={(e) =>
                setSeoDescription(e.target.value)
              }
              placeholder="Enter SEO description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>SEO Keywords</label>

            <input
              type="text"
              value={keywords}
              onChange={(e) =>
                setKeywords(e.target.value)
              }
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading
              ? "Adding Creative..."
              : "Add Creative"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddCreativeModal;