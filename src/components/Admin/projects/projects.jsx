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
    const projectKey = `${projectName}_${dept}`; // Unique key per project per department
    setSelectedPhaseInfo((prev) => ({
      ...prev,
      [projectKey]: prev[projectKey] === phase ? null : phase,
    }));
  };

  return (
    <div className="project-container">
      <h1>Project Roles</h1>

      {DEPARTMENTS.map((dept) => {
        const deptProjects = projects.filter((proj) => proj.departments?.includes(dept));

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
                                  style={{
                                    cursor: "pointer",
                                    backgroundColor: selectedPhase === phase ? "#ffc107" : "",
                                  }}
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

                      <td className="employee-name" onClick={() => handleEmployeeClick(emp.id)}>
                        {emp.fullName || "Unnamed Employee"}
                      </td>
                      <td>
                        <span
                          className={`role-badge ${emp.role?.replace(/\s+/g, "-").toLowerCase() || "employee"}`}
                          style={{ color: "black" }}
                        >
                          {emp.role || "Employee"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${proj.status?.replace(/\s+/g, "-").toLowerCase() || "unknown"}`}
                          style={{ color: "black" }}
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
      })}
    </div>
  );
};

export default Project;
