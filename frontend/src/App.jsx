import { useState } from "react";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import AllCreatives from "./components/AllCreatives";
import Analytics from "./pages/Analytics";
function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard setActivePage={setActivePage} />;
      case "Calendar":
        return <Home />;
      case "All Creatives":
        return <AllCreatives statusFilter="all" />;
      case "Pending Review":
        return <AllCreatives statusFilter="pending" />;
      case "Approved":
        return <AllCreatives statusFilter="approved" />;
      case "Rejected":
        return <AllCreatives statusFilter="rejected" />;
      case "Analytics":
        return <Analytics />;
      case "Settings":
        return (
          <div style={{ padding: "28px" }}>
            <h1>Settings</h1>
            <p>Settings page will be added here.</p>
          </div>
        );
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };
  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <main className="app-main-content">
        {renderPage()}
      </main>
    </div>
  );
}
export default App;