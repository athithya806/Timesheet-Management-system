import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/dashboard/dashboard.jsx";
import Timesheet from "./components/Timesheet/Timesheet.jsx";
import EmployeeDetail from "./components/employeeDetails/EmployeeDetail.jsx";
import Project from "./components/projects/projects.jsx"; 
import AddEmployee from "./components/add_employee/add_employee.jsx"; 
import AddProject from "./components/add_project/add_project.jsx"; 
import LoginPage from "./components/login_page/login.jsx"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Timesheet route */}
        <Route path="/timesheet" element={<Timesheet />} />

        {/* Projects route */}
        <Route path="/projects" element={<Project />} />

        {/* Add Employee route */}
        <Route path="/add_employee" element={<AddEmployee />} />

        {/* Add Project route */}
        <Route path="/add_project" element={<AddProject />} />

        {/* Employee details route */}
        <Route path="/employee" element={<EmployeeDetail />} />

        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
