export const createHrProjects = (db) => (req, res) => {
  const { projectName, deadline, description, client } = req.body;

  if (!projectName || !deadline) {
    return res.status(400).json({ error: "Project Name and Deadline are required" });
  }

  const query = `
    INSERT INTO hr_projects (project_name, deadline, description, client)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [projectName, deadline, description, client], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ projectId: result.insertId });
  });
};


export const getHrProjects = (db) => (req, res) => {
  db.query("SELECT * FROM hr_projects ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const assignTeamLead = (db) => (req, res) => {
  console.log("Incoming body:", req.body); // 🔍 check request

  const { projectName, teamLeadName } = req.body;
  if (!projectName || !teamLeadName) {
    return res.status(400).json({ error: "Project Name and Team Lead are required" });
  }

  const query = "INSERT INTO assignments (project_name, team_lead_name) VALUES (?, ?)";
  db.query(query, [projectName, teamLeadName], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      assignmentId: result.insertId,
      message: "Team Lead assigned successfully",
    });
  });
};


// Optional: fetch all assignments
export const getAssignments = (req, res) => {
  db.query("SELECT * FROM assignments ORDER BY assigned_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};