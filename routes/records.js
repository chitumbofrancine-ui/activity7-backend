const router = require("express").Router();
const pool = require("../db");

const COLUMNS = "id, title, category, description, status";
const STATUSES = ["Pending", "In progress", "Completed"];
const FIELDS = [
  { key: "title", label: "Title", min: 3, max: 80 },
  { key: "category", label: "Category", min: 2, max: 40 },
  { key: "description", label: "Description", min: 5, max: 300 }
];
const MAX_ID = 2147483647; // largest value the database INTEGER column can hold

function notFound(res) {
  return res.status(404).json({ message: "Record not found." });
}

// Returns a valid id, or sends the error response and returns null.
function readId(req, res) {
  if (!/^[1-9]\d*$/.test(req.params.id)) {
    res.status(400).json({ message: "ID must be a positive whole number." });
    return null;
  }
  const id = Number(req.params.id);
  if (id > MAX_ID) {
    notFound(res);
    return null;
  }
  return id;
}

// Returns the trimmed, validated fields, or sends the error response and returns null.
// Any client-supplied id is ignored because only the four editable fields are read.
function readBody(req, res) {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    res.status(400).json({ message: "Request body must be a JSON object." });
    return null;
  }

  const clean = {};
  const problems = [];

  for (const { key, label, min, max } of FIELDS) {
    if (typeof body[key] !== "string") {
      problems.push(`${label} is required and must be text.`);
      continue;
    }
    clean[key] = body[key].trim();
    if (clean[key].length < min || clean[key].length > max) {
      problems.push(`${label} must have ${min} to ${max} characters.`);
    }
  }

  if (typeof body.status !== "string") {
    problems.push("Status is required and must be text.");
  } else {
    clean.status = body.status.trim();
    if (!STATUSES.includes(clean.status)) {
      problems.push("Status must be Pending, In progress or Completed.");
    }
  }

  if (problems.length > 0) {
    res.status(400).json({ message: problems.join(" ") });
    return null;
  }
  return clean;
}

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT ${COLUMNS} FROM records ORDER BY id`);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = readId(req, res);
    if (id === null) return;
    const result = await pool.query(`SELECT ${COLUMNS} FROM records WHERE id = $1`, [id]);
    if (result.rowCount === 0) return notFound(res);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = readBody(req, res);
    if (data === null) return;
    const result = await pool.query(
      `INSERT INTO records (title, category, description, status)
       VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
      [data.title, data.category, data.description, data.status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = readId(req, res);
    if (id === null) return;
    const data = readBody(req, res);
    if (data === null) return;
    const result = await pool.query(
      `UPDATE records SET title = $1, category = $2, description = $3, status = $4
       WHERE id = $5 RETURNING ${COLUMNS}`,
      [data.title, data.category, data.description, data.status, id]
    );
    if (result.rowCount === 0) return notFound(res);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = readId(req, res);
    if (id === null) return;
    const result = await pool.query("DELETE FROM records WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) return notFound(res);
    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
