// src/App.jsx
import React, { useState } from "react";
import { FaClock, FaUsers, FaFileAlt, FaChartBar } from "react-icons/fa";
import "./dashboard.css";

function App() {
  const [timesheets, setTimesheets] = useState([
    { id: 1, employee: "John Doe", project: "Website Redesign", hours: 40, status: "Approved" },
    { id: 2, employee: "Jane Smith", project: "Mobile App", hours: 35, status: "Pending" },
  ]);

  const [newSheet, setNewSheet] = useState({
    employee: "",
    project: "",
    hours: "",
    status: "Pending",
  });

  const handleAdd = () => {
    if (!newSheet.employee || !newSheet.project || !newSheet.hours) return;
    setTimesheets([
      ...timesheets,
      { ...newSheet, id: Date.now(), hours: Number(newSheet.hours) },
    ]);
    setNewSheet({ employee: "", project: "", hours: "", status: "Pending" });
  };

  const handleDelete = (id) => {
    setTimesheets(timesheets.filter((t) => t.id !== id));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-blue-700">
          Company Admin
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-4">
            <li className="flex items-center gap-2 cursor-pointer hover:text-blue-300">
              <FaClock /> Dashboard
            </li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-blue-300">
              <FaUsers /> Employees
            </li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-blue-300">
              <FaFileAlt /> Timesheets
            </li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-blue-300">
              <FaChartBar /> Reports
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Timesheet Management</h1>
          <div className="flex items-center gap-3">
            <span className="font-medium">Admin</span>
            <img
              src="https://i.pravatar.cc/40"
              alt="profile"
              className="rounded-full w-10 h-10"
            />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Timesheets</h2>

          {/* Timesheet Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-3 border">Employee</th>
                  <th className="p-3 border">Project</th>
                  <th className="p-3 border">Hours</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timesheets.map((sheet) => (
                  <tr key={sheet.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{sheet.employee}</td>
                    <td className="p-3 border">{sheet.project}</td>
                    <td className="p-3 border">{sheet.hours}</td>
                    <td className="p-3 border">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          sheet.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {sheet.status}
                      </span>
                    </td>
                    <td className="p-3 border">
                      <button
                        onClick={() => handleDelete(sheet.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Timesheet Form */}
          <div className="mt-6 bg-white p-4 shadow rounded-lg">
            <h3 className="font-semibold mb-3">Add Timesheet</h3>
            <div className="grid grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Employee"
                value={newSheet.employee}
                onChange={(e) =>
                  setNewSheet({ ...newSheet, employee: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Project"
                value={newSheet.project}
                onChange={(e) =>
                  setNewSheet({ ...newSheet, project: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Hours"
                value={newSheet.hours}
                onChange={(e) =>
                  setNewSheet({ ...newSheet, hours: e.target.value })
                }
                className="border p-2 rounded"
              />
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
