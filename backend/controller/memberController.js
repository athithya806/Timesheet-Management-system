import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
// 🔑 Token generator
function generateToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}
export const getEmployeeCount = (db) => (req, res) => {
  const sql = "SELECT COUNT(*) AS totalEmployees FROM members";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ totalEmployees: results[0].totalEmployees });
  });
};

// ➕ Add new member
export const addMember = (db) => async (req, res) => {
  const { fullName, email, role, phone, department, password, imagePath } = req.body;

  try {
    if (!password) return res.status(400).json({ error: "Password is required" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save image from Base64
    let savedImagePath = null;
    if (imagePath) {
      const buffer = Buffer.from(imagePath, "base64");
      const imageName = `member_${Date.now()}.png`;
      const uploadDir = path.join("uploads", imageName);
      fs.writeFileSync(uploadDir, buffer);
      savedImagePath = `/uploads/${imageName}`;
    }

    const sqlInsert = `
      INSERT INTO members (fullName, email, phone, department, role, password, imagePath)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [fullName, email, phone, department, role, hashedPassword, savedImagePath];

    db.query(sqlInsert, values, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const empId = `TANSAMEMP${result.insertId.toString().padStart(3, "0")}`;

      db.query("UPDATE members SET empId = ? WHERE id = ?", [empId, result.insertId], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        res.status(201).json({
          message: "Member added successfully",
          empId,
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Get member by email
export const getMembersByEmail = (db) => (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, error: "Email is required" });

  const sql = "SELECT * FROM members WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (results.length === 0)
      return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: results[0] });
  });
};

// 🔍 Get member by ID
export const getMemberById = (db) => (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM members WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: "Member not found" });
    res.json(results[0]);
  });
};

// 📋 Get all members
export const getMembers = (db) => (req, res) => {
  const sql = "SELECT * FROM members";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// ❌ Delete a member
export const deleteMember = (db) => (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM members WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

// ✏️ Update a member
export const updateMember = (db) => async (req, res) => {
  const { id } = req.params;
  const { fullName, email, phone, empId, department, role, password, imagePath } = req.body;

  try {
    let savedImagePath = imagePath;

    if (imagePath && imagePath.length > 100) {
      const buffer = Buffer.from(imagePath, "base64");
      const imageName = `member_${Date.now()}.png`;
      const uploadDir = path.join("uploads", imageName);
      fs.writeFileSync(uploadDir, buffer);
      savedImagePath = `/uploads/${imageName}`;
    }

    let sql, values;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql = `
        UPDATE members
        SET fullName = ?, email = ?, phone = ?, empId = ?, department = ?, role = ?, password = ?, imagePath = ?
        WHERE id = ?
      `;
      values = [
        fullName,
        email,
        phone,
        empId,
        department,
        role,
        hashedPassword,
        savedImagePath,
        id,
      ];
    } else {
      sql = `
        UPDATE members
        SET fullName = ?, email = ?, phone = ?, empId = ?, department = ?, role = ?, imagePath = ?
        WHERE id = ?
      `;
      values = [fullName, email, phone, empId, department, role, savedImagePath, id];
    }

    db.query(sql, values, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔐 Login
export const login = (db) => async (req, res) => {
  const { email, password } = req.body;

  try {
    const sql = "SELECT * FROM members WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (results.length === 0) return res.status(401).json({ error: "Invalid credentials" });

      const user = results[0];
      let isMatch = false;

      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch {
        isMatch = false;
      }

      if (!isMatch && user.password === password) isMatch = true;
      if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

      res.json({
        email: user.email,
        role: user.role,
        imagePath: user.imagePath || null,
      });
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// 📧 Request password reset
export const requestPasswordReset = (db) => async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  db.query("SELECT * FROM members WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });

    const token = generateToken();
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    db.query(
      "UPDATE members SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
      [token, expiry, email],
      async (err2) => {
        if (err2) return res.status(500).json({ error: "DB update failed" });

        try {
          let transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,

            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
            // ⚠️ replace with app password
          });

          const resetLink = `http://localhost:3000/reset-password?token=${token}`;

          const mailOptions = {
            from: '"Your App Name"<${process.env.EMAIL_USER}>',
            to: email,
            subject: "Password Reset",
            html: `
              <p>Hello,</p>
              <p>Click the link below to reset your password. It expires in 15 minutes:</p>
              <a href="${resetLink}">${resetLink}</a>
            `,
          };

          const info = await transporter.sendMail(mailOptions);
          console.log("Mail sent: ", info.response);

          return res.json({ success: true, message: "Reset link sent to email" });
        } catch (mailError) {
          console.error("Mail sending failed:", mailError);
return res.status(500).json({ error: "Failed to send reset email" });
        }
      }
    );
  });
};

// 🔑 Reset password
export const resetPassword = (db) => async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: "Token and password required" });

  db.query("SELECT * FROM members WHERE reset_token = ?", [token], async (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (results.length === 0) return res.status(400).json({ error: "Invalid token" });

    const user = results[0];
    if (Date.now() > user.reset_token_expiry) {
      return res.status(400).json({ error: "Token expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "UPDATE members SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, user.id],
      (err2) => {
        if (err2) return res.status(500).json({ error: "DB update failed" });
        res.json({ success: true, message: "Password reset successful" });
      }
    );
  });
};
