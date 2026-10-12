import { useState } from "react";
import CalendarView from "../components/CalendarView";
import InstagramView from "../components/InstagramView";

function Home() {
  const [view, setView] = useState("calendar");

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>Creative Manager</h1>
          <p>Plan and manage your creatives</p>
        </div>

        <div className="view-switch">
          <button
            className={view === "instagram" ? "active" : ""}
            onClick={() => setView("instagram")}
          >
            Instagram View
          </button>

          <button
            className={view === "calendar" ? "active" : ""}
            onClick={() => setView("calendar")}
          >
            Calendar View
          </button>
        </div>
      </header>

      <main className="content">
        {view === "calendar" ? (
          <CalendarView />
        ) : (
          <InstagramView/>
        )}
      </main>
    </div>
  );
}

export default Home;