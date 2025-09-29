import React, { useState } from "react";
import "./add_employee.css";

const AddEmployee = () => {
  const [gender, setGender] = useState("");

  return (
    <div className="form-container">
      {/* Header */}
      <div className="form-tabs">
        <div className="form-tab active">Add Employee</div>
      </div>

      {/* Full Name & Email */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" type="text" placeholder="John Doe" />
        </div>
        <div className="form-group">
          <label className="form-label">Email ID</label>
          <input className="form-input" type="email" placeholder="abc@example.com" />
        </div>
      </div>

      {/* Contact Number & Department */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Contact Number</label>
          <input className="form-input" type="text" placeholder="+123 456 789" />
        </div>

        <div className="form-group">
          <label className="form-label">Department</label>
          <select className="form-input">
            <option value="">Select Department</option>
            <option value="innovative-manufacturing">Innovative Manufacturing</option>
            <option value="smart-factory">Smart Factory</option>
            <option value="ar-vr-mr-research">AR | VR | MR Research Centre</option>
            <option value="plm-research">Research Centre for PLM</option>
            <option value="asset-performance-research">Research Centre for Asset Performance</option>
            <option value="product-innovation">Product Innovation</option>
            <option value="predictive-engineering">Predictive Engineering</option>
            <option value="artificial-intelligence">Artificial Intelligence</option>
            <option value="full-stack">Full Stack</option>
          </select>
        </div>
      </div>

      {/* Role & Password */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-input">
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Enter password" />
        </div>
      </div>

      {/* Image Upload */}
      <div className="form-group">
        <label className="form-label">Upload Image</label>
        <input className="form-input" type="file" />
      </div>

      {/* Gender */}
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

      {/* Actions */}
      <div className="form-actions">
        <button className="btn btn-primary">Add Employee</button>
      </div>
    </div>
  );
};

export default AddEmployee;
