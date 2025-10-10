import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./add_project.css";

const DEPARTMENTS = [
  "Innovative Manufacturing",
  "Smart Factory Center",
  "AR | VR | MR Research Centre",
  "Digital Technology",
  "Research Centre For PLM",
  "Research Centre For Asset Performance",
  "Product Innovation Center",
  "Predictive Engineering",
];

const AddProject = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const projectData = location.state?.projectData || {};

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const [projectName, setProjectName] = useState(projectData.projectName || "");
  const [clientName, setClientName] = useState(projectData.clientName || "");
  const [description, setDescription] = useState(projectData.description || "");
  const [status, setStatus] = useState(projectData.status || "ongoing");
  const [plannedStartDate, setPlannedStartDate] = useState(formatDateForInput(projectData.plannedStartDate));
  const [plannedEndDate, setPlannedEndDate] = useState(formatDateForInput(projectData.plannedEndDate));
  const [actualStartDate, setActualStartDate] = useState(formatDateForInput(projectData.actualStartDate));
  const [actualEndDate, setActualEndDate] = useState(formatDateForInput(projectData.actualEndDate));
  const [assignedMembers, setAssignedMembers] = useState(projectData.assignedMembers || []);
  const [projectType, setProjectType] = useState(projectData.projectType || "billable");
  const [phases] = useState(projectData.phases || []);
  const [selectedDepartments, setSelectedDepartments] = useState(projectData.departments || []);

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const [deptSearchInput, setDeptSearchInput] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  const [activeTab, setActiveTab] = useState("addProject");

  // 🔹 Fetch all projects for stats
  const [projects, setProjects] = useState([]);

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

    // fetch all projects for stats
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:3001/getprojects");
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("❌ Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, []);

  // 🔹 Stats calculation
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const inProgressProjects = projects.filter((p) => p.status === "ongoing").length;
  const pendingProjects = projects.filter((p) => p.status === "yet to start").length;

  const handleTabClick = (tab) => {
    if (tab === "addEmployee") return navigate("/add_employee");
    if (tab === "addProject") return navigate("/add_project");
    if (tab === "employeeList") return navigate("/employee");
    if (tab === "projects") return navigate("/projects");
    if (tab === "logout") return navigate("/login"); 

    setActiveTab(tab);
  };

  // --- Member selection handlers ---
  // --- Member selection handlers ---
const handleMemberChange = (e) => {
  const value = e.target.value;
  setSearchInput(value);

  if (!value.trim()) {
    setFilteredMembers([]);
    setShowDropdown(false);
    return;
  }

  const filtered = members
    .filter(
      (m) =>
        m.fullName &&
        m.fullName.toLowerCase().startsWith(value.toLowerCase()) &&
        !assignedMembers.includes(m.fullName) &&          // not already assigned
        m.role?.toLowerCase() !== "admin" &&              // exclude admins
        (selectedDepartments.length === 0 ||              // if no dept selected, show all
          selectedDepartments.includes(m.department))    // only members in selected departments
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

  // --- Department selection handlers ---
  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setDeptSearchInput(value);
    const filtered = DEPARTMENTS.filter(
      (d) =>
        d.toLowerCase().includes(value.toLowerCase()) &&
        !selectedDepartments.includes(d)
    );
    setFilteredDepartments(filtered);
    setShowDeptDropdown(true);
  };

  const handleSelectDepartment = (dept) => {
    if (!selectedDepartments.includes(dept)) {
      setSelectedDepartments([...selectedDepartments, dept]);
    }
    setDeptSearchInput("");
    setShowDeptDropdown(false);
  };

  const handleRemoveDepartment = (dept) => {
    setSelectedDepartments(selectedDepartments.filter((d) => d !== dept));
  };

  // --- Submit handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName || !description || selectedDepartments.length === 0) {
      alert("Please fill in required fields and select at least one department");
      return;
    }

    const newProject = {
      projectName,
      clientName,
      projectType,
      description,
      departments: selectedDepartments,
      plannedStartDate: plannedStartDate || null,
      plannedEndDate: plannedEndDate || null,
      actualStartDate: actualStartDate || null,
      actualEndDate: actualEndDate || null,
      assignedMembers: assignedMembers || [],
      status: status || "ongoing",
      phases: phases || [],
    };

    try {
      const url = projectData.id
        ? `http://localhost:3001/updateProject/${projectData.id}`
        : "http://localhost:3001/addProjects";

      const method = projectData.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Request failed");
      }

      const data = await response.json();
      alert(data.message || (projectData.id ? "Project updated successfully" : "Project added successfully"));
      navigate("/projects");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div>
      {/* 🔹 Stats Section (4 Cards) */}
      <div className="stats-bar">
        <div className="stat-box">
          <h3>Total Projects</h3>
          <p>{totalProjects}</p>
        </div>
        <div className="stat-box">
          <h3>Completed</h3>
          <p>{completedProjects}</p>
        </div>
        <div className="stat-box">
          <h3>In Progress</h3>
          <p>{inProgressProjects}</p>
        </div>
        <div className="stat-box">
          <h3>Pending</h3>
          <p>{pendingProjects}</p>
        </div>
      </div>

      {/* 🔹 Tabs Section */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "addEmployee" ? "active" : ""}`}
          onClick={() => handleTabClick("addEmployee")}
        >
          Add Employee
        </button>
        <button
          className={`tab ${activeTab === "addProject" ? "active" : ""}`}
          onClick={() => handleTabClick("addProject")}
        >
          Add Project
        </button>
        <button
          className={`tab ${activeTab === "employeeList" ? "active" : ""}`}
          onClick={() => handleTabClick("employeeList")}
        >
          Employee List
        </button>
        <button
          className={`tab ${activeTab === "projects" ? "active" : ""}`}
          onClick={() => handleTabClick("projects")}
        >
          Projects
        </button>
         <button
            className={`tab ${activeTab === "logout" ? "active" : ""}`} 
            onClick={() => handleTabClick("logout")}
          >
            Logout
          </button>
      </div>
    {/* 🔹 Form Section - now clearly separated */}
    <div className="form-container">
      <h2>{projectData.projectName ? "Edit Project" : "Add Project"}</h2>

      <form onSubmit={handleSubmit}>
        {/* Project Info */}
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
            <label className="form-label">Client Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
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

        {/* Departments */}
        <div className="form-group">
          <label className="form-label">Departments</label>
          <div className="multi-select-container">
            <div className="selected-chips">
              {selectedDepartments.map((d) => (
                <span key={d} className="chip">
                  {d}
                  <button type="button" className="chip-close" onClick={() => handleRemoveDepartment(d)}>×</button>
                </span>
              ))}
            </div>
            <input
              className="form-input"
              type="text"
              placeholder="Type to search departments..."
              value={deptSearchInput}
              onChange={handleDepartmentChange}
              onFocus={() => setShowDeptDropdown(true)}
            />
            {showDeptDropdown && (
              <ul className="dropdown">
                {(deptSearchInput
                  ? filteredDepartments
                  : DEPARTMENTS.filter((d) => !selectedDepartments.includes(d))
                ).map((d) => (
                  <li key={d} onClick={() => handleSelectDepartment(d)}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

         {/* Assign Members */}
        <div className="form-group">
          <label className="form-label">Assign Members</label>
          <div className="multi-select-container">
            <div className="selected-chips">
              {assignedMembers.map((m) => (
                <span key={m} className="chip">
                  {m}
                  <button type="button" className="chip-close" onClick={() => handleRemoveMember(m)}>×</button>
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

        {/* Dates */}
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

        {/* Status */}
        <div className="form-group">
          <label className="form-label">Status</label>
          <div className="gender-options">
            {["yet to start", "ongoing", "completed"].map((s) => (
              <button
                key={s}
                type="button"
                className={`gender-btn ${status === s ? "active" : ""}`}
                onClick={() => setStatus(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit">
            {projectData.projectName ? "Update Project" : "Add Project"}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};

export default AddProject;
