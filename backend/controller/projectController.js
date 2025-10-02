// Add Project
export const addProjects = (db) => (req, res) => {
  const {
    projectName,
    clientName,
    projectType,
    description,
    plannedStartDate,
    plannedEndDate,
    actualStartDate,
    actualEndDate,
    assignedMembers,
    status,
    phases,
    departments, // ✅ Updated: array of departments
  } = req.body;

  if (!projectName || !description) {
    return res
      .status(400)
      .json({ error: "Project name and description are required" });
  }

  const assignedMembersJSON = JSON.stringify(assignedMembers || []);
  const phasesJSON = JSON.stringify(
    (phases || []).map((phase, idx) => ({
      phaseName: phase.phaseName || `Phase ${idx + 1}`,
      tasks: (phase.tasks || []).map((task, tIdx) => ({
        taskName: task.taskName || `Task ${tIdx + 1}`,
        assignedTo: task.assignedTo || "",
      })),
    }))
  );
  const departmentsJSON = JSON.stringify(departments || []);

  const sql = `
    INSERT INTO projects 
    (project_name, client_name, project_type, description, departments, planned_start_date, planned_end_date, actual_start_date, actual_end_date, status, assign_members, phases)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      projectName,
      clientName || null,
      projectType,
      description,
      departmentsJSON, // ✅ store as JSON
      plannedStartDate || null,
      plannedEndDate || null,
      actualStartDate || null,
      actualEndDate || null,
      status || "ongoing",
      assignedMembersJSON,
      phasesJSON,
    ],
    (err, result) => {
      if (err) {
        console.error("❌ MySQL insert error:", err);
        return res.status(500).json({ error: err.message });
      }

      res.json({
        message: "✅ Project created successfully!",
        projectId: result.insertId,
        phases: JSON.parse(phasesJSON),
      });
    }
  );
};

// Get Projects
export const getProjects = (db) => (req, res) => {
  const sql = "SELECT * FROM projects";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const projects = rows.map((row) => ({
      id: row.project_id,
      projectName: row.project_name,
      clientName: row.client_name,
      projectType: row.project_type,
      description: row.description,
      departments: row.departments ? JSON.parse(row.departments) : [], // ✅ parse JSON
      plannedStartDate: row.planned_start_date,
      plannedEndDate: row.planned_end_date,
      actualStartDate: row.actual_start_date,
      actualEndDate: row.actual_end_date,
      status: row.status,
      assignedMembers: row.assign_members ? JSON.parse(row.assign_members) : [],
      phases: row.phases ? JSON.parse(row.phases) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json(projects);
  });
};

// Update Project
export const updateProject = (db) => (req, res) => {
  const { id } = req.params;
  const {
    projectName,
    clientName,
    projectType,
    description,
    plannedStartDate,
    plannedEndDate,
    actualStartDate,
    actualEndDate,
    assignedMembers,
    status,
    phases,
    departments, // ✅ array
  } = req.body;

  const assignedMembersJSON = JSON.stringify(assignedMembers || []);
  const phasesJSON = JSON.stringify(phases || []);
  const departmentsJSON = JSON.stringify(departments || []);

  const sql = `
    UPDATE projects 
    SET 
      project_name=?,
      client_name=?,
      project_type=?,
      description=?,
      departments=?,
      planned_start_date=?,
      planned_end_date=?,
      actual_start_date=?,
      actual_end_date=?,
      status=?,
      assign_members=?,
      phases=?
    WHERE project_id=?
  `;

  db.query(
    sql,
    [
      projectName,
      clientName || null,
      projectType,
      description,
      departmentsJSON, // ✅ update as JSON
      plannedStartDate || null,
      plannedEndDate || null,
      actualStartDate || null,
      actualEndDate || null,
      status || "ongoing",
      assignedMembersJSON,
      phasesJSON,
      id,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Project not found" });

      res.json({ message: "✏️ Project updated successfully!" });
    }
  );
};

// Delete Project (no changes needed)
export const deleteProject = (db) => (req, res) => {
  const { project_id } = req.params;

  const sql = `DELETE FROM projects WHERE project_id = ?`;

  db.query(sql, [project_id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting project:", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ message: "🗑️ Project deleted successfully!", project_id });
  });
};
