// src/components/Timesheet/Timesheet.jsx
import React, { useState } from "react";
import { Search, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Timesheet.css";

// Employees dummy data
const employees = [
  {
    name: "Ralph Edwards",
    role: "Product Designer",
    type: "Fulltime",
    regular: 172,
    overtime: 24,
    sick: 48,
    pto: "-",
    holiday: 20,
    total: 264,
  },
  {
    name: "Arlene McCoy",
    role: "UX Researcher",
    type: "Fulltime",
    regular: 160,
    overtime: "-",
    sick: "-",
    pto: 50,
    holiday: "-",
    total: 210,
  },
  {
    name: "Wade Warren",
    role: "QA Engineer",
    type: "Contractor",
    regular: 178,
    overtime: "-",
    sick: "-",
    pto: 74,
    holiday: "-",
    total: 252,
  },
];

const Timesheet = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("employeeList"); // Default tab

  const handleTabClick = (tab) => {
    if (tab === "addEmployee") {
      navigate("/add_employee");
      return;
    }
    if (tab === "addProject") {
      navigate("/add_project");
      return;
    }
    if (tab === "dashboard") {
      navigate("/dashboard");
      return;
    }
    setActiveTab(tab); // for employeeList or projects
  };

  const handleRowClick = (index) => navigate(`/employee/${index}`);

  return (
    <div className="container">
      <div className="main">
        <h1 className="title">Time & Attendance</h1>

        {/* Tabs */}
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
            className={`tab`}
            onClick={() => navigate("/projects")} // Navigate directly to Project.jsx
          >
            Projects
          </button>
          <button className="tab" onClick={() => handleTabClick("dashboard")}>
            Dashboard
          </button>
        </div>

        {/* Period */}
        <div className="period">
          <div>
            <p className="period-label">Time period:</p>
            <p className="period-value">1st Jun – 31st Jul 2022</p>
          </div>
          <div className="buttons">
            <button className="btn light">
              <FileText size={16} /> Create Report
            </button>
            <button className="btn light">
              <Settings size={16} /> Setting
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="calendar">
          {[...Array(31)].map((_, i) => (
            <div key={i} className={`day ${i < 21 ? "green" : "red"}`}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="search-bar">
          <div className="search">
            <Search className="search-icon" size={18} />
            <input type="text" placeholder="Search employee" />
          </div>
          <div className="actions">
            <button className="btn outline">Remind Approvers</button>
            <button className="btn primary">Send to Payroll</button>
          </div>
        </div>

        {/* Employee List */}
        {activeTab === "employeeList" && (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Regular</th>
                <th>Overtime</th>
                <th>Sick Leave</th>
                <th>PTO</th>
                <th>Paid Holiday</th>
                <th>Total Hour</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr
                  key={i}
                  onClick={() => handleRowClick(i)}
                  className="clickable-row"
                >
                  <td>
                    <p className="name">{emp.name}</p>
                    <p className="role">{emp.role}</p>
                  </td>
                  <td>{emp.type}</td>
                  <td>{emp.regular} Hours</td>
                  <td>{emp.overtime} Hours</td>
                  <td>{emp.sick} Hours</td>
                  <td>{emp.pto}</td>
                  <td>{emp.holiday} Hours</td>
                  <td>{emp.total} Hours</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Projects tab placeholder */}
        {activeTab === "projects" && (
          <div className="projects-placeholder">
            <h2>Projects Section</h2>
            <p>Here you can display or manage projects.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timesheet;
