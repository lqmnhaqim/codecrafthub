# CodeCraftHub — Learning Management Platform

A personalized learning platform where developers track the courses they want
to learn. Built as a learning project for REST API fundamentals.

## Project overview

CodeCraftHub lets a developer keep a simple list of learning goals: each course
has a name, description, target completion date, and current status
(Not Started / In Progress / Completed). The backend is a Node.js + Express
REST API that stores everything in a plain JSON file — no database required.

A single-file HTML dashboard (generated with Bolt) provides the CRUD interface
and talks to this API.

## Features

- Full CRUD REST API for courses
- JSON-file storage with automatic file creation (`courses.json`)
- Input validation (required fields, date format, allowed status values)
- Friendly error handling (404 for missing courses, 400 for bad input)
- CRUD dashboard UI (purple/amber theme) in a single HTML file

## Installation

```bash
mkdir codecrafthub
cd codecrafthub
npm install
```

## How to run

```bash
npm start
```

You should see:

```
- CodeCraftHub API is starting...
- Data will be stored in: /path/to/courses.json
- API is available at: http://localhost:5000
```

Then open `dashboard.html` in a browser (or use Live Server) to use the UI.

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/courses | Add a new course |
| GET | /api/courses | Get all courses |
| GET | /api/courses/:id | Get a specific course |
| PUT | /api/courses/:id | Update a course |
| DELETE | /api/courses/:id | Delete a course |

### Course fields

| Field | Type | Rules |
|-------|------|-------|
| id | number | auto-generated, starts at 1 |
| name | string | required |
| description | string | required |
| target_date | string | required, YYYY-MM-DD |
| status | string | required: "Not Started", "In Progress", "Completed" |
| created_at | string | auto-generated ISO timestamp |

### Examples

Add a course:

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"name":"Python Basics","description":"Learn Python fundamentals","target_date":"2025-12-31","status":"Not Started"}'
```

Get all courses:

```bash
curl http://localhost:5000/api/courses
```

Get one course:

```bash
curl http://localhost:5000/api/courses/1
```

Update a course status:

```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress"}'
```

Delete a course:

```bash
curl -X DELETE http://localhost:5000/api/courses/1
```

## Testing

Run the server with `npm start`, then execute the curl examples above in a
second terminal. Verify that:

- All endpoints return appropriate responses
- Data persists in `courses.json` after restarting the server
- Error handling works (try an invalid status or a missing course id)

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `EADDRINUSE: port 5000` | Another app uses port 5000 — stop it or change PORT in app.js |
| `Cannot find module 'express'` | Run `npm install` inside the project folder |
| Empty response from API | Make sure the server is still running |
| courses.json corrupted | Delete the file — it is recreated automatically on next start |

## Project structure

```
codecrafthub/
├── app.js          # Express REST API (all CRUD routes)
├── dashboard.html  # Bolt-generated CRUD dashboard UI
├── courses.json    # Data storage (created automatically)
├── package.json    # Project metadata + dependencies
└── README.md       # This file
```
