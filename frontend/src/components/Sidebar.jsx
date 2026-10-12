import {
  LayoutDashboard,
  CalendarDays,
  Image,
  Clock,
  CheckCircle,
  XCircle,
  ChartNoAxesCombined,
  Settings,
  UserRound,
  LogOut,
  Layers,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import "../styles/Sidebar.css";
function Sidebar({
  activePage = "Dashboard",
  setActivePage,
  onLogout,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Calendar", icon: CalendarDays },
    { name: "All Creatives", icon: Image },
    { name: "Pending Review", icon: Clock },
    { name: "Approved", icon: CheckCircle },
    { name: "Rejected", icon: XCircle },
    { name: "Analytics", icon: ChartNoAxesCombined },
    { name: "Settings", icon: Settings },
  ];
  const handleNavigation = (page) => {
    setActivePage?.(page);
    setMobileOpen(false);
  };
  return (
    <>
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`app-sidebar
          ${isCollapsed ? "collapsed" : ""}
          ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Layers size={25} />
          </div>
          {!isCollapsed && (
            <div className="sidebar-brand-text">
              <h2>Creative Manager</h2>
              <p>CONTENT MANAGEMENT</p>
            </div>
          )}
        </div>
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu size={19} /> : <X size={19} />}
        </button>
        <div className="sidebar-section-label">
          {!isCollapsed && "MAIN MENU"}
        </div>
        <nav className="sidebar-navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.name;
            return (
              <button
                type="button"
                key={item.name}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavigation(item.name)}
                title={isCollapsed ? item.name : ""}
              >
                <Icon size={20} strokeWidth={1.9} />
                {!isCollapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              <UserRound size={21} />
            </div>
            {!isCollapsed && (
              <div className="sidebar-profile-info">
                <h4>Admin</h4>
                <p>Content Manager</p>
              </div>
            )}
          </div>
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={() => onLogout?.()}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut size={19} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
export default Sidebar;
