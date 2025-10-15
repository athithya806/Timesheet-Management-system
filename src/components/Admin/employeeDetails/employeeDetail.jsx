import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./employeeDetail.css"; 
import logo from "../../../assests/logo.png";

const EmployeeDetail = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("employeeList");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const handleTabClick = (tab) => {
    if (tab === "addEmployee") return navigate("/add_employee");
    if (tab === "addProject") return navigate("/add_project");
    if (tab === "dashboard") return navigate("/dashboard");
    if (tab === "projects") return navigate("/projects");
    if (tab === "logout") return navigate("/login");
    setActiveTab(tab);
  };

  const fetchEmployees = () => {
    setLoading(true);
    fetch("http://localhost:3001/api/members")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching members:", err);
        setError("Failed to load employee data.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) =>
    emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* ===== Top Navbar ===== */}
      <header className="top-navbar">
        <img src={logo} alt="Company Logo" className="navbar-logo" />
        <h1 className="navbar-title">Timesheet</h1>
      </header>

      {/* ===== Main Container ===== */}
      <div className="container">
        <div className="main">
          {/* ===== Stats Bar ===== */}
          <div className="stats-bar">
            <div className="stat-box">
              <div className="icon total"></div>
              <div>
                <h3>{employees.length}</h3>
                <p>Total Employees</p>
              </div>
            </div>
            <div className="stat-box">
              <div className="icon admin"></div>
              <div>
                <h3>{employees.filter(e => e.role?.toLowerCase() === 'admin').length}</h3>
                <p>Admins</p>
              </div>
            </div>
            <div className="stat-box">
              <div className="icon employee"></div>
              <div>
                <h3>{employees.filter(e => e.role?.toLowerCase() !== 'admin').length}</h3>
                <p>Employees</p>
              </div>
            </div>
          </div>

          {/* ===== Tabs ===== */}
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

          {/* ===== Search Bar ===== */}
          <div className="search-bar">
            <div className="search">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* ===== Employee Table or Cards ===== */}
          {activeTab === "employeeList" && (
            <>
              {loading && <p>Loading employees...</p>}
              {error && <p className="error">{error}</p>}

              {!loading && !error && (
                <>
                  {viewMode === "table" ? (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Profile</th>
                          <th>EmpID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Department</th>
                          <th>Role</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map((emp) => (
                          <tr key={emp.id}>
                            <td>
                              {emp.imagePath ? (
                                <img
                                  src={
                                    emp.imagePath.startsWith("/uploads")
                                      ? `http://localhost:3001${emp.imagePath}`
                                      : `http://localhost:3001/uploads/${emp.imagePath}`
                                  }
                                  alt={emp.fullName}
                                  className="profile-img"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://ui-avatars.com/api/?name=" +
                                      emp.fullName;
                                  }}
                                />
                              ) : (
                                <div className="profile-placeholder">
                                  {emp.fullName?.charAt(0)}
                                </div>
                              )}
                            </td>
                            <td>{emp.empId}</td>
                            <td className="employee-name">{emp.fullName}</td>
                            <td>{emp.email}</td>
                            <td>{emp.department}</td>
                            <td>
                              <span
                                className={`role-badge ${
                                  emp.role?.toLowerCase() === "admin" ? "admin" : "employee"
                                }`}
                              >
                                {emp.role || "Employee"}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn small edit"
                                onClick={() =>
                                  navigate("/add_employee", { state: { employeeData: emp } })
                                }
                              >
                                ✏️
                              </button>
                              <button
                                className="btn small delete"
                                onClick={() => {
                                  if (window.confirm(`Delete ${emp.fullName}?`)) {
                                    fetch(`http://localhost:3001/api/members/${emp.id}`, { method: "DELETE" })
                                      .then((res) => res.json())
                                      .then(() =>
                                        setEmployees(employees.filter((e) => e.id !== emp.id))
                                      );
                                  }
                                }}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="card-view">
                      {filteredEmployees.map((emp) => (
                        <div key={emp.id} className="employee-card">
                          <div className="profile-container">
                            {emp.imagePath ? (
                              <img
                                src={
                                  emp.imagePath.startsWith("/uploads")
                                    ? `http://localhost:3001${emp.imagePath}`
                                    : `http://localhost:3001/uploads/${emp.imagePath}`
                                }
                                alt={emp.fullName}
                                className="profile-img"
                              />
                            ) : (
                              <div className="profile-placeholder">
                                {emp.fullName?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <h3 className="employee-name">{emp.fullName}</h3>
                          <p>EmpID: {emp.empId}</p>
                          <p>Email: {emp.email}</p>
                          <p>Dept: {emp.department}</p>
                          <div>
                            <span
                              className={`role-badge ${
                                emp.role?.toLowerCase() === "admin" ? "admin" : "employee"
                              }`}
                            >
                              {emp.role || "Employee"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeDetail;
