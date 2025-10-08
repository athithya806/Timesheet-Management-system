import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./timesheetDetail.css";
import Sidebar from "../sidebar/sidebar.jsx";

const TimesheetDetail = () => {
  const { id } = useParams();

  // State declarations
  const [activeTab, setActiveTab] = useState("timeline");
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showApprovalDrawer, setShowApprovalDrawer] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState({});
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [checkInOut, setCheckInOut] = useState({ checkIn: "", checkOut: "" });
  const [employee, setEmployee] = useState({});
  const [projects, setProjects] = useState([]);
  const [serverToday, setServerToday] = useState(null);

  const [hourlyDetails, setHourlyDetails] = useState({});
  const [formMode, setFormMode] = useState("");

  const [timecardData, setTimecardData] = useState([]);
  // For editing hourly project fields, example initialized as empty object
  const [editProjectsByHour, setEditProjectsByHour] = useState({});
const minHour = 9;   // e.g. earliest checkIn
const maxHour = 19;
  // Pad time utility
  const padTime = (t) => (t && t.match(/^\d{2}:\d{2}$/) ? t + ":00" : t || "00:00:00");

  // Convert hour range string to 24h integer hour
  const parseHourKeyFromRange = (range) => {
    const m = /^(\d{1,2})\s*(AM|PM)\s*-\s*/i.exec(range || "");
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const mer = m[2].toUpperCase();
    if (mer === "PM" && h !== 12) h += 12;
    if (mer === "AM" && h === 12) h = 24;
    return h;
  };

  const updateHourDetail = (hour, key, value) => {
    setHourlyDetails((prev) => {
      const currentDay = prev[selectedDate] || {};
      const currentHour = currentDay[hour] || {};
      return {
        ...prev,
        [selectedDate]: {
          ...currentDay,
          [hour]: {
            ...currentHour,
            [key]: value,
          },
        },
      };
    });
  };
  // Get all dates in selected month
  const getAllDatesInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const result = [];
    while (date.getMonth() === month) {
      result.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return result;
  };
  const daysInMonth = getAllDatesInMonth(selectedYear, selectedMonth);

  // Formatters
  const formatHour = (hour) => {
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${suffix}`;
  };
// Fix timeline header range: 9 to 18
// Totals: { [projectName]: { [phaseName]: count, ... }, ... }
// const projectPhaseTotals = {};
// timecardData.forEach(row => {
//   const blocks = JSON.parse(row.hourBlocks || "[]");
//   blocks.forEach(block => {
//     const project = block.projectName || "-";
//     const phase = block.projectPhase || "-";
//     if (!projectPhaseTotals[project]) projectPhaseTotals[project] = {};
//     if (!projectPhaseTotals[project][phase]) projectPhaseTotals[project][phase] = 0;
//     projectPhaseTotals[project][phase] += 1;
//   });
// });


const STATIC_TIMELINE_HOURS = Array.from({ length: 9 }, (_, i) => i + 9); // 9 to 17
const timelineHeaders = STATIC_TIMELINE_HOURS.map(hour => {
  const to12 = (h) => {
    const mer = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12} ${mer}`;
  };
  return `${to12(hour)} - ${to12(hour + 1)}`;
});

  const formatDate = (date) => {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatHourRange = (h24) => {
    const to12 = (h) => {
      const mer = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${h12} ${mer}`;
    };
    return `${to12(h24)} - ${to12(h24 + 1)}`;
  };
  // parse YYYY-MM-DD reliably into a local Date at midnight (avoids timezone shift)
const parseYMD = (ymd) => {
  if (!ymd) return null;
  const parts = String(ymd).split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return new Date(y, m - 1, d);
};

const getHourlySlots = () => {
  // determine whether selected date is today
  const selectedDateObj = parseYMD(selectedDate);
  const todayObj = parseYMD(formatDate(new Date())); // normalized local today
  const isToday = selectedDateObj && todayObj && selectedDateObj.getTime() === todayObj.getTime();

  // if user hasn't set check-in yet, return a default range
  // - for today: up to current hour
  // - for past days: full working day (minHour..maxHour)
  if (!checkInOut.checkIn) {
    const now = new Date();
    const end = isToday ? now.getHours() : maxHour;
    const slots = [];
    for (let h = minHour; h <=end; h++) {
      if (h === 13) continue; // skip lunch
      slots.push(h);
    }
    return slots;
  }

  // parse start hour from check-in
  const [startH] = checkInOut.checkIn.split(":").map(Number);

  // end hour preference: use check-out if set, otherwise maxHour
  let endH = maxHour;
  if (checkInOut.checkOut) {
    const [coHour] = checkInOut.checkOut.split(":").map(Number);
    if (!Number.isNaN(coHour)) endH = coHour;
  }

  // If selected date is today, restrict end to current hour.
  if (isToday) {
    const currentHour = new Date().getHours();
    endH = Math.min(endH, currentHour);
  }

  // Build slots from startH .. endH (skip lunch)
  const slots = [];
  let hour = startH;
  while (hour < endH) {
    if (hour === 13) { hour++; continue; }
    slots.push(hour);
    hour++;
  }

  return slots;
};
// Generate dynamic timeline headers
const generateTimelineHeaders = (startHour, endHour) => {
  let headers = [];
  for (let hour = startHour; hour < endHour; hour++) {
    const start = new Date(0, 0, 0, hour);
    const end = new Date(0, 0, 0, hour + 1);

    headers.push(
      `${start.toLocaleTimeString([], { hour: "numeric", hour12: true })} - 
       ${end.toLocaleTimeString([], { hour: "numeric", hour12: true })}`
    );
  }
  return headers;
};
// Example inside EmployeeDetail.jsx component
// const headers = generateTimelineHeaders(selectedDate);

  // Open/close panels
// Open/close panels
const openEditPanel = (date) => {
  if (!serverToday) {
    alert("⚠️ Server date not loaded yet. Please try again.");
    return;
  }

  // Ensure we have a Date object
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Normalize server "today"
  const today = new Date(serverToday);
  today.setHours(0, 0, 0, 0);

  // Normalize selected date
  const selected = new Date(dateObj);
  selected.setHours(0, 0, 0, 0);

  // Two weeks ago boundary
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14);
  twoWeeksAgo.setHours(0, 0, 0, 0);

  // ✅ Future date check
  if (selected > today) {
    alert("⚠️ Future dates are not allowed!");
    return;
  }

  // ✅ Past limit check (only 2 weeks old max)
  if (selected < twoWeeksAgo) {
    alert("⚠️ You can only edit timesheets from the past 2 weeks!");
    return;
  }

  // Format date as string for state
  const formatted = formatDate(selected);
  setSelectedDate(formatted);

  // Find existing entry for that date
  const entry = timecardData.find((d) => formatDate(d.date) === formatted);

  if (entry) {
    setCheckInOut({
      checkIn: entry.checkIn || "",
      checkOut: entry.checkOut || "",
    });

    setFormMode(entry.status || "Work");

    try {
      const parsed = JSON.parse(entry.hourBlocks || "[]");
      const mapped = {};
      parsed.forEach((block) => {
        const key = parseHourKeyFromRange(block.hour);
        if (key == null) return;
        mapped[key] = {
          type: block.projectType || "",
          category: block.projectCategory || "",
          name: block.projectName || "",
          phase: block.projectPhase || "",
          task: block.projectTask || "",
        };
      });
      setHourlyDetails((prev) => ({ ...prev, [formatted]: mapped }));
    } catch (err) {
      console.error("Error parsing hourBlocks:", err);
      setHourlyDetails((prev) => ({ ...prev, [formatted]: {} }));
    }
  } else {
    // New entry setup
    setCheckInOut({ checkIn: "", checkOut: "" });
  
    setFormMode("Work");
    setHourlyDetails((prev) => ({ ...prev, [formatted]: {} }));
  }

  // Open edit panel
  setShowEditPanel(true);
};



  const closeEditPanel = () => {
    setShowEditPanel(false);
    setSelectedDate(null);
  };

  const openApprovalDrawer = (date) => {
    setSelectedDate(date);
    setShowApprovalDrawer(true);
  };
  const closeApprovalDrawer = () => {
    setShowApprovalDrawer(false);
    setSelectedDate(null);
  };


  // Change handler example for hourly edit fields (expand as needed)
  const handleProjectFieldChange = (hour, field, value) => {
    setEditProjectsByHour((prev) => ({
      ...prev,
      [hour]: { ...prev[hour], [field]: value }
    }));
  };
  const taskOptions = {
    Software: {
      Design: ["POC", "Architecture", "UI/UX"],
      Development: ["Frontend", "Backend", "Parameter Tuning"],
      Testing: ["Unit Testing", "System Testing"],
      Release: ["Configuration Management", "Deploy"],
      "Bug Fix": ["Error", "New Feature"],
    },
    Engineering: {
      Design: ["Blueprint", "Simulation"],
      Development: ["Prototype", "Fabrication"],
      Testing: ["Load Testing", "Field Testing"],
      Release: ["Handover", "Maintenance"],
      "Bug Fix": ["Repair", "Upgrade"],
    },
    Training: {
      Design: ["Curriculum Design"],
      Development: ["Material Preparation"],
      Testing: ["Mock Sessions"],
      Release: ["Delivery"],
      "Bug Fix": ["Content Update"],
    },
  };
  // Save timesheet handler
   const handleSaveTimesheet = async () => {
    const date = selectedDate;
    const dayData = hourlyDetails[date] || {};
    const status = formMode;
    const checkIn = padTime(checkInOut.checkIn);
    const checkOut = padTime(checkInOut.checkOut);
   
   const hourBlocks = [];
getHourlySlots().forEach(hour => {
  const details = dayData[hour] || {};
  hourBlocks.push({
    hour: formatHourRange(hour),
    projectType: details.type || "",
    projectCategory: details.category || "",
    projectName: details.name || "",
    projectPhase: details.phase || "",
    projectTask: details.task || "",
  });
});

    const email = localStorage.getItem("userEmail");
    const body = {
      date,
      checkIn,
      checkOut,
    
      status,
      hourBlocks,
      email, // ✅ send email
    };

    try {
      const response = await fetch("http://localhost:3001/addHourDetail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (result.success) {
        alert("✅ Timesheet saved successfully!");
      } else {
        alert("❌ Error: " + (result.error || "Could not save"));
      }
    } catch (e) {
      console.error("Save failed:", e);
      alert("⚠️ Network error! Please try again.");
    }
  };
  useEffect(() => {
    fetch("http://localhost:3001/serverDate")
      .then((res) => res.json())
      .then((data) => {
        const srvDate = new Date(data.date);
        srvDate.setHours(0, 0, 0, 0); // normalize to midnight
        setServerToday(srvDate);
      })
      .catch((err) => console.error("Failed to fetch server date:", err));
  }, []);


  // Data fetching effects (unchanged)
  useEffect(() => {
    fetch("http://localhost:3001/getProjects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
        }
      })
      .catch((err) => console.error("Error fetching projects:", err));
  }, []);

  useEffect(() => {
    if (!employee?.id) return;
    fetch(
      `http://localhost:3001/getHourDetailsByMonth?year=${selectedYear}&month=${selectedMonth}&memberId=${employee.id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setTimecardData(data.data);
          // prepare hourlyDetails for quick lookup
          const byDate = {};
          data.data.forEach((entry) => {
            byDate[formatDate(entry.date)] = JSON.parse(entry.hourBlocks || "[]");
          });
          setHourlyDetails(byDate);
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [employee, selectedMonth, selectedYear]);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;
    fetch(`http://localhost:3001/api/members/byEmail?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEmployee(data.data);
      })
      .catch((err) => console.error("Error fetching employee by email:", err));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3001/api/members/${id}`)
      .then((res) => res.json())
      .then((member) => {
        if (Array.isArray(member) && member.length > 0) {
          setEmployee(member[0]);
        } else if (member && member.id) {
          setEmployee(member);
        }
      })
      .catch((err) => console.error("Error fetching employee:", err));
  }, [id]);

  return (
    <div className="employee-detail-container-with-sidebar"> <Sidebar />
    <div className="employee-detail-container">
      {/* Header */}
      <div className="header">
        {/* <Link to="/" className="back-link">← Back</Link> */}
        <h1>Time & Attendance</h1>
      </div>

     {/* Profile Section */}
      <div className="profile-section">
        {employee.imagePath ? (
          <img
            src={
              employee.imagePath.startsWith("/uploads")
                ? `http://localhost:3001${employee.imagePath}`
                : `http://localhost:3001/uploads/${employee.imagePath}`
            }
            alt={employee.fullName || "Employee"}
            className="profile-pic"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${employee.fullName}`;
            }}
          />
        ) : (
          <div className="profile-placeholder">
            {employee.fullName?.charAt(0) || "E"}
          </div>
        )}

        <div className="profile-info">
          <h2>{employee.fullName || "Name not loaded"}</h2>
          <p className="role">{employee.role || "Role not loaded"}</p>
        </div>

        <div className="hours-summary">
          <p className="total">{employee.totalHours || 0} hrs Total</p>
          <p>{employee.regularHours || 0} hrs Regular</p>
          <p>{employee.holidayHours || 0} hrs Holiday</p>
        </div>
      </div>


      {/* Progress Bar */}
      <div className="progress-section">
        <p className="progress-text">Hour breakdown: {employee.totalHours || 0} hrs</p>
        <div className="progress-bar">
          <div className="approved" style={{ width: "70%" }}></div>
          
          <div className="pending" style={{ width: "10%" }}></div>
        </div>
        <div className="progress-legend">
          <span className="legend green">Approved: {employee.approvedHours || 0} hrs</span>
     
          <span className="legend orange">Pending: {employee.pendingHours || 0} hrs</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === "timecard" ? "active" : ""}`} onClick={() => setActiveTab("timecard")}>
          Timecard
        </button>
        <button className={`tab ${activeTab === "timeline" ? "active" : ""}`} onClick={() => setActiveTab("timeline")}>
          Timeline
        </button>
      </div>
          <div className="month-selector">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from({ length: 16 }, (_, i) => (
                  <option key={i} value={2020 + i}>
                    {2020 + i}
                  </option>
                ))}
              </select>
            </div>

      {/* Actions */}
      {/* <div className="actions">
        <label className="checkbox">
          <input type="checkbox" /> Show only unapproved days
        </label>
        <button className="btn light">Add Time Off</button>
        <button className="btn reject">Reject All</button>
        <button className="btn approve">Approve All</button>
      </div> */}

      {/* Timecard View */}
      {activeTab === "timecard" ? (
        <div className="timecard-view">
          {/* ---- Project/Phase Total Summary (Date-wise) ---- */}
{timecardData && timecardData.length > 0 && (
  <div className="project-phase-summary" style={{ marginTop: "2rem" }}>
    <h4>Project / Phase Total Hours (Date-wise)</h4>
    <table className="table summary-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Check-in</th>
          <th>Check-out</th>
          <th>Project</th>
          <th>Phase</th>
          <th>Total Hours</th>
        </tr>
      </thead>
      <tbody>
  {timecardData.map((row, idx) => {
    const blocks = JSON.parse(row.hourBlocks || "[]");

    // Compute total hours per project and phase
    const projectPhaseHours = {};
    blocks.forEach((b) => {
      const project = b.projectName || "-";
      const phase = b.projectPhase || "-";
      if (!projectPhaseHours[project]) projectPhaseHours[project] = {};
      if (!projectPhaseHours[project][phase]) projectPhaseHours[project][phase] = 0;
      projectPhaseHours[project][phase] += 1; // 1 hour per block
    });

    // Flatten data so each project is one row, phases concatenated
    return Object.entries(projectPhaseHours).map(([project, phases], projectIdx) => {
      const phaseDetails = Object.entries(phases)
        .map(([phase, hours]) => `${phase}: ${hours}`)
        .join(", ");

      // Only show date/check-in/check-out on the first project row for that date
      const showDate = projectIdx === 0;

      return (
        <tr key={`${idx}-${project}`}>
          <td>{showDate ? formatDate(row.date) : ""}</td>
          <td>{showDate ? row.checkIn : ""}</td>
          <td>{showDate ? row.checkOut : ""}</td>
          <td>{project}</td>
          <td>{phaseDetails}</td>
          <td>{Object.values(phases).reduce((a, b) => a + b, 0)}</td>
        </tr>
      );
    });
  })}
</tbody>

    </table>
  </div>
)}

        </div>
      ) : activeTab === "timeline" ? (
        <div className="timeline-view">
       <div className="timeline-header">
  <div className="date-cell">Date</div>
  {timelineHeaders.map((h, i) => (
    <th key={i}>{h}</th>
  ))}
  <div className="approval-cell">Edit</div>
</div>

          {daysInMonth.map((date, index) => {
            const formatted = formatDate(date);
            const entry = timecardData.find((d) => formatDate(d.date) === formatted);
            const hourBlocks = entry ? JSON.parse(entry.hourBlocks || "[]") : [];

            return (
              <div className="timeline-row" key={index}>
                <div className="date-cell">{formatted}</div>

                {[...Array(9)].map((_, hourIdx) => {
                  const hour = 9 + hourIdx;
                  const block = hourBlocks.find(
                    (b) =>
                      b.hour === formatHourRange(hour) ||
                      (b.hourKey && b.hourKey === hour) ||
                      (typeof b.hour === "string" && parseHourKeyFromRange(b.hour) === hour)
                  );

                  const status = entry?.status || "Work";
                  const isLeave = status === "Leave";
                  const isFilled =
                    block &&
                    (block.projectType ||
                      block.projectCategory ||
                      block.projectName ||
                      block.projectPhase ||
                      block.projectTask);

                  let colorClass = "";
                  if (hour === 13) colorClass = "break";
                  else if (isLeave) colorClass = "leave";
                  else if (isFilled) colorClass = "work";

                  return (
                    <div
                      key={hourIdx}
                      className={`hour-cell ${colorClass}`}
                      title={
                        isLeave
                          ? "Leave"
                          : hour === 13
                          ? "Lunch Break"
                          : isFilled
                          ? `${block.projectName || "-"} (${block.projectPhase || "-"})`
                          : ""
                      }
                    />
                  );
                })}

                <div className="approval-cell">
                  <button className="icon-btn edit-btn" onClick={() => openEditPanel(formatted)}>
                    ✎
                  </button>
                </div>
              </div>
            );
          })}

          <div className="legend-container">
            <span className="legend-box work" /> Work
            <span className="legend-box leave" /> Leave
            <span className="legend-box break" /> Lunch Break
          </div>
        </div>
      ) : null}

      {/* Manual Time Edit Panel - Hourly Project Fields */}
{showEditPanel && (
  <div className="edit-panel">
    <div className="edit-header">
      <h3>Edit Projects</h3>
      <button className="close-btn" onClick={closeEditPanel}>✖</button>
    </div>

    <div className="edit-content">
      <p className="date-label">{selectedDate}</p>

      {/* Global fields, only ONCE */}
      <div className="field">
        <label>Check-In Time</label>
        <input
          type="time"
          value={checkInOut.checkIn}
          onChange={e => setCheckInOut(prev => ({ ...prev, checkIn: e.target.value }))}
        />
      </div>
      <div className="field">
        <label>Check-Out Time</label>
        <input
          type="time"
          value={checkInOut.checkOut}
          onChange={e => setCheckInOut(prev => ({ ...prev, checkOut: e.target.value }))}
        />
      </div>

      <div className="field">
        <label>Global Status</label>
        <select value={formMode} onChange={e => setFormMode(e.target.value)}>
          <option value="Work">Work</option>
          <option value="Leave">Leave</option>
        </select>
      </div>

      {/* Per-hour project fields */}
      {getHourlySlots().map((hour, i) => {
  // Access hourData only after knowing the hour
  const hourData = hourlyDetails[selectedDate]?.[hour] || {};

  return (
    <div key={i} className="hour-block">
      <h4>{hour}:00 - {hour + 1}:00</h4>

      <div className="field">
        <label>Project Type</label>
        <select
          value={hourData.type || ""}
          onChange={(e) => updateHourDetail(hour, "type", e.target.value)}
          disabled={formMode === "Leave"}
        >
          <option value="">Select</option>
          <option>Billable</option>
          <option>Internal</option>
        </select>
      </div>

      <div className="field">
        <label>Project Category</label>
        <select
          value={hourData.category || ""}
          onChange={(e) => updateHourDetail(hour, "category", e.target.value)}
          disabled={formMode === "Leave"}
        >
          <option value="">Select Category</option>
          <option>Software</option>
          <option>Engineering</option>
          <option>Training</option>
        </select>
      </div>

      <div className="field">
        <label>Project Name</label>
        <select
          value={hourData.name || ""}
          onChange={(e) => updateHourDetail(hour, "name", e.target.value)}
          disabled={formMode === "Leave"}
        >
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.projectName}>
              {project.projectName}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Project Phase</label>
        <select
          value={hourData.phase || ""}
          onChange={(e) => updateHourDetail(hour, "phase", e.target.value)}
          disabled={formMode === "Leave"}
        >
          <option value="">-- Select Phase --</option>
          <option value="Design">Design</option>
          <option value="Development">Development</option>
          <option value="Testing">Testing</option>
          <option value="Release">Release</option>
          <option value="Bug Fix">Bug Fix</option>
        </select>
      </div>

      <div className="field">
        <label>Project Task</label>
        <select
          value={hourData.task || ""}
          onChange={(e) => updateHourDetail(hour, "task", e.target.value)}
          disabled={formMode === "Leave"}
        >
          <option value="">Select Task</option>
          {(taskOptions[hourData.category]?.[hourData.phase] || []).map(
            (t, idx) => (
              <option key={idx} value={t}>
                {t}
              </option>
            )
          )}
        </select>
      </div>
      <hr />
    </div>
  );
})}

    </div>

    <div className="edit-footer">
      <button className="cancel-btn" onClick={closeEditPanel}>Cancel</button>
      <button className="save-btn" onClick={handleSaveTimesheet}>Save</button>
    </div>
  </div>
)}



      {/* Approval Drawer - Add similar handlers and controlled inputs if needed */}
      {showApprovalDrawer && (
        <>
          <div className="overlay" onClick={closeApprovalDrawer}></div>
          <div className="approval-drawer">
            <div className="drawer-header">
              <h3>Edit Projects</h3>
              <button className="close-btn" onClick={closeApprovalDrawer}>✖</button>
            </div>
            <div className="drawer-content">
              <p className="drawer-date">{selectedDate}</p>
              {/* Similar structure as edit panel if needed */}
            </div>
            <div className="drawer-footer">
              <button className="cancel-btn" onClick={closeApprovalDrawer}>Cancel</button>
              <button className="save-btn">Save</button>
            </div>
          </div>
        </>
      )}
    </div></div>
  );
};

export default TimesheetDetail;
