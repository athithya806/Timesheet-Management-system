import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- import
import "./sidebar.css";
import { FaUserCircle, FaClock, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("Profile");
  const navigate = useNavigate(); // <-- hook

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--x", `${x}px`);
    e.currentTarget.style.setProperty("--y", `${y}px`);
  };

  // <-- define handleClick
  const handleClick = (item, path) => {
    setActiveItem(item);
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
          onClick={() => handleClick("Profile", "/profile")}
          onMouseMove={handleMouseMove}
        >
          <FaUserCircle /> Profile
          <span className="hover-glow"></span>
        </li>

        <li
          className={`menu-item ${activeItem === "Timesheet" ? "active" : ""}`}
          onClick={() => handleClick("Timesheet", "/timesheet")}
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
            onClick={() => handleClick("Logout", "/logout")}
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
