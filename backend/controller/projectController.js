// controllers/projectController.js
// controllers/projectController.js

export const addProjects = (db) => (req, res) => {
  const {
    projectName,
    projectType,
    description,
    plannedStartDate,
    plannedEndDate,
    actualStartDate,
    actualEndDate,
    assignedMembers,
    status,
    phases, // array from frontend
  } = req.body;

  // Ensure phases JSON is in correct structure
  const formattedPhases = (phases || []).map((phase, idx) => ({
    phaseName: phase.phaseName || `Phase ${idx + 1}`,
    tasks: (phase.tasks || []).map((task, tIdx) => ({
      taskName: task.taskName || `Task ${tIdx + 1}`,
      assignedTo: task.assignedTo || "",
    })),
  }));

  const sql = `
    INSERT INTO projects 
    (project_name, project_type, description, planned_start_date, planned_end_date, actual_start_date, actual_end_date, assign_members, status, phases) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

  db.query(
    sql,
    [
      projectName,
      projectType,
      description,
      plannedStartDate || null,
      plannedEndDate || null,
      actualStartDate || null,
      actualEndDate || null,
      assignedMembers,
      status,
      JSON.stringify(formattedPhases),
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        message: "✅ Project created successfully!",
        projectId: result.insertId,
        phases: formattedPhases,
      });
    }
  );
};

export const getProjects = (db) => (req, res) => {
  const sql = "SELECT * FROM projects";

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const projects = rows.map((row) => ({
      id: row.project_id,
      projectName: row.project_name,
      projectType: row.project_type,
      description: row.description,
      plannedStartDate: row.planned_start_date,
      plannedEndDate: row.planned_end_date,
      actualStartDate: row.actual_start_date,
      actualEndDate: row.actual_end_date,
      assignedMembers: row.assign_members,
      status: row.status,
      phases: JSON.parse(row.phases || "[]"),
    }));

    res.json(projects);
  });
};

// Update Project
export const updateProject = (db) => (req, res) => {
  const { id } = req.params; // <-- use id
  const {
    projectName,
    projectType,
    description,
    plannedStartDate,
    plannedEndDate,
    actualStartDate,
    actualEndDate,
    assignedMembers,
    status,
    phases,
  } = req.body;

  const sql = `
    UPDATE projects 
    SET project_name=?, project_type=?, description=?, planned_start_date, planned_end_date, actual_start_date, actual_end_date assign_members=?, status=?, phases=? 
    WHERE project_id=?  -- your DB column is still project_id
  `;

  db.query(
    sql,
    [
      projectName,
      projectType,
      description,
      plannedStartDate,
      plannedEndDate,
      actualStartDate,
      actualEndDate,
      assignedMembers,
      status,
      JSON.stringify(phases),
      id,
    ], // <-- use id
    (err, result) => {
      console.log("Update result:", result);

      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) return res.status(404).json({ error: "Project not found" });

      res.json({ message: "✏️ Project updated successfully!" });
    }
  );
};

// Delete Project
// Delete Project
export const deleteProject = (db) => (req, res) => {
  const { project_id } = req.params; // make sure route uses :project_id

  const sql = `DELETE FROM projects WHERE project_id = ?`;

  db.query(sql, [project_id], (err, result) => {
    if (err) {
      console.error("Error deleting project:", err);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "🗑️ Project deleted successfully!", project_id });
  });
};
