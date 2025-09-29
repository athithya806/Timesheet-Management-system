import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./EmployeeDetail.css";

const EmployeeDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("timeline");
  const [showEditPanel, setShowEditPanel] = useState(false); // Manual time panel
  const [showApprovalDrawer, setShowApprovalDrawer] = useState(false); // Approval drawer
  const [selectedDate, setSelectedDate] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState({}); // Track approvals per day

  const workSessions = [
    { day: "Mon, 1st Jun", start: 10, end: 18, break: true },
    { day: "Tue, 2nd Jun", start: 10, end: 18, break: true },
    { day: "Wed, 3rd Jun", start: 10, end: 16, break: true },
    { day: "Thu, 4th Jun", start: null, end: null },
    { day: "Fri, 5th Jun", start: null, end: null },
    { day: "Sat, 6th Jun", start: null, end: null },
    { day: "Sun, 7th Jun", start: null, end: null },
  ];

  // Manual edit panel
  const openEditPanel = (date) => {
    setSelectedDate(date);
    setShowEditPanel(true);
  };
  const closeEditPanel = () => {
    setShowEditPanel(false);
    setSelectedDate(null);
  };

  // Approval drawer
  const openApprovalDrawer = (date) => {
    setSelectedDate(date);
    setShowApprovalDrawer(true);
  };
  const closeApprovalDrawer = () => {
    setShowApprovalDrawer(false);
    setSelectedDate(null);
  };

  // Approve / Reject handlers
  const approveSession = (day) => {
    setApprovalStatus((prev) => ({ ...prev, [day]: "approved" }));
  };
  const rejectSession = (day) => {
    setApprovalStatus((prev) => ({ ...prev, [day]: "rejected" }));
  };

  return (
    <div className="employee-detail-container">
      {/* Header */}
      <div className="header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Time & Attendance</h1>
      </div>

      {/* Profile Section */}
      <div className="profile-section">
        <img
          src="https://via.placeholder.com/60"
          alt="Employee"
          className="profile-pic"
        />
        <div className="profile-info">
          <h2>Ralph Edwards</h2>
          <p className="role">Product Designer • Hourly</p>
        </div>
        <div className="hours-summary">
          <p className="total">264 hrs Total</p>
          <p>172 hrs Regular</p>
          <p>24 hrs Overtime</p>
          <p>20 hrs Holiday</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <p className="progress-text">Hour breakdown: 264 hrs</p>
        <div className="progress-bar">
          <div className="approved" style={{ width: "70%" }}></div>
          <div className="overtime" style={{ width: "20%" }}></div>
          <div className="pending" style={{ width: "10%" }}></div>
        </div>
        <div className="progress-legend">
          <span className="legend green">Approved: 132 hrs</span>
          <span className="legend red">Overtime: 40 hrs</span>
          <span className="legend orange">Pending: 10 hrs</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "timecard" ? "active" : ""}`}
          onClick={() => setActiveTab("timecard")}
        >
          Timecard
        </button>
        <button
          className={`tab ${activeTab === "timeline" ? "active" : ""}`}
          onClick={() => setActiveTab("timeline")}
        >
          Timeline
        </button>
      </div>

      {/* Actions */}
      <div className="actions">
        <label className="checkbox">
          <input type="checkbox" /> Show only unapproved days
        </label>
        <button className="btn light">Add Time Off</button>
        <button className="btn reject">Reject All</button>
        <button className="btn approve">Approve All</button>
      </div>

      {/* Timecard View */}
      {activeTab === "timecard" ? (
        <div className="timecard-view">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Meal Break</th>
                <th>Work Hours</th>
                <th>Approval</th>
              </tr>
            </thead>
            <tbody>
              {workSessions.map((session, index) => (
                <tr
                  key={index}
                  className="clickable-row"
                  onClick={() => openEditPanel(session.day)}
                >
                  <td>{session.day}</td>
                  <td>{session.start ? `${session.start}:00 AM` : "-"}</td>
                  <td>{session.end ? `${session.end}:00 PM` : "-"}</td>
                  <td>{session.break ? "1 hr" : "-"}</td>
                  <td>{session.start && session.end ? "8 hrs" : "-"}</td>
                  <td>{approvalStatus[session.day] || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Timeline View */
        <div className="timeline-view">
          {/* Header */}
          <div className="timeline-header">
            <div className="date-cell">Date</div>
            {[...Array(9)].map((_, i) => (
              <div className="hour-label" key={i}>
                {i + 10} AM
              </div>
            ))}
            <div className="approval-cell">Approval</div>
          </div>

          {/* Rows */}
          {workSessions.map((session, index) => (
            <div className="timeline-row" key={index}>
              <div className="date-cell">{session.day}</div>

              {[...Array(9)].map((_, hour) => {
                const currentHour = hour + 10;
                const isWorkHour =
                  session.start !== null &&
                  session.end !== null &&
                  currentHour >= session.start &&
                  currentHour < session.end;

                const isBreak =
                  session.break && currentHour === 12; // 12-1 break

                return (
                  <div
                    key={hour}
                    className={`hour-cell ${
                      isWorkHour ? (isBreak ? "break" : "work") : ""
                    }`}
                  ></div>
                );
              })}

              <button
                className="icon-btn edit-btn"
                onClick={() => openApprovalDrawer(session.day)}
              >
                ✎
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Manual Time Edit Panel replaced with hourly Project Fields */}
      {showEditPanel && (
        <div className="edit-panel">
          <div className="edit-header">
            <h3>Edit Projects</h3>
            <button className="close-btn" onClick={closeEditPanel}>
              ✖
            </button>
          </div>
          <div className="edit-content">
            <p className="date-label">{selectedDate}</p>

            {/* Loop for each hour */}
            {workSessions
              .find((s) => s.day === selectedDate)
              ?.start &&
              [...Array(
                workSessions.find((s) => s.day === selectedDate).end -
                  workSessions.find((s) => s.day === selectedDate).start
              )].map((_, i) => {
                const session = workSessions.find((s) => s.day === selectedDate);
                const startHour = session.start + i;
                const endHour = startHour + 1;
                return (
                  <div key={i} className="hour-block">
                    <h4>
                      {startHour}:00 - {endHour}:00
                    </h4>
                    <div className="field">
                      <label>Project Type</label>
                      <select>
                        <option value="">Select Type</option>
                        <option value="Internal">Internal</option>
                        <option value="Client">Client</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Project Category</label>
                      <select>
                        <option value="">Select Category</option>
                        <option value="Development">Development</option>
                        <option value="Testing">Testing</option>
                        <option value="Research">Research</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Project Name</label>
                      <input type="text" placeholder="Enter project name" />
                    </div>
                    <div className="field">
                      <label>Project Phase</label>
                      <select>
                        <option value="">Select Phase</option>
                        <option value="Planning">Planning</option>
                        <option value="Execution">Execution</option>
                        <option value="Review">Review</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Project Task</label>
                      <input type="text" placeholder="Enter task description" />
                    </div>
                    <hr />
                  </div>
                );
              })}
          </div>

          <div className="edit-footer">
            <button className="cancel-btn" onClick={closeEditPanel}>
              Cancel
            </button>
            <button className="save-btn">Save</button>
          </div>
        </div>
      )}

      {/* Approval Drawer can be updated similarly */}
      {showApprovalDrawer && (
        <>
          <div className="overlay" onClick={closeApprovalDrawer}></div>
          <div className="approval-drawer">
            <div className="drawer-header">
              <h3>Edit Projects</h3>
              <button className="close-btn" onClick={closeApprovalDrawer}>
                ✖
              </button>
            </div>
            <div className="drawer-content">
              <p className="drawer-date">{selectedDate}</p>

              {workSessions
                .find((s) => s.day === selectedDate)
                ?.start &&
                [...Array(
                  workSessions.find((s) => s.day === selectedDate).end -
                    workSessions.find((s) => s.day === selectedDate).start
                )].map((_, i) => {
                  const session = workSessions.find(
                    (s) => s.day === selectedDate
                  );
                  const startHour = session.start + i;
                  const endHour = startHour + 1;
                  return (
                    <div key={i} className="hour-block">
                      <h4>
                        {startHour}:00 - {endHour}:00
                      </h4>
                      <div className="field">
                        <label>Project Type</label>
                        <select>
                          <option value="">Select Type</option>
                          <option value="Internal">Internal</option>
                          <option value="Client">Client</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Project Category</label>
                        <select>
                          <option value="">Select Category</option>
                          <option value="Development">Development</option>
                          <option value="Testing">Testing</option>
                          <option value="Research">Research</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Project Name</label>
                        <input type="text" placeholder="Enter project name" />
                      </div>
                      <div className="field">
                        <label>Project Phase</label>
                        <select>
                          <option value="">Select Phase</option>
                          <option value="Planning">Planning</option>
                          <option value="Execution">Execution</option>
                          <option value="Review">Review</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Project Task</label>
                        <input type="text" placeholder="Enter task description" />
                      </div>
                      <hr />
                    </div>
                  );
                })}
            </div>

            <div className="drawer-footer">
              <div>
                <button className="cancel-btn" onClick={closeApprovalDrawer}>
                  Cancel
                </button>
                <button className="save-btn">Save</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeDetail;
