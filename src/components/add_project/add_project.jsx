import React, { useState } from "react";
import "./add_project.css";

const AddProject = () => {
  const [status, setStatus] = useState("");

  return (
    <div className="form-container">
      {/* Tab */}
      <div className="form-tabs">
        <div className="form-tab active">Project Details</div>
      </div>

      {/* Form Fields */}
      <div className="form-column">
        {/* Row 1: Project Name | Project Type */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Website Redesign"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Project Type</label>
            <select className="form-input">
              <option value="">Select Type</option>
              <option value="billable">Billable</option>
              <option value="internal">Internal</option>
            </select>
          </div>
        </div>

        {/* Client Name Full Width */}
        <div className="form-group">
          <label className="form-label">Client Name</label>
          <input
            className="form-input"
            type="text"
            placeholder="ABC Corp"
          />
        </div>

        {/* Project Description Full Width */}
        <div className="form-group">
          <label className="form-label">Project Description</label>
          <textarea
            className="form-input"
            rows="3"
            placeholder="Enter a short description..."
          />
        </div>

        {/* Row 2: Planned Start Date | Planned End Date */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Planned Start Date</label>
            <input className="form-input" type="date" />
          </div>
          <div className="form-group">
            <label className="form-label">Planned End Date</label>
            <input className="form-input" type="date" />
          </div>
        </div>

        {/* Row 3: Actual Start Date | Actual End Date */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Actual Start Date</label>
            <input className="form-input" type="date" />
          </div>
          <div className="form-group">
            <label className="form-label">Actual End Date</label>
            <input className="form-input" type="date" />
          </div>
        </div>

        {/* Status Full Width */}
        <div className="form-group">
          <label className="form-label">Status</label>
          <div className="gender-options">
            <button
              type="button"
              className={`gender-btn ${status === "yet to start" ? "active" : ""}`}
              onClick={() => setStatus("yet to start")}
            >
              Yet to Start
            </button>
            <button
              type="button"
              className={`gender-btn ${status === "ongoing" ? "active" : ""}`}
              onClick={() => setStatus("ongoing")}
            >
              Ongoing
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
      </div>

      {/* Form Action */}
      <div className="form-actions">
        <button className="btn btn-primary">Add Project</button>
      </div>
    </div>
  );
};

export default AddProject;
