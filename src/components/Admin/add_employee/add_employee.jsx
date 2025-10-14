import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./add_employee.css";
import logo from "../../../assests/logo.jpeg";

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

const ROLES = ["admin", "employee"];

const AddEmployee = ({ hideExtras = false, location: propLocation }) => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const location = propLocation || routerLocation;

  const existingEmployee = location.state?.employeeData || null;
  const isEditMode = Boolean(existingEmployee);

  const [formData, setFormData] = useState({
    empId: existingEmployee?.empId || "",
    fullName: existingEmployee?.fullName || "",
    email: existingEmployee?.email || "",
    phone: existingEmployee?.phone || "",
    department: existingEmployee?.department || "",
    role: existingEmployee?.role || "",
    password: existingEmployee?.password || "",
    imagePath: existingEmployee?.imagePath || "",
    gender: existingEmployee?.gender || "",
  });

  const [employees, setEmployees] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("addEmployee");

  useEffect(() => {
    if (!hideExtras) {
      fetch("http://localhost:3001/api/members")
        .then((res) => res.json())
        .then((data) => {
          setEmployees(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching employees:", err);
          setError("Failed to load employee data.");
          setLoading(false);
        });
    }
  }, [hideExtras]);

  const handleTabClick = (tab) => {
    if (tab === "addEmployee") return navigate("/add_employee");
    if (tab === "addProject") return navigate("/add_project");
    if (tab === "employeeList") return navigate("/employee");
    if (tab === "projects") return navigate("/projects");
    if (tab === "logout") return navigate("/login");
  };

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
      setFormData((prev) => ({ ...prev, imagePath: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () =>
    setFormData((prev) => ({ ...prev, imagePath: "" }));

  const passwordIsValid = () => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(formData.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordIsValid()) {
      alert(
        "Password must include uppercase, lowercase, number, special character and be at least 8 characters long."
      );
      return;
    }

    try {
      const endpoint = isEditMode
        ? `http://localhost:3001/api/members/${existingEmployee.id}`
        : "http://localhost:3001/members";

      const method = isEditMode ? "PUT" : "POST";
      const payload = isEditMode
        ? { ...formData, empId: existingEmployee.empId }
        : formData;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save employee");

      alert(
        isEditMode
          ? "Employee updated successfully!"
          : "Employee added successfully!"
      );

      // Navigate after editing
      if (isEditMode && hideExtras) return navigate("/timesheet");

      navigate("/employee");
    } catch (error) {
      alert("Failed to save employee: " + error.message);
    }
  };

  return (
    
    <div className="add-employee-page">
      {/* ===== Top Navbar ===== */}
    <header className="top-navbar">
      <img src={logo} alt="Company Logo" className="navbar-logo" />
      <h1 className="navbar-title">Timesheet</h1>
    </header>
      {/* ===== Stats Cards ===== */}
      {!hideExtras && (
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
      )}

      {/* ===== Tabs ===== */}
      {!hideExtras && (
        <div className="form-tabs">
          <div className="tab-group">
            <div
              className={`form-tab ${activeTab === "addEmployee" ? "active" : ""}`}
              onClick={() => handleTabClick("addEmployee")}
            >
              Add Employee
            </div>
            <div
              className={`form-tab ${activeTab === "addProject" ? "active" : ""}`}
              onClick={() => handleTabClick("addProject")}
            >
              Add Project
            </div>
            <div
              className={`form-tab ${activeTab === "employeeList" ? "active" : ""}`}
              onClick={() => handleTabClick("employeeList")}
            >
              Employee List
            </div>
            <div
              className={`form-tab ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => handleTabClick("projects")}
            >
              Projects
            </div>
          </div>

          <div className="tab-group">
            <div
              className={`form-tab ${activeTab === "logout" ? "active" : ""}`}
              onClick={() => handleTabClick("logout")}
            >
              Logout
            </div>
          </div>
        </div>
      )}

      {/* ===== Form Section ===== */}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {/* Full Name & Email */}
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

          {/* Phone & Department */}
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
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role & Password */}
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
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
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
                  style={{
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                  }}
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

          {/* Upload Image */}
          <div className="form-group">
            <label className="form-label">Upload Image</label>
            <input
              className="form-input"
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageChange}
            />
            {formData.imagePath && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 8,
                  gap: 8,
                }}
              >
                <img
                  src={formData.imagePath}
                  alt="Preview"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    objectFit: "cover",
                    border: "1px solid #ccc",
                  }}
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

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">Gender</label>
            <div className="gender-options">
              <button
                type="button"
                className={`gender-btn ${
                  formData.gender === "male" ? "active" : ""
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, gender: "male" }))
                }
              >
                Male
              </button>
              <button
                type="button"
                className={`gender-btn ${
                  formData.gender === "female" ? "active" : ""
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, gender: "female" }))
                }
              >
                Female
              </button>
              <button
                type="button"
                className={`gender-btn ${
                  formData.gender === "other" ? "active" : ""
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, gender: "other" }))
                }
              >
                Other
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              {isEditMode ? "Save Changes" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
