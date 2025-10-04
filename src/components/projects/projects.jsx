import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./projects.css";

const phasesList = ["Design", "Development", "Testing", "Release", "bug Fix"];

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

  useEffect(() => {
    // Fetch projects
    fetch("http://localhost:3001/getProjects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error(err));

    // Fetch members
    fetch("http://localhost:3001/api/members")
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => console.error(err));
  }, []);

  const handleEmployeeClick = (employeeId) => {
    navigate(`/employee/${employeeId}`);
  };

  // Filter employees for a department based on their actual department
  const getEmployeesForDept = (proj, dept) => {
    if (!proj.assignedMembers || !proj.assignedMembers.length) return [];

    return members.filter(
      (m) =>
        proj.assignedMembers.some(
          (memberName) => m.fullName.toLowerCase() === memberName.toLowerCase()
        ) && m.department === dept
    );
  };

  return (
    <div className="project-container">
      <h1>Project Roles</h1>
      {DEPARTMENTS.map((dept) => {
        // Only include projects that have this department
        const deptProjects = projects.filter((proj) =>
          proj.departments?.includes(dept)
        );

        return (
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
                {deptProjects.length > 0 ? (
                  deptProjects.map((proj, projIndex) => {
                    const employeesInDept = getEmployeesForDept(proj, dept);

                    // If no employees in this department, show message
                    if (employeesInDept.length === 0) {
                      return (
                        <tr key={projIndex}>
                          <td>{proj.projectName}</td>
                          <td>
                            {new Date(proj.plannedStartDate).toLocaleDateString()} -{" "}
                            {new Date(proj.plannedEndDate).toLocaleDateString()}
                          </td>
                          <td>40</td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              {phasesList.map((phase, i) => (
                                <div key={i} className="phase-badge">{phase}</div>
                              ))}
                            </div>
                          </td>
                          <td colSpan={3} style={{ textAlign: "center", fontStyle: "italic" }}>
                            No employees assigned in this department
                          </td>
                        </tr>
                      );
                    }

                    // Show project row with all employees listed for this department
                    return employeesInDept.map((emp, empIndex) => (
                      <tr key={`${projIndex}-${empIndex}`}>
                        {empIndex === 0 && (
                          <>
                            <td rowSpan={employeesInDept.length}>{proj.projectName}</td>
                            <td rowSpan={employeesInDept.length}>
                              {new Date(proj.plannedStartDate).toLocaleDateString()} -{" "}
                              {new Date(proj.plannedEndDate).toLocaleDateString()}
                            </td>
                            <td rowSpan={employeesInDept.length}>40</td>
                            <td rowSpan={employeesInDept.length}>
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
                          {emp.fullName}
                        </td>
                        <td>
                          <span
                            className={`role-badge ${emp.role?.replace(/\s+/g, "-").toLowerCase() || "employee"}`}
                            style={{ color: "black" }} // make text black
                          >
                            {emp.role || "Employee"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${proj.status.replace(/\s+/g, "-").toLowerCase()}`}
                            style={{ color: "black" }} // make text black
                          >
                            {proj.status}
                          </span>
                        </td>
                      </tr>
                    ));
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", fontStyle: "italic" }}>
                      No projects assigned yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default Project;
