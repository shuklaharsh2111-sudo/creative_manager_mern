import { useState } from "react";
import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaPinterest,
  FaGoogle,
} from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";
import {
  CalendarDays,
  Images,
} from "lucide-react";
import CalendarView from "../components/CalendarView";
import InstagramView from "../components/InstagramView";
import "../styles/home.css";
const PLATFORMS = [
  { id: "instagram", label: "Instagram", Icon: FaInstagram },
  { id: "facebook", label: "Facebook", Icon: FaFacebook },
  { id: "linkedin", label: "LinkedIn", Icon: FaLinkedin },
  { id: "google", label: "Google", Icon: FaGoogle },
  { id: "youtube", label: "YouTube", Icon: FaYoutube },
  { id: "x", label: "X", Icon: FaXTwitter },
  { id: "pinterest", label: "Pinterest", Icon: FaPinterest },
  { id: "threads", label: "Threads", Icon: FaThreads },
];
function Home() {
  const [platform, setPlatform] = useState("instagram");
  const [view, setView] = useState("calendar");
  const selectedPlatform = PLATFORMS.find(
    (item) => item.id === platform
  );
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">
            <Images size={25} />
          </div>
          <div className="brand-text">
            <h1>Creative Manager</h1>
            <p>Plan and manage your creatives</p>
          </div>
        </div>
        <div className="view-switch">
          <button
            type="button"
            className={view === "instagram" ? "active" : ""}
            onClick={() => setView("instagram")}
          >
            <Images size={17} />
            <span>Creative View</span>
          </button>
          <button
            type="button"
            className={view === "calendar" ? "active" : ""}
            onClick={() => setView("calendar")}
          >
            <CalendarDays size={17} />
            <span>Calendar View</span>
          </button>
        </div>
      </header>
      <section className="platform-section">
        <div className="platform-heading">
          <div>
            <h2>Platforms</h2>
            <p>Select a platform to manage its creatives</p>
          </div>
          <span className="platform-count">
            {PLATFORMS.length} Platforms
          </span>
        </div>
        <nav
          className="platform-tabs"
          aria-label="Social media platforms"
        >
          {PLATFORMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`platform-tab platform-${id} ${
                platform === id ? "active" : ""
              }`}
              onClick={() => setPlatform(id)}
              aria-pressed={platform === id}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </section>
      <main className="content">
        <div className="selected-platform-heading">
          <div className={`selected-platform-icon platform-${platform}`}>
            {selectedPlatform && (
              <selectedPlatform.Icon size={23} />
            )}
          </div>
          <div>
            <h2>{selectedPlatform?.label} Creatives</h2>
            <p>
              Manage your {selectedPlatform?.label} creative schedule
            </p>
          </div>
        </div>
        {view === "calendar" ? (
          <CalendarView
            key={`calendar-${platform}`}
            platform={platform}
          />
        ) : (
          <InstagramView
            key={`creative-${platform}`}
            platform={platform}
          />
        )}
      </main>
    </div>
  );
}
export default Home;
