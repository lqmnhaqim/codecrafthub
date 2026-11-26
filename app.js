/**
 * CodeCraftHub — Personalized Learning Platform API
 * Simple Express REST API with JSON-file storage (no database needed).
 *
 * Endpoints:
 *   POST   /api/courses      — add a new course
 *   GET    /api/courses      — get all courses
 *   GET    /api/courses/:id  — get a specific course
 *   PUT    /api/courses/:id  — update a course
 *   DELETE /api/courses/:id  — delete a course
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'courses.json');

// Allowed status values for a course
const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed'];

// ---------- Middleware ----------
app.use(express.json()); // parse JSON request bodies

// Serve the dashboard.html and other static files from this folder
app.use(express.static(__dirname));

// Allow the dashboard to call this API from other local origins (e.g. Live Server)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ---------- Data helpers (JSON file storage) ----------

// Read all courses from courses.json (creates the file if missing)
function readCourses() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Auto-create courses.json with an empty list on first run
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      console.log('- courses.json created automatically');
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('File read error:', err.message);
    throw new Error('Could not read courses.json');
  }
}

// Write the courses array back to courses.json
function writeCourses(courses) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(courses, null, 2));
  } catch (err) {
    console.error('File write error:', err.message);
    throw new Error('Could not write to courses.json');
  }
}

// Validate the body fields sent by the client
function validateCourse(body, { partial = false } = {}) {
  const errors = [];

  // status must always be one of the allowed values (if provided)
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (!partial) {
    // Full create: every required field must exist and be non-empty
    if (!body.name || !body.name.trim()) errors.push('name is required');
    if (!body.description || !body.description.trim()) errors.push('description is required');
    if (!body.target_date || !/^\d{4}-\d{2}-\d{2}$/.test(body.target_date)) {
      errors.push('target_date is required in YYYY-MM-DD format');
    }
    if (!body.status) errors.push('status is required');
  }

  // target_date format check when provided (for partial updates too)
  if (body.target_date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(body.target_date)) {
    errors.push('target_date must be in YYYY-MM-DD format');
  }

  return errors;
}

// ---------- Routes ----------

// POST /api/courses — add a new course
app.post('/api/courses', (req, res) => {
  const errors = validateCourse(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const courses = readCourses();

  // Auto-generate id starting from 1 (next free positive integer)
  const nextId = courses.reduce((max, c) => Math.max(max, c.id), 0) + 1;

  const course = {
    id: nextId,
    name: req.body.name.trim(),
    description: req.body.description.trim(),
    target_date: req.body.target_date,
    status: req.body.status,
    created_at: new Date().toISOString(),
  };

  courses.push(course);
  writeCourses(courses);
  res.status(201).json(course);
});

// GET /api/courses — get all courses
app.get('/api/courses', (req, res) => {
  const courses = readCourses();
  res.json(courses);
});

// GET /api/courses/:id — get a specific course
app.get('/api/courses/:id', (req, res) => {
  const courses = readCourses();
  const course = courses.find((c) => c.id === parseInt(req.params.id, 10));
  if (!course) {
    return res.status(404).json({ error: `Course with id ${req.params.id} not found` });
  }
  res.json(course);
});

// PUT /api/courses/:id — update a course (partial updates allowed)
app.put('/api/courses/:id', (req, res) => {
  const courses = readCourses();
  const course = courses.find((c) => c.id === parseInt(req.params.id, 10));
  if (!course) {
    return res.status(404).json({ error: `Course with id ${req.params.id} not found` });
  }

  const errors = validateCourse(req.body, { partial: true });
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Only update the fields that were provided
  if (req.body.name !== undefined) course.name = req.body.name.trim();
  if (req.body.description !== undefined) course.description = req.body.description.trim();
  if (req.body.target_date !== undefined) course.target_date = req.body.target_date;
  if (req.body.status !== undefined) course.status = req.body.status;

  writeCourses(courses);
  res.json(course);
});

// DELETE /api/courses/:id — delete a course
app.delete('/api/courses/:id', (req, res) => {
  const courses = readCourses();
  const index = courses.findIndex((c) => c.id === parseInt(req.params.id, 10));
  if (index === -1) {
    return res.status(404).json({ error: `Course with id ${req.params.id} not found` });
  }
  const deleted = courses.splice(index, 1)[0];
  writeCourses(courses);
  res.json({ message: 'Course deleted successfully', course: deleted });
});

// ---------- Start the server ----------
app.listen(PORT, () => {
  console.log('- CodeCraftHub API is starting...');
  console.log(`- Data will be stored in: ${DATA_FILE}`);
  console.log(`- API is available at: http://localhost:${PORT}`);
});
