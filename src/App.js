import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Dashboard from "./components/dashboard/dashboard.jsx";
import TimesheetDetail from "./components/timesheetDetails/timesheetDetail.jsx";
import EmployeeDetail from "./components/Admin/employeeDetails/employeeDetail.jsx";
import Project from "./components/Admin/projects/projects.jsx"; 
import AddEmployee from "./components/Admin/add_employee/add_employee.jsx"; 
import AddProject from "./components/Admin/add_project/add_project.jsx"; 
import LoginPage from "./components/login_page/login.jsx"; 
import ProfilePage from "./components/profile/ProfilePage";
import ForgotPassword from "./components/login_page/ForgotPassword";
import ResetPassword from "./components/login_page/ResetPassword";

// 🔒 ProtectedRoute inline
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isLoggedIn") === "true";
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Optional: Logout component (can place in Navbar)



function App() {
  return (
    <Router>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/authentication/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timesheet"
          element={
            <ProtectedRoute>
              <TimesheetDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add_employee"
          element={
            <ProtectedRoute>
              <AddEmployee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add_project"
          element={
            <ProtectedRoute>
              <AddProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <EmployeeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
