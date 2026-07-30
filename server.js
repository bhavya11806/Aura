/* ==========================================
   AURA DOSSIER BACKEND SERVER (Node.js & SQLite)
   ========================================== */

const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.db');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite:", err.message);
  } else {
    console.log("Connected to SQLite Database file:", DB_FILE);
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {
    // 1. Profiles Table
    db.run(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        data TEXT NOT NULL
      )
    `);

    // 2. Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL
      )
    `);
  });
}

// APIs
// Server status health check
app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", database: "sqlite3", file: DB_FILE });
});

// User Registration
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing email address or password." });
  }

  // Server-side email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    return res.status(400).json({ error: "Username must be a valid email address." });
  }

  // Server-side password validation
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: "Password must contain at least one uppercase letter." });
  }
  if (!/[a-z]/.test(password)) {
    return res.status(400).json({ error: "Password must contain at least one lowercase letter." });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ error: "Password must contain at least one number." });
  }
  if (!/[@$!%*?&]/.test(password)) {
    return res.status(400).json({ error: "Password must contain at least one special character." });
  }

  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Operator email is already registered." });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// User Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing email address or password." });
  }

  db.get(`SELECT password FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row && row.password === password) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid operator credentials." });
    }
  });
});

// Fetch all profiles for a user
app.get('/api/profiles', (req, res) => {
  const userId = req.query.userId || "guest";
  db.all(`SELECT id, userId, name, data FROM profiles WHERE userId = ?`, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const profiles = rows.map(r => ({
      id: r.id,
      userId: r.userId,
      name: r.name,
      data: JSON.parse(r.data)
    }));
    res.json(profiles);
  });
});

// Save or Update Profile
app.post('/api/profiles', (req, res) => {
  const { id, userId, name, data } = req.body;
  if (!id || !userId || !name || !data) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const dataStr = JSON.stringify(data);
  db.run(`
    INSERT INTO profiles (id, userId, name, data)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      data = excluded.data
  `, [id, userId, name, dataStr], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id });
  });
});

// Delete Profile
app.delete('/api/profiles/:id', (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM profiles WHERE id = ?`, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Clear All Profiles for a user
app.post('/api/profiles/clear-all', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId." });
  }
  db.run(`DELETE FROM profiles WHERE userId = ?`, [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Fallback to serve index.html for unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Listen
app.listen(PORT, () => {
  console.log(`
  ======================================================
  AURA PERSONNEL DATABASE LOCAL SYSTEM RUNNING
  ======================================================
  
  URL:         http://localhost:${PORT}
  DATABASE:    SQLite (database.db)
  DIRECTORY:   ${__dirname}
  
  Press Ctrl+C to terminate server session.
  ======================================================
  `);
});
