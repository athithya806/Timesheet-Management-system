import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
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
      ? employees // show all by default
      : employees.filter(
          (emp) =>
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

  // ===== CSV Download (All Employees) =====
  const handleDownloadCSV = async () => {
    if (!selectedPeriod) {
      alert("Please select a year first.");
      return;
    }

    try {
      const filtered = timesheetData.filter((item) => {
        const year = new Date(item.date).getFullYear();
        return year === parseInt(selectedPeriod);
      });

      const workingDays = getWorkingDays(parseInt(selectedPeriod));

      const rows = employees
        .filter((emp) => emp.role.toLowerCase() !== "admin")
        .map((emp, index) => {
          const userTimes = filtered.filter((t) => t.memberId === emp.id);
          let totalFilledHours = 0;

          userTimes.forEach((t) => {
            const blocks = JSON.parse(t.hourBlocks || "[]");
            blocks.forEach((block) => {
              const allFilled =
                block.projectType &&
                block.projectCategory &&
                block.projectName &&
                block.projectPhase &&
                block.projectTask;
              if (allFilled) totalFilledHours += 1;
            });
          });

          const totalWorkingHours = totalFilledHours;
          const averageWorkingHours = (
            (totalFilledHours / workingDays) *
            8
          ).toFixed(2);

          return {
            "S.No": index + 1,
            "Employee Name": emp.fullName,
            "Emp ID": emp.empId,
            "Email ID": emp.email,
            "Average Working Hours": averageWorkingHours,
            "Total Working Hours": totalWorkingHours,
          };
        });

      const headers = Object.keys(rows[0]).join(",");
      const csvContent =
        headers +
        "\n" +
        rows.map((r) => Object.values(r).join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Timesheet_Report_${selectedPeriod}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading CSV:", err);
      alert("Error generating CSV file.");
    }
  };

  // ===== CSV Download (Single Employee) =====
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
    filtered.forEach((entry) => {
      const dateStr = new Date(entry.date).toISOString().split("T")[0];
      const blocks = JSON.parse(entry.hourBlocks || "[]");
      const validHours = blocks.filter(
        (b) =>
          b.projectType &&
          b.projectCategory &&
          b.projectName &&
          b.projectPhase &&
          b.projectTask
      ).length;
      dailyHours[dateStr] = (dailyHours[dateStr] || 0) + validHours;
    });

    let csv = "Date,Total Working Hours\n";
    let total = 0;

    Object.entries(dailyHours).forEach(([date, hrs]) => {
      csv += `${date},${hrs}\n`;
      total += hrs;
    });

    csv += `Total,${total} hrs\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${emp.fullName}_Timesheet_${from}_to_${to}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ===== Working Days Logic =====
  const getWorkingDays = (year) => {
    const workingDays = [];
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const secondSaturday = getSecondSaturday(year, month);
        if (dayOfWeek !== 0 && day !== secondSaturday) {
          workingDays.push(date);
        }
      }
    }
    return workingDays.length;
  };

  const getSecondSaturday = (year, month) => {
    let count = 0;
    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      if (date.getDay() === 6) count++;
      if (count === 2) return day;
    }
    return null;
  };

  // ===== Filter Employees =====
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
              className={`tab ${
                activeTab === "employeeList" ? "active" : ""
              }`}
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
  {/* 1. Main Search Input */}
  <div className="search">
    <Search className="search-icon" size={18} />
    <input
      type="text"
      placeholder="Search employee..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{ maxWidth: "250px" }}
    />
  </div>

  {/* 2. Employee Search Input (All) */}
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
        width: "90px",
        marginRight: "20px",
        height: "20px", // Match other input heights
      }}
    />

    {/* Reset Icon */}
    {selectedEmployee !== "All" && (
      <button
        type="button"
        onClick={() => setSelectedEmployee("All")}
        style={{
          position: "absolute",
          right: "6px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          color: "#888",
        }}
        title="Reset to All"
      >
        <X size={16} />
      </button>
    )}

    {/* Dropdown suggestions */}
    {showSuggestions && (
      <ul
        className="list-group position-absolute bg-white shadow-sm"
        style={{
          top: "40px",
          left: 0,
          width: "90px",
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
              style={{ cursor: "pointer", padding: "6px 10px" }}
            >
              {emp.fullName}
            </li>
          ))
        ) : (
          <li className="list-group-item text-muted" style={{ padding: "6px 10px" }}>
            No matches found
          </li>
        )}
      </ul>
    )}
  </div>

  {/* 3. Period Field - PERFECTLY ALIGNED */}
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
      id="periodSelect"
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
      {Array.from({ length: 41 }, (_, i) => 2000 + i).map(
        (year) => (
          <option key={year} value={year}>
            {year}
          </option>
        )
      )}
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
    <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151", whiteSpace: "nowrap" }}>
      From:
    </span>
    <input
      type="date"
      value={dateRange.from} // Expect YYYY-MM-DD format (e.g., "2025-09-30")
      onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
      style={{ 
        border: "none", 
        outline: "none", 
        background: "transparent",
        width: "90px",
        height: "100%",
        fontSize: "14px"
      }}
    />
    <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151", whiteSpace: "nowrap" }}>
      To:
    </span>
    <input
      type="date"
      value={dateRange.to} // Expect YYYY-MM-DD format (e.g., "2025-09-30")
      onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
      style={{ 
        border: "none", 
        outline: "none", 
        background: "transparent",
        width: "90px",
        height: "100%",
        fontSize: "14px"
      }}
    />
  </div>
)}
  {/* 4. Download Button */}
  {selectedEmployee === "All" ? (
    <button
      className="btn btn-primary"
      onClick={handleDownloadCSV}
      style={{ height: "36px", padding: "0 16px" }}
    >
      ⬇️ Download CSV
    </button>
  ) : (
    <button
      className="btn btn-success"
      onClick={handleDownloadCSVSingle}
      style={{ height: "36px", padding: "0 16px" }}
    >
      ⬇️ Download CSV
    </button>
  )}
</div>

          {/* ===== Existing Table ===== */}
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
                                emp.role?.toLowerCase() === "admin"
                                  ? "admin"
                                  : "employee"
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
                              ✏️
                            </button>
                            <button
                              className="btn small delete"
                              onClick={() => {
                                if (
                                  window.confirm(`Delete ${emp.fullName}?`)
                                ) {
                                  fetch(
                                    `http://localhost:3001/api/members/${emp.id}`,
                                    { method: "DELETE" }
                                  )
                                    .then((res) => res.json())
                                    .then(() =>
                                      setEmployees(
                                        employees.filter(
                                          (e) => e.id !== emp.id
                                        )
                                      )
                                    );
                                }
                              }}
                            >
                              🗑️
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