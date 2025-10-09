import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./projects.css";

const phasesList = ["Design", "Development", "Testing", "Release", "Bug Fix"];

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

const Project = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [timecards, setTimecards] = useState([]);
  const [selectedPhaseInfo, setSelectedPhaseInfo] = useState({});
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/getProjects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error(err));

    fetch("http://localhost:3001/api/members")
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => console.error(err));

    fetch("http://localhost:3001/getHourDetailsByMonthForCeo")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setTimecards(data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleEmployeeClick = (employeeId) => navigate(`/employee/${employeeId}`);
  const handleEditProject = (proj) => navigate("/add_project", { state: { projectData: proj } });

  const getEmployeesForDept = (proj, dept) => {
    if (!proj.assignedMembers?.length) return [];
    return members.filter(
      (m) =>
        m.fullName &&
        proj.assignedMembers.some((memberName) => memberName?.toLowerCase() === m.fullName?.toLowerCase()) &&
        m.department === dept
    );
  };

  const getHoursForEmployee = (empId, projectName) => {
    let total = 0;
    const empTimecards = timecards.filter((t) => t.memberId === empId);
    empTimecards.forEach((tc) => {
      const blocks = JSON.parse(tc.hourBlocks || "[]");
      blocks.forEach((b) => {
        if (b.projectName?.trim().toLowerCase() === projectName.trim().toLowerCase()) {
          total += parseFloat(b.hours || 1);
        }
      });
    });
    return total;
  };

  const getHoursForEmployeePhase = (empId, projectName, phase) => {
    let total = 0;
    const empTimecards = timecards.filter((t) => t.memberId === empId);
    empTimecards.forEach((tc) => {
      try {
        const blocks = JSON.parse(tc.hourBlocks || "[]");
        blocks.forEach((b) => {
          const projectMatch = b.projectName?.trim().toLowerCase() === projectName.trim().toLowerCase();
          const phaseMatch = b.projectPhase?.trim().toLowerCase() === phase.trim().toLowerCase();
          if (projectMatch && phaseMatch) total += 1;
        });
      } catch (e) {
        console.error("Invalid JSON in hourBlocks:", tc.hourBlocks);
      }
    });
    return total;
  };

  const handlePhaseClick = (projectName, dept, phase) => {
    const projectKey = `${projectName}_${dept}`;
    setSelectedPhaseInfo((prev) => ({
      ...prev,
      [projectKey]: prev[projectKey] === phase ? null : phase,
    }));
  };

  // Filtered projects based on search
  const filteredProjects = projects.filter((p) =>
    p.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const countStatus = (status) =>
    filteredProjects.filter((p) => p.status?.toLowerCase() === status.toLowerCase()).length;

  return (
    <div className="project-container">
      <h1>Project Roles</h1>

      {/* Top Stats */}
      <div className="stats-bar">
        <div className="stat-box">
          <div className="icon total"></div>
          <div>
            <h3>{filteredProjects.length}</h3>
            <p>Total Projects</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="icon completed"></div>
          <div>
            <h3>{countStatus("completed")}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="icon progress"></div>
          <div>
            <h3>{countStatus("ongoing")}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="icon pending"></div>
          <div>
            <h3>{countStatus("yet to start")}</h3>
            <p>Pending</p>
          </div>
        </div>

        {/* v className="icon overdue"></div> <div className="stat-box">
    <di */}
        {/* <div>
      <h3>{countStatus("overdue")}</h3>
      <p>Overdue</p>
    </div>
  </div> */}
      </div>

      {/* Search + Toggle */}
      <div className="filter-toggle-bar">
        <input
          type="text"
          placeholder="Search project..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="toggle-buttons">
          <button
            className={viewMode === "card" ? "active" : ""}
            onClick={() => setViewMode("card")}
          >
            Card
          </button>
          <button
            className={viewMode === "list" ? "active" : ""}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
        </div>
      </div>

      {/* --- Conditional Rendering --- */}
      {viewMode === "list" ? (
        DEPARTMENTS.map((dept) => {
          const deptProjects = filteredProjects.filter((proj) =>
            proj.departments?.includes(dept)
          );

          return (
            <div key={dept} style={{ marginBottom: "40px" }}>
              <h2>{dept} Department</h2>
              <table className="project-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Actual Dates</th>
                    <th>Hours</th>
                    <th>Phases</th>
                    <th>Action</th>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deptProjects.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", fontStyle: "italic" }}>
                        No projects assigned yet
                      </td>
                    </tr>
                  )}

                  {deptProjects.map((proj, projIndex) => {
                    const employeesInDept = getEmployeesForDept(proj, dept);
                    const projectKey = `${proj.projectName}_${dept}`;
                    const selectedPhase = selectedPhaseInfo[projectKey];

                    if (employeesInDept.length === 0) {
                      return (
                        <tr key={projIndex}>
                          <td>{proj.projectName || "Unnamed Project"}</td>
                          <td>
                            {proj.actualStartDate
                              ? new Date(proj.actualStartDate).toLocaleDateString()
                              : "N/A"}{" "}
                            -{" "}
                            {proj.actualEndDate
                              ? new Date(proj.actualEndDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>0</td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              {phasesList.map((phase, i) => (
                                <div key={i} className="phase-badge">{phase}</div>
                              ))}
                            </div>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              className="btn small"
                              onClick={() => handleEditProject(proj)}
                              title="Edit Project"
                            >
                              ✏️
                            </button>
                          </td>
                          <td colSpan={3} style={{ textAlign: "center", fontStyle: "italic" }}>
                            No employees assigned
                          </td>
                        </tr>
                      );
                    }

                    const totalHours = employeesInDept.reduce((sum, e) => {
                      return selectedPhase
                        ? sum + getHoursForEmployeePhase(e.id, proj.projectName, selectedPhase)
                        : sum + getHoursForEmployee(e.id, proj.projectName);
                    }, 0);

                    return employeesInDept.map((emp, empIndex) => (
                      <tr key={`${projIndex}-${empIndex}`}>
                        {empIndex === 0 && (
                          <>
                            <td rowSpan={employeesInDept.length}>{proj.projectName || "Unnamed Project"}</td>
                            <td rowSpan={employeesInDept.length}>
                              {proj.actualStartDate
                                ? new Date(proj.actualStartDate).toLocaleDateString()
                                : "N/A"}{" "}
                              -{" "}
                              {proj.actualEndDate
                                ? new Date(proj.actualEndDate).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td rowSpan={employeesInDept.length}>{totalHours}</td>
                            <td rowSpan={employeesInDept.length}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                {phasesList.map((phase, i) => (
                                  <div
                                    key={i}
                                    className="phase-badge"
                                    style={{ backgroundColor: selectedPhase === phase ? "#ffc107" : "" }}
                                    onClick={() => handlePhaseClick(proj.projectName, dept, phase)}
                                  >
                                    {phase}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td rowSpan={employeesInDept.length} style={{ textAlign: "center" }}>
                              <button
                                className="btn small"
                                onClick={() => handleEditProject(proj)}
                                title="Edit Project"
                              >
                                ✏️
                              </button>
                            </td>
                          </>
                        )}
                        <td className="employee-name" >
                          {emp.fullName || "Unnamed Employee"}
                        </td>
                        <td>
                          <span
                            className={`role-badge ${emp.role?.replace(/\s+/g, "-").toLowerCase() || "employee"}`}
                          >
                            {emp.role || "Employee"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${proj.status?.replace(/\s+/g, "-").toLowerCase() || "unknown"}`}
                          >
                            {proj.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          );
        })
      ) : (
        /* --- Card View --- */
        filteredProjects.map((proj, projIndex) => (
          <div className="project-card" key={projIndex}>
            <h3>{proj.projectName || "Unnamed Project"}</h3>
            <p><strong>Departments:</strong> {proj.departments?.join(", ") || "N/A"}</p>
            <p>
              <strong>Dates:</strong>{" "}
              {proj.actualStartDate ? new Date(proj.actualStartDate).toLocaleDateString() : "N/A"} -{" "}
              {proj.actualEndDate ? new Date(proj.actualEndDate).toLocaleDateString() : "N/A"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status-badge ${proj.status?.replace(/\s+/g, "-").toLowerCase() || "unknown"}`}>
                {proj.status || "Unknown"}
              </span>
            </p>
            <p>
              <strong>Phases:</strong>{" "}
              {phasesList.map((phase, i) => (
                <span
                  key={i}
                  className="phase-badge"
                  style={{
                    backgroundColor:
                      selectedPhaseInfo[`${proj.projectName}_${proj.departments[0]}`] === phase
                        ? "#ffc107"
                        : "#e0e7ff",
                  }}
                  onClick={() => handlePhaseClick(proj.projectName, proj.departments[0], phase)}
                >
                  {phase}
                </span>
              ))}
            </p>
            <p>
              <strong>Total Hours:</strong>{" "}
              {members
                .filter((m) => proj.assignedMembers?.some((name) => name?.toLowerCase() === m.fullName?.toLowerCase()))
                .reduce((sum, emp) =>
                  selectedPhaseInfo[`${proj.projectName}_${proj.departments[0]}`]
                    ? sum + getHoursForEmployeePhase(emp.id, proj.projectName, selectedPhaseInfo[`${proj.projectName}_${proj.departments[0]}`])
                    : sum + getHoursForEmployee(emp.id, proj.projectName),
                  0
                )}
            </p>
            <div>
              <strong>Employees:</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "6px" }}>
                {getEmployeesForDept(proj, proj.departments[0]).map((emp) => (
                  <div
                    key={emp.id}
                    className="employee-name" >
                    {emp.fullName}
                  </div>
                ))}
              </div>
            </div>
            <button
              className="btn small"
              onClick={() => handleEditProject(proj)}
              style={{ marginTop: "10px" }}
            >
              ✏️ Edit Project
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Project;
