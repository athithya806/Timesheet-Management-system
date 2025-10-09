import React, { useState } from "react";
import "./sidebar.css";
import { FaUserCircle, FaClock, FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("Profile");

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--x", `${x}px`);
    e.currentTarget.style.setProperty("--y", `${y}px`);
  };

  return (
    <div className="sidebar">
      {/* flowing animated background */}
      <div className="flow-bg"></div>

      <div className="sidebar-header">
        <h2 className="logo">TANSAM</h2>
      </div>

      {/* top menu */}
      <ul className="menu-list top-menu">
        <li
          className={`menu-item ${activeItem === "Profile" ? "active" : ""}`}
          onClick={() => setActiveItem("Profile")}
          onMouseMove={handleMouseMove}
        >
          <FaUserCircle /> Profile
          <span className="hover-glow"></span>
        </li>

        <li
          className={`menu-item ${activeItem === "Timesheet" ? "active" : ""}`}
          onClick={() => setActiveItem("Timesheet")}
          onMouseMove={handleMouseMove}
        >
          <FaClock /> Timesheet
          <span className="hover-glow"></span>
        </li>
      </ul>

      {/* only bottom menu */}
      <div className="bottom-section">
        <ul className="menu-list bottom-menu">
          <li
            className={`menu-item logout ${activeItem === "Logout" ? "active" : ""}`}
            onClick={() => setActiveItem("Logout")}
            onMouseMove={handleMouseMove}
          >
            <FaSignOutAlt /> Logout
            <span className="hover-glow"></span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
