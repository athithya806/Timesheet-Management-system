import React, { useState, useEffect } from "react";
import { Search, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Timesheet.css";

const Timesheet = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("employeeList");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleTabClick = (tab) => {
    if (tab === "addEmployee") return navigate("/add_employee");
    if (tab === "addProject") return navigate("/add_project");
    if (tab === "dashboard") return navigate("/dashboard");
    setActiveTab(tab);
  };

  const handleRowClick = (id) => navigate(`/employee/${id}`);

  const fetchEmployees = () => {
    setLoading(true);
    fetch("http://localhost:3001/api/members")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched employees:", data); // debug
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

  useEffect(() => {
    const handleFocus = () => {
      if (activeTab === "employeeList") fetchEmployees();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [activeTab]);

  const filteredEmployees = employees.filter((emp) =>
    emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button className="tab" onClick={() => navigate("/projects")}>
            Projects
          </button>
          <button className="tab" onClick={() => handleTabClick("dashboard")}>
            Dashboard
          </button>
        </div>

        {/* Period Section */}
        {/* <div className="period">
          <div>
            <p className="period-label">Time period:</p>
            <p className="period-value">1st Jun – 31st Jul 2022</p>
          </div>
          <div className="buttons">
            <button className="btn light">
              <FileText size={16} /> Create Report
            </button>
          </div>
        </div> */}

        {/* Calendar */}
        {/* <div className="calendar">
          {[...Array(31)].map((_, i) => (
            <div key={i} className={`day ${i < 21 ? "green" : "red"}`}>
              {i + 1}
            </div>
          ))}
        </div> */}

        {/* Search Bar */}
        <div className="search-bar">
          <div className="search">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search employee"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Employee List */}
        {activeTab === "employeeList" && (
          <>
            {loading && <p>Loading employees...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>EmpID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="clickable-row"
                      onClick={() => handleRowClick(emp.id)}
                    >
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
        console.error("Image load error:", emp.imagePath);
        e.target.onerror = null;
        e.target.src = "https://ui-avatars.com/api/?name=" + emp.fullName;
      }}
    />
  ) : (
    <div className="profile-placeholder">
      {emp.fullName?.charAt(0)}
    </div>
  )}
</td>

                      <td>{emp.empId}</td>
                      <td>{emp.fullName}</td>
                      <td>{emp.email}</td>
                      <td>{emp.department}</td>
                      <td>
                        <button
                          className="btn small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/edit_employee/${emp.id}`);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                `Are you sure you want to delete ${emp.fullName}?`
                              )
                            ) {
                              fetch(
                                `http://localhost:3001/api/members/${emp.id}`,
                                { method: "DELETE" }
                              )
                                .then((res) => res.json())
                                .then((data) => {
                                  if (data.success)
                                    setEmployees(
                                      employees.filter((e) => e.id !== emp.id)
                                    );
                                })
                                .catch((err) =>
                                  console.error("Delete error:", err)
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Timesheet;
