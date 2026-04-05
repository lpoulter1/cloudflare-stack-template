CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

INSERT INTO messages (content) VALUES ('Hello from D1!');
