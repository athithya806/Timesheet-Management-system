import React, { useState } from "react";
import "./add_employee.css";

const DEPARTMENTS = [
  "Innovative Manufacturing",
  "Smart Factory Center",
  "AR | VR | MR Research Centre",
  "Digital Technology",
  "Research Centre For PLM",
  "Research Centre For Asset Performance",
  "Product Innovation Center",
  "Predictive Engineering",
];

const ROLES = [
  "admin",
  "employee"
];

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    password: "",
    imagePath: "",
    gender: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG or PNG images are allowed.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setFormData((prev) => ({ ...prev, imagePath: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imagePath: "" }));
  };

  const passwordIsValid = () => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(formData.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordIsValid()) {
      alert("Password must include uppercase, lowercase, number, special character and be at least 8 characters long.");
      return;
    }
    // Submit data to backend here (replace with your endpoint)
    try {
      const res = await fetch("http://localhost:3001/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to add member");
      alert("Member added successfully!");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        department: "",
        role: "",
        password: "",
        imagePath: "",
        gender: "",
      });
    } catch (error) {
      alert("Failed to add member: " + error.message);
    }
  };

  return (
    <div className="form-container">
      <div className="form-tabs">
        <div className="form-tab active">Add Employee</div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              name="fullName"
              placeholder="John Doe"
               value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email ID</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="abc@example.com"
               value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input
              className="form-input"
              type="text"
              name="phone"
              placeholder="+123 456 789"
             value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              className="form-input"
              name="department"
                value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-input"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="show-password-btn"
                style={{ cursor: "pointer", border: "none", background: "transparent" }}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {formData.password.length > 0 && !passwordIsValid() && (
              <div className="password-hint">
                Try: <strong>Secure@2025!</strong>
              </div>
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Upload Image</label>
          <input
            className="form-input"
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleImageChange}
          />
          {formData.imagePath && (
            <div style={{ display: "flex", alignItems: "center", marginTop: 8, gap: 8 }}>
              <img
                src={formData.imagePath}
                alt="Preview"
                style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover", border: "1px solid #ccc" }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="remove-img-btn"
                style={{
                  padding: 4,
                  border: "none",
                  backgroundColor: "#eee",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Gender</label>
          <div className="gender-options">
            <button
              type="button"
              className={`gender-btn ${formData.gender === "male" ? "active" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, gender: "male" }))}
            >
              Male
            </button>
            <button
              type="button"
              className={`gender-btn ${formData.gender === "female" ? "active" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, gender: "female" }))}
            >
              Female
            </button>
            <button
              type="button"
              className={`gender-btn ${formData.gender === "other" ? "active" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, gender: "other" }))}
            >
              Other
            </button>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">
            Add Employee
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
