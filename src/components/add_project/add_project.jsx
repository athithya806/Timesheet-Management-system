import React, { useState, useEffect } from "react";
import "./add_project.css";

const AddProject = () => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ongoing");
  const [plannedStartDate, setPlannedStartDate] = useState("");
  const [plannedEndDate, setPlannedEndDate] = useState("");
  const [actualStartDate, setActualStartDate] = useState("");
  const [actualEndDate, setActualEndDate] = useState("");
  const [assignedMembers, setAssignedMembers] = useState("");
  const [projectType, setProjectType] = useState("billable");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName || !description) {
      alert("Please fill in all required fields");
      return;
    }

    const newProject = {
      projectName,
      projectType,
      description,
      plannedStartDate,
      plannedEndDate,
      actualStartDate: actualStartDate || null,
      actualEndDate: actualEndDate || null,
      assignedMembers,
      status,
    };

    try {
      const response = await fetch("http://localhost:3001/addProjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Request failed");
      }

      const data = await response.json();
      alert(data.message || "Project added successfully");

      // Reset form
      setProjectName("");
      setDescription("");
      setStatus("ongoing");
      setPlannedStartDate("");
      setPlannedEndDate("");
      setActualStartDate("");
      setActualEndDate("");
      setAssignedMembers("");
      setProjectType("billable");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="form-container">
      <div className="form-tabs">
        <div className="form-tab active">Project Details</div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Row 1: Project Name | Project Type */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Website Redesign"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Project Type</label>
            <select
              className="form-input"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              required
            >
              <option value="">Select Type</option>
              <option value="billable">Billable</option>
              <option value="internal">Internal</option>
            </select>
          </div>
        </div>

        {/* Client Name / Assigned Members */}
        <div className="form-group">
          <label className="form-label">Assign Members</label>
          <input
            className="form-input"
            type="text"
            placeholder="Enter team members"
            value={assignedMembers}
            onChange={(e) => setAssignedMembers(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Project Description</label>
          <textarea
            className="form-input"
            rows="3"
            placeholder="Enter a short description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Row 2: Planned Start/End */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Planned Start Date</label>
            <input
              className="form-input"
              type="date"
              value={plannedStartDate}
              onChange={(e) => setPlannedStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Planned End Date</label>
            <input
              className="form-input"
              type="date"
              value={plannedEndDate}
              onChange={(e) => setPlannedEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Row 3: Actual Start/End */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Actual Start Date</label>
            <input
              className="form-input"
              type="date"
              value={actualStartDate}
              onChange={(e) => setActualStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Actual End Date</label>
            <input
              className="form-input"
              type="date"
              value={actualEndDate}
              onChange={(e) => setActualEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Status buttons */}
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

        {/* Submit */}
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">
            Add Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProject;
