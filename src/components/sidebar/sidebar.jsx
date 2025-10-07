import React, { useState } from "react";
import "./Sidebar.css";
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
        <div className="menu-icon">&#9776;</div>
      </div>

      {/* only bottom menu */}
      <div className="bottom-section">
        <ul className="menu-list">
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

          <li
            className={`menu-item logout ${
              activeItem === "Logout" ? "active" : ""
            }`}
            onClick={() => setActiveItem("Logout")}
            onMouseMove={handleMouseMove}
          >
            <FaSignOutAlt /> Logout
            <span className="hover-glow"></span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <img
            src="https://via.placeholder.com/40"
            alt="profile"
            className="profile-pic"
          />
          <div className="user-info">
            <p className="name">Athithya</p>
            <p className="email">athithya@tansam.org</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
