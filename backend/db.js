import express from "express";
import cors from "cors";
import mysql from "mysql2";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import {
  addMember,
  getMembers,
  deleteMember,
  updateMember,
  getMembersByEmail,
  getMemberById,
  login,
} from "./controller/memberController.js";
import { createHrProjects, assignTeamLead } from "./controller/hrController.js";
import {
  addHourDetail,
  getHourDetailsByMonth,
  insertApprovalStatus,
  getHourDetailsByMonthForCeo,
} from "./controller/timesheetContoller.js";
import {
  addProjects,
  getProjects,
  updateProject,
  deleteProject,
} from "./controller/projectController.js";
import { requestPasswordReset, resetPassword } from "./controller/memberController.js";
dotenv.config();
const app = express();
app.use(express.json());

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
db.connect((err) => {
  if (err) {
    console.error("DB connection error:", err);
    return;
  }
  console.log("Connected to MySQL database");
});
app.post("/insertApprovalStatus/:timesheetId", insertApprovalStatus(db));
app.post("/members", addMember(db));
app.get("/api/members", getMembers(db));
app.get("/api/member/:id", getMemberById(db));
app.delete("/api/members/:id", deleteMember(db));
app.put("/api/members/:id", updateMember(db));
app.post("/addHourDetail", addHourDetail(db));
app.post("/api/projects", createHrProjects(db));
app.post("/api/assign", assignTeamLead(db));
app.get("/api/members/byEmail", getMembersByEmail(db));
app.get("/getHourDetailsByMonth", getHourDetailsByMonth(db));
app.post("/addProjects", addProjects(db));
app.post("/login", login(db));
app.get("/getProjects", getProjects(db));
app.put("/updateProject/:id", updateProject(db));
app.delete("/deleteProject/:project_id", deleteProject(db));
app.get("/getHourDetailsByMonthForCeo", getHourDetailsByMonthForCeo(db));
app.post("/forgot-password", requestPasswordReset(db));
app.post("/reset-password", resetPassword(db));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
