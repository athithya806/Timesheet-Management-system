import React, { useState } from "react";
import "./add_employee.css";

const AddEmployee = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [gender, setGender] = useState("");

  return (
    <div className="form-container">
      {/* Tabs */}
      <div className="form-tabs">
        <div
          className={`form-tab ${activeTab === "basic" ? "active" : ""}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic information
        </div>
        <div
          className={`form-tab ${activeTab === "employment" ? "active" : ""}`}
          onClick={() => setActiveTab("employment")}
        >
          Employment type
        </div>
        <div
          className={`form-tab ${activeTab === "benefits" ? "active" : ""}`}
          onClick={() => setActiveTab("benefits")}
        >
          Benefits
        </div>
      </div>

      {/* Basic Info Form */}
      {activeTab === "basic" && (
        <>
          <div className="form-group">
            <label className="form-label">Employee name</label>
            <input className="form-input" type="text" placeholder="John Doe" />
          </div>

          <div className="form-group">
            <label className="form-label">Job title</label>
            <input
              className="form-input"
              type="text"
              placeholder="Product Designer"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              placeholder="abc@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone number</label>
            <input
              className="form-input"
              type="text"
              placeholder="+123 456 789"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <input
              className="form-input"
              type="text"
              placeholder="51"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <div className="gender-options">
              <button
                type="button"
                className={`gender-btn ${gender === "male" ? "active" : ""}`}
                onClick={() => setGender("male")}
              >
                Male
              </button>
              <button
                type="button"
                className={`gender-btn ${gender === "female" ? "active" : ""}`}
                onClick={() => setGender("female")}
              >
                Female
              </button>
              <button
                type="button"
                className={`gender-btn ${gender === "other" ? "active" : ""}`}
                onClick={() => setGender("other")}
              >
                Other
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary">Previous</button>
            <button className="btn btn-primary">Next</button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddEmployee;
