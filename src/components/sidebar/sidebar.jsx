import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./sidebar.css";
import { FaUserCircle, FaClock, FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Map paths to sidebar item names
  const pathsToMenu = {
    "/profile": "Profile",
    "/timesheet": "Timesheet",
  };

  // Determine which item is active based on the current URL
  const activeItem = pathsToMenu[location.pathname] || "";

  // Mouse glow effect
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--x", `${x}px`);
    e.currentTarget.style.setProperty("--y", `${y}px`);
  };

  // Handle navigation
  const handleClick = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar">
      <div className="flow-bg"></div>

      <div className="sidebar-header">
        <h2 className="logo">TANSAM</h2>
      </div>

      <ul className="menu-list top-menu">
        <li
          className={`menu-item ${activeItem === "Profile" ? "active" : ""}`}
          onClick={() => handleClick("/profile")}
          onMouseMove={handleMouseMove}
        >
          <FaUserCircle /> Profile
          <span className="hover-glow"></span>
        </li>

        <li
          className={`menu-item ${activeItem === "Timesheet" ? "active" : ""}`}
          onClick={() => handleClick("/timesheet")}
          onMouseMove={handleMouseMove}
        >
          <FaClock /> Timesheet
          <span className="hover-glow"></span>
        </li>
      </ul>

      <div className="bottom-section">
        <ul className="menu-list bottom-menu">
          <li
            className={`menu-item logout ${activeItem === "Logout" ? "active" : ""}`}
            onClick={() => handleClick("/logout")}
            onMouseMove={handleMouseMove}
          >
            <FaSignOutAlt /> Logout
            <span className="hover-glow"></span>
          </li>
        </ul>

        <div className="sidebar-footer"></div>
      </div>
    </div>
  );
};

export default Sidebar;
