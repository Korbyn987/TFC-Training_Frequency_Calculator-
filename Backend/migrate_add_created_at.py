import sqlite3

DB_PATH = "tfc_database.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

try:
    cur.execute("ALTER TABLE closed_workouts ADD COLUMN created_at TEXT;")
    print("Column 'created_at' added successfully.")
except Exception as e:
    print("Migration failed or column already exists:", e)

conn.commit()
conn.close()
