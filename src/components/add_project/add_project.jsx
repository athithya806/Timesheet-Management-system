import React, { useState } from "react";
import "./add_project.css";

const AddProject = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [status, setStatus] = useState("");

  return (
    <div className="form-container">
      {/* Tabs */}
      <div className="form-tabs">
        <div
          className={`form-tab ${activeTab === "basic" ? "active" : ""}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic details
        </div>
        <div
          className={`form-tab ${activeTab === "team" ? "active" : ""}`}
          onClick={() => setActiveTab("team")}
        >
          Team & Roles
        </div>
        <div
          className={`form-tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </div>
      </div>

      {/* Basic Details Form */}
      {activeTab === "basic" && (
        <>
          <div className="form-group">
            <label className="form-label">Project name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Website Redesign"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Client name</label>
            <input
              className="form-input"
              type="text"
              placeholder="ABC Corp"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Start date</label>
            <input className="form-input" type="date" />
          </div>

          <div className="form-group">
            <label className="form-label">End date</label>
            <input className="form-input" type="date" />
          </div>

          <div className="form-group">
            <label className="form-label">Project status</label>
            <div className="gender-options">
              <button
                type="button"
                className={`gender-btn ${status === "planning" ? "active" : ""}`}
                onClick={() => setStatus("yet to start")}
              >
                Planning
              </button>
              <button
                type="button"
                className={`gender-btn ${status === "inprogress" ? "active" : ""}`}
                onClick={() => setStatus("ongoing")}
              >
                In Progress
              </button>
              <button
                type="button"
                className={`gender-btn ${status === "completed" ? "active" : ""}`}
                onClick={() => setStatus("completed")}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Project description</label>
            <textarea
              className="form-input"
              rows="4"
              placeholder="Enter a short description of the project..."
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary">Previous</button>
            <button className="btn btn-primary">Next</button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddProject;
