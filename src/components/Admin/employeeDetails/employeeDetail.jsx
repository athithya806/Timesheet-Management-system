import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./employeeDetail.css";
import logo from "../../../assests/logo.png";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const EmployeeDetail = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("employeeList");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedEmployee, setSelectedEmployee] = useState("All"); // internal: full name
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(""); // internal: empId
  const [inputValue, setInputValue] = useState("All"); // displayed in input
  const [timesheetData, setTimesheetData] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* --------------------------------------------------------------
     Navigation
  -------------------------------------------------------------- */
  const handleTabClick = (tab) => {
    if (tab === "addEmployee") return navigate("/add_employee");
    if (tab === "addProject") return navigate("/add_project");
    if (tab === "dashboard") return navigate("/dashboard");
    if (tab === "projects") return navigate("/projects");
    if (tab === "logout") return navigate("/login");
    setActiveTab(tab);
  };

  /* --------------------------------------------------------------
     Fetch Employees & Timesheet
  -------------------------------------------------------------- */
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

  /* --------------------------------------------------------------
     Working Days Helper
  -------------------------------------------------------------- */
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

  /* --------------------------------------------------------------
     CSV – All Employees
  -------------------------------------------------------------- */
  /* --------------------------------------------------------------
   EXCEL – All Employees
-------------------------------------------------------------- */
const handleDownloadExcelAll = async () => {
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

  const filtered = timesheetData.filter(
    (item) => new Date(item.date).getFullYear() === year
  );

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
        sno: index + 1,
        name: emp.fullName,
        empId: emp.empId,
        email: emp.email,
        avg: averageWorkingHours,
        total: totalFilledHours,
      };
    });

  // Create Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Timesheet Report");

  // Add Logo (top-left)
  const logoImage = await fetch(logo)
    .then((res) => res.blob())
    .then((blob) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsArrayBuffer(blob);
      });
    });

  const imageId = workbook.addImage({
    buffer: logoImage,
    extension: "png",
  });
  worksheet.addImage(imageId, {
    tl: { col: 0.2, row: 0.2 },
    ext: { width: 120, height: 60 },
  });

  // Add heading text
  worksheet.mergeCells("C2", "G2");
  const headingCell = worksheet.getCell("C2");
  headingCell.value = "TANSAM TIMESHEET REPORT";
  headingCell.font = { size: 16, bold: true, color: { argb: "004085" } };
  headingCell.alignment = { vertical: "middle", horizontal: "center" };

  // Add empty row then table headers
  worksheet.addRow([]);
  worksheet.addRow([
    "S.No",
    "Employee Name",
    "Emp ID",
    "Email ID",
    "Average Working Hours",
    "Total Working Hours",
  ]);

  // Style header
  const headerRow = worksheet.lastRow;
  headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "4472C4" },
  };
  headerRow.alignment = { horizontal: "center" };

  // Add data rows
  rows.forEach((r) => {
    worksheet.addRow([
      r.sno,
      r.name,
      r.empId,
      r.email,
      r.avg,
      r.total,
    ]);
  });

  worksheet.columns = [
    { width: 8 },
    { width: 25 },
    { width: 15 },
    { width: 30 },
    { width: 25 },
    { width: 20 },
  ];

  // Add borders for neatness
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "CCCCCC" } },
        left: { style: "thin", color: { argb: "CCCCCC" } },
        bottom: { style: "thin", color: { argb: "CCCCCC" } },
        right: { style: "thin", color: { argb: "CCCCCC" } },
      };
    });
  });

  // Protect sheet (non-editable)
  await worksheet.protect("TansamReport2025", {
    selectLockedCells: true,
    selectUnlockedCells: false,
    formatCells: false,
    insertRows: false,
    deleteRows: false,
    sort: false,
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Timesheet_Report_${year}.xlsx`);
};

/* --------------------------------------------------------------
   EXCEL – Single Employee
-------------------------------------------------------------- */
const handleDownloadExcelSingle = async () => {
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

  // Create Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Employee Report");

  // Add Logo
  const logoImage = await fetch(logo)
    .then((res) => res.blob())
    .then((blob) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsArrayBuffer(blob);
      });
    });

  const imageId = workbook.addImage({
    buffer: logoImage,
    extension: "png",
  });
  worksheet.addImage(imageId, {
    tl: { col: 0.2, row: 0.2 },
    ext: { width: 120, height: 60 },
  });

  // Heading
  worksheet.mergeCells("C2", "F2");
  const headingCell = worksheet.getCell("C2");
  headingCell.value = `Timesheet Report: ${emp.fullName} (${emp.empId})`;
  headingCell.font = { size: 15, bold: true, color: { argb: "004085" } };
  headingCell.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.addRow([]);
  worksheet.addRow(["Date", "Total Working Hours"]);

  // Style header
  const headerRow = worksheet.lastRow;
  headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "4472C4" },
  };
  headerRow.alignment = { horizontal: "center" };

  Object.entries(dailyHours).forEach(([date, hrs]) => {
    worksheet.addRow([date, hrs]);
  });

  worksheet.addRow([]);
  worksheet.addRow(["Total", `${total} hrs`]);
  worksheet.getCell(`A${worksheet.lastRow.number}`).font = { bold: true };

  worksheet.columns = [
    { width: 20 },
    { width: 25 },
  ];

  // Add borders
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "CCCCCC" } },
        left: { style: "thin", color: { argb: "CCCCCC" } },
        bottom: { style: "thin", color: { argb: "CCCCCC" } },
        right: { style: "thin", color: { argb: "CCCCCC" } },
      };
    });
  });

  // Protect sheet
  await worksheet.protect("TansamReport2025", {
    selectLockedCells: true,
    selectUnlockedCells: false,
    formatCells: false,
    insertRows: false,
    deleteRows: false,
    sort: false,
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${emp.fullName}_Timesheet_${from}_to_${to}.xlsx`);
};


  /* --------------------------------------------------------------
     Table Filter
  -------------------------------------------------------------- */
  const filteredEmployees = employees.filter((emp) =>
    emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* --------------------------------------------------------------
     Autocomplete: Search by Name OR Emp ID
  -------------------------------------------------------------- */
  const filteredSuggestions = useMemo(() => {
    const term = inputValue.trim().toLowerCase();
    if (!term || term === "all") {
      return employees.filter((e) => e.role?.toLowerCase() !== "admin");
    }
    return employees.filter(
      (e) =>
        e.role?.toLowerCase() !== "admin" &&
        (e.fullName?.toLowerCase().includes(term) ||
          e.empId?.toLowerCase().includes(term))
    );
  }, [employees, inputValue]);

  // Select employee
  const pickEmployee = (emp) => {
    setSelectedEmployee(emp.fullName);
    setSelectedEmployeeId(emp.empId);
    setInputValue(`${emp.fullName} (${emp.empId})`);
    setShowSuggestions(false);
  };

  // Reset to "All"
  const resetEmployee = () => {
    setSelectedEmployee("All");
    setSelectedEmployeeId("");
    setInputValue("All");
  };

  // Enter key support
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredSuggestions.length === 1) {
      pickEmployee(filteredSuggestions[0]);
    }
  };

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
                  {employees.filter((e) => e.role?.toLowerCase() === "admin").length}
                </h3>
                <p>Admins</p>
              </div>
            </div>
            <div className="stat-box">
              <div className="icon employee"></div>
              <div>
                <h3>
                  {employees.filter((e) => e.role?.toLowerCase() !== "admin").length}
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
          <div
            className="search-bar d-flex align-items-center flex-nowrap gap-2"
            style={{ justifyContent: "flex-start" }}
          >
            {/* Global Search */}
            <div style={{ position: "relative" }}>
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

            {/* Employee Autocomplete (Name or ID) */}
            <div
              style={{
                position: "relative",
                marginLeft: "16px",
              }}
            >
              <input
                id="employeeSearch"
                type="text"
                placeholder="Name or Emp ID..."
                value={inputValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputValue(val);
                  setShowSuggestions(true);
                  if (val !== "All") {
                    setSelectedEmployee("All");
                    setSelectedEmployeeId("");
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={handleKeyDown}
                style={{
                  padding: "6px 28px 6px 10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  outline: "none",
                  width: "200px",
                  height: "36px",
                  fontSize: "14px",
                  marginRight:"20PX"
                }}
              />

              {/* Clear Button */}
              {selectedEmployee !== "All" && (
                <button
                  type="button"
                  onClick={resetEmployee}
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

              {/* Suggestions */}
              {showSuggestions && (
                <ul
                  className="list-group position-absolute bg-white shadow-sm"
                  style={{
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: "4px",
                    zIndex: 1000,
                    borderRadius: "6px",
                    maxHeight: "180px",
                    overflowY: "auto",
                    border: "1px solid #ccc",
                  }}
                >
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((emp) => (
                      <li
                        key={emp.id}
                        className="list-group-item list-group-item-action"
                        onMouseDown={() => pickEmployee(emp)}
                        style={{
                          cursor: "pointer",
                          padding: "8px 10px",
                          fontSize: "14px",
                        }}
                      >
                        {emp.fullName} – <strong>{emp.empId}</strong>
                      </li>
                    ))
                  ) : (
                    <li
                      className="list-group-item text-muted"
                      style={{ padding: "8px 10px", fontSize: "14px" }}
                    >
                      No matches found
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Period / Date Range */}
            {selectedEmployee === "All" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  height: "36px",
                  padding: "0 8px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  marginRight:"20PX",
                  padding:"5PX"
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    whiteSpace: "nowrap",
                  }}
                >
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
                    height: "100%",
                  }}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 41 }, (_, i) => 2000 + i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  height: "36px",
                  padding: "0 8px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                  From:
                </span>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                  style={{
                    border: "none",
                    outline: "none",
                    width: "140px",
                    fontSize: "14px",
                  }}
                />
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                  To:
                </span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                  style={{
                    border: "none",
                    outline: "none",
                    width: "140px",
                    fontSize: "14px",
                  }}
                />
              </div>
            )}

            {/* Download Button */}
            {selectedEmployee === "All" ? (
              <button
                className="btn btn-primary"
                onClick={handleDownloadExcelAll}   // ✅ Removed extra {}
                style={{ height: "36px", padding: "0 16px" }}
              >
                Download CSV
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={handleDownloadExcelSingle}
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
                                      setEmployees(
                                        employees.filter((e) => e.id !== emp.id)
                                      )
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