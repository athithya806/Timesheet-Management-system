import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar/sidebar";
import AddEmployee from "../Admin/add_employee/add_employee";
import "./profile.css";
import "../Admin/add_employee/add_employee.css";

const ProfilePage = () => {
  const [employee, setEmployee] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    fetch(`http://localhost:3001/api/members/byEmail?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEmployee(data.data);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

  if (!employee) return <p className="loading-text">Loading profile...</p>;

  // If editing, show only the AddEmployee form
  if (editing) {
    return (
      <div className="profile-page">
        <Sidebar />
        <div className="profile-content">
          <AddEmployee
            hideExtras={true} // hide stats and tabs
            location={{ state: { employeeData: employee } }}
          />
        </div>
      </div>
    );
  }

  // Otherwise, show profile card
  return (
    <div className="profile-page">
      <Sidebar />
      <div className="profile-content">
        <div className="profile-header">
          <h1>{employee.fullName}</h1>
          <button
            className="edit-icon-btn"
            onClick={() => setEditing(true)}
            title="Edit Profile"
          >
            ✏️
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-image-container">
            <img
              src={
                employee.imagePath
                  ? `http://localhost:3001${employee.imagePath}`
                  : `https://ui-avatars.com/api/?name=${employee.fullName}&background=blue&color=fff&size=128`
              }
              alt={employee.fullName}
              className="profile-image"
            />
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="label">Full Name:</span>
              <span className="value">{employee.fullName}</span>
            </div>
            <div className="detail-row">
              <span className="label">Email:</span>
              <span className="value">{employee.email}</span>
            </div>
            <div className="detail-row">
              <span className="label">Phone:</span>
              <span className="value">{employee.phone}</span>
            </div>
            <div className="detail-row">
              <span className="label">Role:</span>
              <span className="value">{employee.role}</span>
            </div>
            <div className="detail-row">
              <span className="label">Department:</span>
              <span className="value">{employee.department}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
