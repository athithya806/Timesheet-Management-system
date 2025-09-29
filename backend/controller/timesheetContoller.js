// ➕ Add new employee hour details
// Example Express controller
// ➕ Add new or update employee hour details
export const addHourDetail = (db) => (req, res) => {
  const { date, checkIn, checkOut, overtime, status, hourBlocks, email } = req.body;

  console.log("Received email:", email);

  if (!email) return res.json({ success: false, error: "Email missing" });

  db.query("SELECT id FROM members WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!results.length) return res.json({ success: false, error: "Member not found" });

    const memberId = results[0].id;
    console.log("Fetched memberId:", memberId);

    if (!memberId || memberId === 0) {
      return res.json({ success: false, error: "Invalid memberId received" });
    }

    const query = `
      INSERT INTO timesheet (date, checkIn, checkOut, overtime, status, hourBlocks, memberId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        checkIn = VALUES(checkIn),
        checkOut = VALUES(checkOut),
        overtime = VALUES(overtime),
        status = VALUES(status),
        hourBlocks = VALUES(hourBlocks)
    `;

    db.query(
      query,
      [
        date,
        checkIn || null,
        checkOut || null,
        overtime || 0,
        status || "",
        JSON.stringify(hourBlocks || []),
        memberId,
      ],
      (err, result) => {
        if (err) {
          console.error("❌ Error saving timesheet:", err);
          return res.status(500).json({ success: false, error: err.message });
        }

        res.json({
          success: true,
          message: result.insertId
            ? "Timesheet inserted successfully"
            : "Timesheet updated successfully",
          data: result,
        });
      }
    );
  });
};


// Get existing hour detail by date + email

// ✏️ Update employee hour details
export const updateEmployeeHours = (db) => (req, res) => {
  const { userId, date } = req.params;
  const { checkIn, checkOut, overtime, globalStatus, dayStatus, hourBlocks } = req.body;

  const sql = `
    UPDATE employee_hours
    SET check_in = ?, check_out = ?, overtime = ?, global_status = ?, day_status = ?, hour_details = ?
    WHERE userId = ? AND date = ?
  `;
  db.query(
    sql,
    [
      checkIn,
      checkOut,
      overtime,
      globalStatus,
      dayStatus,
      JSON.stringify(hourBlocks),
      userId,
      date,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
};
export const getHourDetailsByMonthForCeo = (db) => (req, res) => {
  const query = `
    SELECT *
    FROM timesheet
    ORDER BY date ASC;
  `;

  db.query(query, (err, results) => {
    if (err) return res.json({ success: false, error: err.message });
    res.json({ success: true, data: results });
  });
};

// 📂 Get employee hours for a given month
export const getHourDetailsByMonth = (db) => (req, res) => {
  const { year, month, memberId } = req.query; // 👈 include memberId
  if (!memberId) return res.json({ success: false, error: "memberId required" });

  const startDate = `${year}-${String(Number(month) + 1).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(Number(month) + 1).padStart(2, "0")}-31`;

  const query = `
    SELECT * FROM timesheet
    WHERE memberId = ? AND date BETWEEN ? AND ?;
  `;
  db.query(query, [memberId, startDate, endDate], (err, results) => {
    if (err) return res.json({ success: false, error: err.message });
    res.json({ success: true, data: results });
  });
};

// routes/insertApprovalStatus.js
export const insertApprovalStatus = (db) => (req, res) => {
  const { timesheetId } = req.params; // timesheetId from route
  const { approval } = req.body; // 'Approved' or 'Rejected'

  if (!timesheetId || !approval) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Step 1: Fetch memberId from timesheet table
  const fetchMemberSql = `SELECT memberId FROM timesheet WHERE id = ?`;
  db.query(fetchMemberSql, [timesheetId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Timesheet not found" });

    const memberId = results[0].memberId;

    // Step 2: Insert into approvals table
    const insertSql = `
      INSERT INTO approvals (timesheetId, memberId, approvalStatus)
      VALUES (?, ?, ?)
    `;
    db.query(insertSql, [timesheetId, memberId, approval], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({
        success: true,
        message: "Approval inserted",
        approvalId: result.insertId,
      });
    });
  });
};
