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
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [projectType, setProjectType] = useState("billable");
  const [phases, setPhases] = useState([]);

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/members");
        if (!res.ok) throw new Error("Failed to fetch members");
        const data = await res.json();
        setMembers(data);
      } catch (err) {
        console.error("❌ Error fetching members:", err);
      }
    };
    fetchMembers();
  }, []);

  const handleMemberChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (!value.trim()) {
      setFilteredMembers([]);
      setShowDropdown(false);
      return;
    }

    // Filter by names that start with the input string
    const filtered = members
      .filter(
        (m) =>
          m.fullName &&
          m.fullName.toLowerCase().startsWith(value.toLowerCase()) && // Changed to startsWith
          !assignedMembers.includes(m.fullName)
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName));

    setFilteredMembers(filtered);
    setShowDropdown(true);
  };

  const handleSelectMember = (fullName) => {
    if (!assignedMembers.includes(fullName)) {
      setAssignedMembers([...assignedMembers, fullName]);
    }
    setSearchInput("");
    setShowDropdown(false);
  };

  const handleRemoveMember = (fullName) => {
    setAssignedMembers(assignedMembers.filter((m) => m !== fullName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName || !description) {
      alert("Please fill in required fields");
      return;
    }

    const newProject = {
      projectName,
      projectType,
      description,
      plannedStartDate: plannedStartDate || null,
      plannedEndDate: plannedEndDate || null,
      actualStartDate: actualStartDate || null,
      actualEndDate: actualEndDate || null,
      assignedMembers: assignedMembers || [],
      status: status || "ongoing",
      phases: phases || [],
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
      setAssignedMembers([]);
      setProjectType("billable");
      setPhases([]);
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
              <option value="billable">Billable</option>
              <option value="internal">Internal</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Assign Members</label>
          <div className="multi-select-container">
            <div className="selected-chips">
              {assignedMembers.map((m) => (
                <span key={m} className="chip">
                  {m}
                  <button
                    type="button"
                    className="chip-close"
                    onClick={() => handleRemoveMember(m)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              className="form-input"
              type="text"
              placeholder="Type to search members..."
              value={searchInput}
              onChange={handleMemberChange}
            />
            {showDropdown && filteredMembers.length > 0 && (
              <ul className="dropdown">
                {filteredMembers.map((m) => (
                  <li key={m.id} onClick={() => handleSelectMember(m.fullName)}>
                    {m.fullName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

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
