import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/dashboard/dashboard.jsx";
import TimesheetDetail from "./components/timesheetDetails/timesheetDetail.jsx";
import EmployeeDetail from "./components/admin/employeeDetails/employeeDetail.jsx";
import Project from "./components/admin/projects/projects.jsx"; 
import AddEmployee from "./components/admin/add_employee/add_employee.jsx"; 
import AddProject from "./components/admin/add_project/add_project.jsx"; 
import LoginPage from "./components/login_page/login.jsx"; 


import ForgotPassword from "./components/login_page/ForgotPassword";
import ResetPassword from "./components/login_page/ResetPassword";

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
        <Route path="/timesheet" element={<TimesheetDetail />} />

        {/* Projects route */}
        <Route path="/projects" element={<Project />} />

        {/* Add Employee route */}
        <Route path="/add_employee" element={<AddEmployee />} />

        {/* Add Project route */}
        <Route path="/add_project" element={<AddProject />} />

        {/* Employee details route */}
        <Route path="/employee" element={<EmployeeDetail />} />
          <Route path="/authentication/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
