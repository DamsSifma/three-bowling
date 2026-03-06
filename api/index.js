import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const app = express();
app.use(cors());
app.use(express.json());

// --- PostgreSQL connection ---
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "bowling",
  user: process.env.DB_USER || "bowling",
  password: process.env.DB_PASSWORD || "bowling",
});

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(100) NOT NULL DEFAULT 'Anonyme',
        total_score INTEGER NOT NULL,
        frames JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Database table 'scores' ready");
  } finally {
    client.release();
  }
}

// Save a score
app.post("/api/scores", async (req, res) => {
  try {
    const { playerName, totalScore, frames } = req.body;

    if (totalScore === undefined || !frames) {
      return res.status(400).json({ error: "Missing totalScore or frames" });
    }

    const result = await pool.query(
      "INSERT INTO scores (player_name, total_score, frames) VALUES ($1, $2, $3) RETURNING *",
      [playerName || "Anonyme", totalScore, JSON.stringify(frames)],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error saving score:", err);
    res.status(500).json({ error: "Failed to save score" });
  }
});

// Get leaderboard (top 10)
app.get("/api/scores", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM scores ORDER BY total_score DESC LIMIT 10",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching scores:", err);
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

// --- Start ---
const PORT = process.env.PORT || 3001;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to init DB, retrying in 3s...", err.message);
    setTimeout(() => {
      initDb().then(() => {
        app.listen(PORT, () => {
          console.log(`🚀 API running on port ${PORT}`);
        });
      });
    }, 3000);
  });
