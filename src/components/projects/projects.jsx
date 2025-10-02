import React from "react";
import { useNavigate } from "react-router-dom";
import "./projects.css";

// Add these two consts at the top
const projectData = [
  {
    name: "AI Chatbot",
    department: "AI",
    start: "Aug 1-31",
    hours: 40,
    employees: [
      { id: 1, name: "Ralph Edwards", role: "Front-end engineer", status: "Under capacity" },
      { id: 2, name: "Arlene McCoy", role: "Back-end engineer", status: "At capacity" },
    ],
  },
  {
    name: "Image Recognition",
    department: "AI",
    start: "Aug 1-31",
    hours: 40,
    employees: [
      { id: 3, name: "Wade Warren", role: "Back-end engineer", status: "At capacity" },
    ],
  },
  {
    name: "E-Commerce Platform",
    department: "FULLSTACK",
    start: "Aug 1-31",
    hours: 40,
    employees: [
      { id: 1, name: "Ralph Edwards", role: "Fullstack engineer", status: "At capacity" },
    ],
  },
  {
    name: "Admin Dashboard",
    department: "FULLSTACK",
    start: "Aug 1-31",
    hours: 40,
    employees: [
      { id: 2, name: "Arlene McCoy", role: "Front-end engineer", status: "Over capacity" },
      { id: 3, name: "Wade Warren", role: "Back-end engineer", status: "At capacity" },
    ],
  },
];

const phasesList = ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5"];

// Component starts here
const Project = () => {
  const navigate = useNavigate();

  const handleEmployeeClick = (employeeId) => {
    navigate(`/employee/${employeeId}`);
  };

  const departmentMap = {};
  projectData.forEach((proj) => {
    if (!departmentMap[proj.department]) {
      departmentMap[proj.department] = [];
    }
    departmentMap[proj.department].push(proj);
  });

  return (
    <div className="project-container">
      <h1>Project Roles</h1>
      {Object.keys(departmentMap).map((dept) => (
        <div key={dept} style={{ marginBottom: "40px" }}>
          <h2>{dept} Department</h2>
          <table className="project-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Start</th>
                <th>Hours</th>
                <th>Phases</th>
                <th>Employee</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {departmentMap[dept].map((proj, projIndex) =>
                proj.employees.map((emp, empIndex) => (
                  <tr key={`${projIndex}-${empIndex}`}>
                    {empIndex === 0 && (
                      <>
                        <td rowSpan={proj.employees.length}>{proj.name}</td>
                        <td rowSpan={proj.employees.length}>{proj.start}</td>
                        <td rowSpan={proj.employees.length}>{proj.hours}</td>
                        <td rowSpan={proj.employees.length}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {phasesList.map((phase, i) => (
                              <div key={i} className="phase-badge">{phase}</div>
                            ))}
                          </div>
                        </td>
                      </>
                    )}
                    <td
                      className="employee-name"
                      onClick={() => handleEmployeeClick(emp.id)}
                    >
                      {emp.name}
                    </td>
                    <td>
                      <span
                        className={`role-badge ${emp.role
                          .replace(/\s+/g, "-")
                          .toLowerCase()}`}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${emp.status
                          .replace(/\s+/g, "-")
                          .toLowerCase()}`}
                      >
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Project;
