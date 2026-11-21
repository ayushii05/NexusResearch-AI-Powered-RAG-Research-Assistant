import sqlite3
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

DB_PATH = "./nexusresearch.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    
    # Projects table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            user_id TEXT
        )
    """)
    
    # Check if user_id column exists in projects table (for migration)
    cursor.execute("PRAGMA table_info(projects)")
    columns = [row[1] for row in cursor.fetchall()]
    if "user_id" not in columns:
        try:
            cursor.execute("ALTER TABLE projects ADD COLUMN user_id TEXT")
        except Exception:
            pass
            
    # Messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            role TEXT,
            content TEXT,
            citations TEXT,
            created_at TEXT,
            FOREIGN KEY(project_id) REFERENCES projects(id)
        )
    """)
    
    conn.commit()
    conn.close()
    
    # Seed default demo user if not present
    seed_demo_user()

def seed_demo_user():
    try:
        from services.auth import hash_password
        demo_email = "demo@nexusresearch.ai"
        user = get_user_by_email(demo_email)
        if not user:
            demo_id = "user_demo_01"
            create_user(
                user_id=demo_id,
                name="Demo Researcher",
                email=demo_email,
                password_hash=hash_password("password123")
            )
    except Exception as e:
        print(f"Demo user seed notice: {e}")

def create_user(user_id: str, name: str, email: str, password_hash: str) -> Dict[str, Any]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    created_at = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
        (user_id, name, email.lower().strip(), password_hash, created_at)
    )
    conn.commit()
    conn.close()
    return {"id": user_id, "name": name, "email": email.lower().strip(), "created_at": created_at}

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password_hash, created_at FROM users WHERE LOWER(email) = ?", (email.lower().strip(),))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "password_hash": row["password_hash"],
            "created_at": row["created_at"]
        }
    return None

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password_hash, created_at FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "created_at": row["created_at"]
        }
    return None

def create_project(project_id: str, name: str, user_id: Optional[str] = None) -> Dict[str, Any]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    created_at = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        "INSERT INTO projects (id, name, created_at, user_id) VALUES (?, ?, ?, ?)",
        (project_id, name, created_at, user_id)
    )
    conn.commit()
    conn.close()
    return {"id": project_id, "name": name, "created_at": created_at, "user_id": user_id}

def get_projects(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    if user_id:
        cursor.execute(
            "SELECT id, name, created_at, user_id FROM projects WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC",
            (user_id,)
        )
    else:
        cursor.execute("SELECT id, name, created_at, user_id FROM projects ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": row["id"], "name": row["name"], "created_at": row["created_at"], "user_id": row["user_id"]} for row in rows]

# pyrefly: ignore [bad-function-definition]
def add_message(msg_id: str, project_id: str, role: str, content: str, citations: List[Dict[str, Any]] = None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    created_at = datetime.now(timezone.utc).isoformat()
    citations_json = json.dumps(citations) if citations else "[]"
    cursor.execute(
        "INSERT INTO messages (id, project_id, role, content, citations, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (msg_id, project_id, role, content, citations_json, created_at)
    )
    conn.commit()
    conn.close()

def get_messages(project_id: str) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, role, content, citations, created_at FROM messages WHERE project_id = ? ORDER BY created_at ASC", (project_id,))
    rows = cursor.fetchall()
    conn.close()
    
    messages = []
    for row in rows:
        messages.append({
            "id": row["id"],
            "role": row["role"],
            "content": row["content"],
            "citations": json.loads(row["citations"]),
            "created_at": row["created_at"]
        })
    return messages

def update_project_name(project_id: str, name: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE projects SET name = ? WHERE id = ?", (name, project_id))
    conn.commit()
    conn.close()
