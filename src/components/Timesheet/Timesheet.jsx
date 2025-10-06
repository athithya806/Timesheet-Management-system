import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Timesheet.css";

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

const Timesheet = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("employeeList");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    empId: "",
    department: "",
    role: "",
    password: "",
  });

  const handleTabClick = (tab) => {
    if (tab === "addEmployee") return navigate("/add_employee");
    if (tab === "addProject") return navigate("/add_project");
    if (tab === "dashboard") return navigate("/dashboard");
    setActiveTab(tab);
  };

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

  // Open edit popup
  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone || "",
      empId: emp.empId,
      department: emp.department || "",
      role: emp.role || "",
      password: emp.password || "",
    });
    setShowEditModal(true);
  };

  // Handle input change inside modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save edited employee
  const handleSaveEdit = () => {
    fetch(`http://localhost:3001/api/members/${selectedEmployee.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEmployees((prev) =>
            prev.map((emp) =>
              emp.id === selectedEmployee.id ? { ...emp, ...formData } : emp
            )
          );
          setShowEditModal(false);
          setSelectedEmployee(null);
        } else {
          alert("Failed to update employee");
        }
      })
      .catch((err) => console.error("Update error:", err));
  };

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

        {/* Employee Table */}
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
                      <td>{emp.fullName}</td>
                      <td>{emp.email}</td>
                      <td>{emp.department}</td>
                      <td>
                        <button
                          className="btn small"
                          onClick={() => openEditModal(emp)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn small"
                          onClick={() => {
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

        {/* Edit Popup */}
        {showEditModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                width: "400px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              <h3>Edit Employee</h3>

              <label>Name:</label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
              />

              <label>Email:</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />

              <label>Phone:</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />

              <label>Department:</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept, i) => (
                  <option key={i} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <label>Role:</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="">Select Role</option>
                {ROLES.map((role, i) => (
                  <option key={i} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <div style={{ marginTop: "10px", textAlign: "right" }}>
                <button
                  className="btn small"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn small"
                  style={{ marginLeft: "10px" }}
                  onClick={handleSaveEdit}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timesheet;
