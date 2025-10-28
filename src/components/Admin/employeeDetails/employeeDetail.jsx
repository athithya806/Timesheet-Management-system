import React, { useState, useEffect } from "react";
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
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedEmployee, setSelectedEmployee] = useState("All");
  const [timesheetData, setTimesheetData] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ===== Navigation =====
  const handleTabClick = (tab) => {
    if (tab === "addEmployee") return navigate("/add_employee");
    if (tab === "addProject") return navigate("/add_project");
    if (tab === "dashboard") return navigate("/dashboard");
    if (tab === "projects") return navigate("/projects");
    if (tab === "logout") return navigate("/login");
    setActiveTab(tab);
  };

  // ===== Autocomplete Logic =====
  const filteredSuggestions =
    selectedEmployee.trim() === ""
      ? employees.filter(emp => emp.role?.toLowerCase() !== "admin")
      : employees.filter(
          (emp) =>
            emp.role?.toLowerCase() !== "admin" &&
            emp.fullName &&
            emp.fullName.toLowerCase().includes(selectedEmployee.toLowerCase())
        );

  // ===== Fetch Employees =====
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

  // ===== Fetch Timesheet =====
  const fetchTimesheetData = async () => {
    try {
      const res = await fetch("http://localhost:3001/getHourDetailsByMonthForCeo");
      const data = await res.json();
      if (data.success) setTimesheetData(data.data);
    } catch (err) {
      console.error("Error fetching timesheet data:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchTimesheetData();
  }, []);

  // ===== WORKING DAYS: Any Year, Leap Year, Sunday, 2nd Saturday =====
  const getSecondSaturday = (year, month) => {
    let saturdayCount = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (date.getDay() === 6) {
        saturdayCount++;
        if (saturdayCount === 2) return day;
      }
    }
    return null;
  };

  const getWorkingDays = (year) => {
    let workingDays = 0;

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const secondSaturday = getSecondSaturday(year, month);

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();

        if (dayOfWeek === 0) continue; // Sunday
        if (day === secondSaturday) continue; // 2nd Saturday

        workingDays++;
      }
    }

    return workingDays;
  };

  // ===== CSV: All Employees by Year =====
  const handleDownloadCSV = () => {
    if (!selectedPeriod) {
      alert("Please select a year first.");
      return;
    }

    const year = parseInt(selectedPeriod);
    const workingDays = getWorkingDays(year);

    if (workingDays === 0) {
      alert("No working days in selected year.");
      return;
    }

    const filtered = timesheetData.filter((item) => {
      const itemYear = new Date(item.date).getFullYear();
      return itemYear === year;
    });

    const rows = employees
      .filter((emp) => emp.role?.toLowerCase() !== "admin")
      .map((emp, index) => {
        const userTimes = filtered.filter((t) => t.memberId === emp.id);
        let totalFilledHours = 0;

        userTimes.forEach((t) => {
          try {
            const blocks = JSON.parse(t.hourBlocks || "[]");
            blocks.forEach((block) => {
              const allFilled =
                block.projectType?.trim() &&
                block.projectCategory?.trim() &&
                block.projectName?.trim() &&
                block.projectPhase?.trim() &&
                block.projectTask?.trim();
              if (allFilled) totalFilledHours += 1;
            });
          } catch (e) {
            console.warn("Invalid hourBlocks JSON:", t.id, e);
          }
        });

        const averageWorkingHours = (totalFilledHours / workingDays).toFixed(2);

        return {
          "S.No": index + 1,
          "Employee Name": emp.fullName,
          "Emp ID": emp.empId,
          "Email ID": emp.email,
          "Average Working Hours": averageWorkingHours,
          "Total Working Hours": totalFilledHours,
        };
      });

    const headers = Object.keys(rows[0]).join(",");
    const csvContent =
      headers + "\n" + rows.map((r) => Object.values(r).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Timesheet_Report_${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ===== CSV: Single Employee by Date Range =====
  const handleDownloadCSVSingle = () => {
    const { from, to } = dateRange;

    if (!from || !to) {
      alert("Please select a valid date range.");
      return;
    }

    const emp = employees.find(
      (e) => e.fullName === selectedEmployee && e.role !== "admin"
    );
    if (!emp) {
      alert("Invalid employee selected.");
      return;
    }

    const filtered = timesheetData.filter((item) => {
      const entryDate = new Date(item.date);
      return (
        item.memberId === emp.id &&
        entryDate >= new Date(from) &&
        entryDate <= new Date(to)
      );
    });

    if (filtered.length === 0) {
      alert("No timesheet records found for this employee in the selected range.");
      return;
    }

    const dailyHours = {};
    let total = 0;

    filtered.forEach((entry) => {
      const dateStr = new Date(entry.date).toISOString().split("T")[0];
      let validHours = 0;

      try {
        const blocks = JSON.parse(entry.hourBlocks || "[]");
        validHours = blocks.filter(
          (b) =>
            b.projectType?.trim() &&
            b.projectCategory?.trim() &&
            b.projectName?.trim() &&
            b.projectPhase?.trim() &&
            b.projectTask?.trim()
        ).length;
      } catch (e) {
        console.warn("Invalid JSON in hourBlocks:", entry.id);
      }

      dailyHours[dateStr] = (dailyHours[dateStr] || 0) + validHours;
      total += validHours;
    });

    let csv = "Date,Total Working Hours\n";
    Object.entries(dailyHours).forEach(([date, hrs]) => {
      csv += `${date},${hrs}\n`;
    });
    csv += `Total,${total} hrs\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${emp.fullName}_Timesheet_${from}_to_${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ===== Filter Employees for Table =====
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
                <h3>
                  {employees.filter(
                    (e) => e.role?.toLowerCase() === "admin"
                  ).length}
                </h3>
                <p>Admins</p>
              </div>
            </div>
            <div className="stat-box">
              <div className="icon employee"></div>
              <div>
                <h3>
                  {employees.filter(
                    (e) => e.role?.toLowerCase() !== "admin"
                  ).length}
                </h3>
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

          {/* ===== Search & Filter Bar ===== */}
          <div className="search-bar d-flex align-items-center flex-nowrap gap-2" style={{ justifyContent: "flex-start" }}>
            {/* Main Search */}
            <div style={{ position: "relative" }}>
              {/* Search Icon (SVG) */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#888",
                  pointerEvents: "none",
                }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  outline: "none",
                  maxWidth: "250px",
                }}
              />
            </div>

            {/* Employee Autocomplete */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", marginLeft: "16px" }}>
              <input
                id="employeeSearch"
                type="text"
                placeholder="Type employee name..."
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                style={{
                  padding: "6px 28px 6px 10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  outline: "none",
                  width: "140px",
                  height: "36px",
                  fontSize: "14px",
                }}
              />
              {selectedEmployee !== "All" && (
                <button
                  type="button"
                  onClick={() => setSelectedEmployee("All")}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  title="Reset to All"
                >
                  {/* Close Icon (SVG) */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "#888" }}
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
              {showSuggestions && (
                <ul
                  className="list-group position-absolute bg-white shadow-sm"
                  style={{
                    top: "40px",
                    left: 0,
                    width: "100%",
                    zIndex: 1000,
                    borderRadius: "6px",
                    maxHeight: "150px",
                    overflowY: "auto",
                    border: "1px solid #ccc",
                  }}
                >
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((emp) => (
                      <li
                        key={emp.id}
                        className="list-group-item list-group-item-action"
                        onMouseDown={() => {
                          setSelectedEmployee(emp.fullName);
                          setShowSuggestions(false);
                        }}
                        style={{ cursor: "pointer", padding: "8px 10px", fontSize: "14px" }}
                      >
                        {emp.fullName}
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item text-muted" style={{ padding: "8px 10px", fontSize: "14px" }}>
                      No matches found
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Period / Date Range */}
            {selectedEmployee === "All" ? (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                height: "36px", 
                padding: "0 8px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                backgroundColor: "#fff"
              }}>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151", whiteSpace: "nowrap" }}>
                  Period:
                </span>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  style={{ 
                    border: "none", 
                    outline: "none", 
                    background: "transparent",
                    width: "90px",
                    fontSize: "14px",
                    height: "100%"
                  }}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 41 }, (_, i) => 2000 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                height: "36px", 
                padding: "0 8px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                backgroundColor: "#fff"
              }}>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>From:</span>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  style={{ border: "none", outline: "none", width: "140px", fontSize: "14px" }}
                />
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>To:</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  style={{ border: "none", outline: "none", width: "140px", fontSize: "14px" }}
                />
              </div>
            )}

            {/* Download Button */}
            {selectedEmployee === "All" ? (
              <button
                className="btn btn-primary"
                onClick={handleDownloadCSV}
                style={{ height: "36px", padding: "0 16px" }}
              >
                Download CSV
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={handleDownloadCSVSingle}
                style={{ height: "36px", padding: "0 16px" }}
              >
                Download CSV
              </button>
            )}
          </div>

          {/* ===== Employee Table ===== */}
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
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((emp) => (
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
                                    encodeURIComponent(emp.fullName);
                                }}
                              />
                            ) : (
                              <div className="profile-placeholder">
                                {emp.fullName?.charAt(0).toUpperCase()}
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
                                navigate("/add_employee", {
                                  state: { employeeData: emp },
                                })
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="btn small delete"
                              onClick={() => {
                                if (window.confirm(`Delete ${emp.fullName}?`)) {
                                  fetch(`http://localhost:3001/api/members/${emp.id}`, {
                                    method: "DELETE",
                                  })
                                    .then((res) => res.json())
                                    .then(() =>
                                      setEmployees(employees.filter((e) => e.id !== emp.id))
                                    );
                                }
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No employees found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeDetail;