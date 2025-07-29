
CREATE TABLE cycles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('focus', 'short_break', 'long_break')),
  duration_minutes INTEGER NOT NULL,
  planned_duration_minutes INTEGER NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT 0,
  started_at DATETIME NOT NULL,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
